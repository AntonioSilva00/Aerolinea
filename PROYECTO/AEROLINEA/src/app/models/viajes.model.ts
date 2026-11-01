export interface Pase { pase_id:number|null; codigo_pase:string|null; qr_payload:string|null; puerta:string|null; hora_embarque:string|null; pase_estado:'emitido'|'actualizado'|'revocado'|null; version:number|null; actualizado_en:string|null; }
export interface PasajeroViaje extends Pase { reserva_pasajero_id:number; nombres:string; apellidos:string; tipo_pasajero:string; asiento:string|null; checkin_id:number|null; checkin_estado:string|null; }
export interface MascotaViaje { nombre:string; especie:string; raza:string|null; modalidad:string; estado:string; tarifa:string; }
export interface Actualizacion { tipo:string; descripcion:string|null; valor_anterior:string|null; valor_nuevo:string; creado_en:string; }

export interface Viaje {
  // Información de la reserva
  reserva_id: number;
  codigo_reserva: string;
  total_pagado: string;

  // Información del vuelo
  vuelo_id: number;
  origen: string;
  destino: string;

  // Fechas programadas
  fecha_salida: string;
  fecha_llegada: string;

  // Afectaciones y modificaciones
  fecha_salida_estimada: string | null;
  puerta_embarque: string | null;
  situacion_operativa: string | null;

  // Estado del vuelo
  estado: string;

  // Pasajeros y mascotas
  pasajeros: PasajeroViaje[];
  mascotas: MascotaViaje[];

  // Historial de actualizaciones
  actualizaciones: Actualizacion[];

  // Control de salida y check-in
  segundos_para_salida: number;
  checkin_habilitado: boolean;

  // Zona horaria
  zona_horaria: string;
}
export interface ViajesResponse { reservas:Viaje[]; servidor_fecha:string; }
