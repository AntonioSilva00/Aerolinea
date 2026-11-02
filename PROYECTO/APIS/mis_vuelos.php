<?php
declare(strict_types=1);
require __DIR__.'/_bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') reply(405, ['message'=>'Método no permitido']);
try {
 $pdo=db(); $uid=userId($pdo);
 $q=$pdo->prepare("SELECT r.id reserva_id,r.codigo_reserva,r.total_pagado,r.fecha_reserva,
 v.id vuelo_id,v.origen,v.destino,v.fecha_salida,v.fecha_llegada,v.estado,
 v.fecha_salida_estimada,v.puerta_embarque,v.situacion_operativa
 FROM reservas r JOIN vuelos v ON v.id=r.vuelo_id WHERE r.usuario_id=? ORDER BY v.fecha_salida DESC");
 $q->execute([$uid]); $items=$q->fetchAll();
 $pass=$pdo->prepare("SELECT rp.id reserva_pasajero_id,rp.tipo_pasajero,rp.asiento,p.nombres,p.apellidos,
 c.id checkin_id,c.estado checkin_estado,b.id pase_id,b.codigo_pase,b.qr_payload,b.puerta,b.hora_embarque,b.estado pase_estado,b.version,b.actualizado_en
 FROM reserva_pasajeros rp JOIN pasajeros p ON p.id=rp.pasajero_id
 LEFT JOIN check_ins c ON c.reserva_pasajero_id=rp.id
 LEFT JOIN pases_abordar b ON b.check_in_id=c.id
 WHERE rp.reserva_id=? ORDER BY rp.id");
 $pets=$pdo->prepare("SELECT m.nombre,m.especie,m.raza,rm.modalidad,rm.estado,rm.tarifa
 FROM reserva_mascotas rm JOIN mascotas m ON m.id=rm.mascota_id WHERE rm.reserva_id=?");
 $events=$pdo->prepare("SELECT tipo,descripcion,valor_anterior,valor_nuevo,creado_en FROM actualizaciones_vuelo WHERE vuelo_id=? ORDER BY id DESC LIMIT 5");
 $now=new DateTimeImmutable('now',new DateTimeZone('America/Monterrey'));
 foreach ($items as &$item) {
   $pass->execute([$item['reserva_id']]); $item['pasajeros']=$pass->fetchAll();
   $pets->execute([$item['reserva_id']]); $item['mascotas']=$pets->fetchAll();
   $events->execute([$item['vuelo_id']]); $item['actualizaciones']=$events->fetchAll();
   $salida=new DateTimeImmutable($item['fecha_salida'],new DateTimeZone('America/Monterrey'));
   $seconds=$salida->getTimestamp()-$now->getTimestamp();
   $item['segundos_para_salida']=max(0,$seconds);
   $item['checkin_habilitado']=$seconds>0 && $seconds<=86400 && $item['estado']==='disponible';
   $item['zona_horaria']='America/Monterrey';
 }
 unset($item);
 reply(200,['reservas'=>$items,'servidor_fecha'=>$now->format(DATE_ATOM)]);
} catch(Throwable $e) { safeError($e); }
