export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface Vuelo {
  id: number;
  numero_vuelo: string;
  origen: string;
  destino: string;
  fecha_salida: string;
  precio: number;
  asientos_disponibles: number;
}

export interface Reserva {
  vuelo_id: number;
  pasajeros: number;
  asiento: string;
}