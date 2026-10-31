export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}


export interface Vuelo {
  id: number;
  origen: string;
  destino: string;
  fecha_salida: string;
  fecha_llegada: string;
  precio: number;
  capacidad: number;
  estado: 'disponible' | 'cancelado' | 'finalizado';
  fecha_creacion?: string;
}


export interface Reserva {
  vuelo_id: number;
  pasajeros: number;
  asiento: string;
}