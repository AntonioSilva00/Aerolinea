<?php
declare(strict_types=1);
require_once __DIR__ . '/cors.php';
require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(405, ['message' => 'Método no permitido']);
}

try {
    $pdo = db();
    $uid = userId($pdo);

    $data = json_decode(
        file_get_contents('php://input'),
        true
    );

    $rpId = filter_var(
        $data['reserva_pasajero_id'] ?? null,
        FILTER_VALIDATE_INT
    );

    if (!$rpId) {
        reply(422, ['message' => 'Pasajero inválido']);
    }

    $pdo->beginTransaction();

    // Buscar pasajero y verificar propietario de la reserva
    $q = $pdo->prepare("
        SELECT
            rp.id,
            rp.asiento,
            r.id AS reserva_id,
            v.id AS vuelo_id,
            v.fecha_salida,
            v.fecha_salida_estimada,
            v.estado,
            v.situacion_operativa
        FROM reserva_pasajeros rp
        JOIN reservas r
            ON r.id = rp.reserva_id
        JOIN vuelos v
            ON v.id = r.vuelo_id
        WHERE rp.id = ?
          AND r.usuario_id = ?
        FOR UPDATE
    ");

    $q->execute([$rpId, $uid]);
    $row = $q->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        $pdo->rollBack();
        reply(404, [
            'message' => 'Reserva no encontrada'
        ]);
    }

    // La mascota no bloquea el check-in del pasajero.
    // Su autorización permanece independiente.

    // Verificar estado del vuelo
    $estado = strtolower((string)$row['estado']);
    $situacion = strtolower(
        (string)($row['situacion_operativa'] ?? '')
    );

    if (
        $estado !== 'disponible' ||
        $situacion === 'cancelado'
    ) {
        $pdo->rollBack();
        reply(409, [
            'message' => 'El vuelo no permite check-in'
        ]);
    }

    // Usar salida estimada cuando exista una afectación
    $fechaSalida =
        $row['fecha_salida_estimada']
        ?: $row['fecha_salida'];

    $zona = new DateTimeZone('America/Monterrey');

    $ahora = new DateTimeImmutable('now', $zona);
    $salida = new DateTimeImmutable(
        $fechaSalida,
        $zona
    );

    $segundos =
        $salida->getTimestamp() -
        $ahora->getTimestamp();

    if ($segundos <= 0 || $segundos > 86400) {
        $pdo->rollBack();

        reply(409, [
            'message' =>
                'Check-in disponible dentro de las 24 horas anteriores a la salida'
        ]);
    }

    // Registrar check-in.
    // Requiere UNIQUE en check_ins.reserva_pasajero_id.
    $insert = $pdo->prepare("
        INSERT INTO check_ins (
            reserva_pasajero_id,
            estado,
            fecha_checkin,
            documento_verificado
        )
        VALUES (?, 'completado', NOW(), 0)
        ON DUPLICATE KEY UPDATE
            id = LAST_INSERT_ID(id),
            estado = 'completado'
    ");

    $insert->execute([$rpId]);

    $checkId = (int)$pdo->lastInsertId();

    // Buscar pase existente
    $find = $pdo->prepare("
        SELECT
            id,
            codigo_pase,
            qr_payload,
            estado
        FROM pases_abordar
        WHERE check_in_id = ?
        LIMIT 1
    ");

    $find->execute([$checkId]);
    $pase = $find->fetch(PDO::FETCH_ASSOC);

    if (!$pase) {

        $codigo = bin2hex(random_bytes(16));

        // Token opaco de demostración.
        // No contiene datos personales.
        $qrPayload =
            'SKYFLOW-DEMO:' .
            bin2hex(random_bytes(24));

        $insertPase = $pdo->prepare("
            INSERT INTO pases_abordar (
                check_in_id,
                codigo_pase,
                qr_payload,
                estado,
                version
            )
            VALUES (?, ?, ?, 'emitido', 1)
        ");

        $insertPase->execute([
            $checkId,
            $codigo,
            $qrPayload
        ]);

        $paseId = (int)$pdo->lastInsertId();

    } else {

        if ($pase['estado'] === 'revocado') {
            $pdo->rollBack();

            reply(409, [
                'message' => 'El pase fue revocado'
            ]);
        }

        $paseId = (int)$pase['id'];
        $codigo = $pase['codigo_pase'];
        $qrPayload = $pase['qr_payload'];
    }

    $pdo->commit();

    reply(200, [
        'success' => true,
        'message' => 'Check-in completado correctamente',
        'check_in_id' => $checkId,
        'pase_id' => $paseId,
        'codigo_pase' => $codigo,
        'qr_payload' => $qrPayload,
        'estado' => 'emitido'
    ]);

} catch (Throwable $e) {

    if (
        isset($pdo) &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    safeError($e);
}
