
import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Vuelo, Reserva } from '../models/aerolinea.models';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api: AxiosInstance;
async getMisVuelos() {
  const response = await this.api.get('mis_vuelos.php');
  return response.data;
}

async realizarCheckin(reserva_pasajero_id: number): Promise<void> {
  await this.api.post('checkin.php', {
    reserva_pasajero_id
  });
}
  private readonly serverKey = 'skyflow_server';

  constructor() {
    this.api = axios.create({
      baseURL: this.getDynamicBaseUrl(),
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  private getDynamicBaseUrl(): string {
    const savedServer = localStorage.getItem(this.serverKey);

    if (savedServer) {
      return `${savedServer}/api_aerolinea/`;
    }

    if (!Capacitor.isNativePlatform()) {
      const host = window.location.hostname;

      const url = `${window.location.protocol}//${host}/api_aerolinea/`;

      console.log('[API] Navegador:', url);
      return url;
    }

    // Dirección inicial mientras se configura el servidor.
    return 'http://192.168.1.9/api_aerolinea/';
  }

  configurarServidor(direccion: string): void {
    const parsed = new URL(direccion);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Protocolo no permitido');
    }

    const servidor = parsed.origin;

    localStorage.setItem(this.serverKey, servidor);

    this.api.defaults.baseURL =
      `${servidor}/api_aerolinea/`;

    console.log('[API] Servidor configurado:', servidor);
  }

  obtenerServidor(): string {
    return this.api.defaults.baseURL || '';
  }

  async register(data: {
    nombre: string;
    email: string;
    password: string;
  }) {
    const response = await this.api.post('register.php', data);
    return response.data;
  }
async login(email: string, password: string) {
  const response = await this.api.post('login.php', {
    email,
    password
  });

  if (response.data.success && response.data.token) {
    localStorage.setItem('auth_token', response.data.token);

    localStorage.setItem(
      'usuario',
      JSON.stringify(response.data.usuario)
    );
  }

  return response.data;
}

  async getVuelos(): Promise<Vuelo[]> {
    const response = await this.api.get('vuelos.php');
    return response.data;
  }

  async crearReserva(reserva: Reserva) {
    const response = await this.api.post(
      'reservas.php',
      reserva
    );

    return response.data;
  }

  
}
