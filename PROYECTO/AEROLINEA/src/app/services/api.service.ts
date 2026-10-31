import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { Vuelo, Reserva } from '../interfaces/aerolinea.models';
import { Capacitor } from '@capacitor/core';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: this.getDynamicBaseUrl(),
      headers: { 'Content-Type': 'application/json' }
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
  const host = Capacitor.isNativePlatform()
    ? '192.168.1.9'
    : window.location.hostname;

  const url = `http://${host}/api_aerolinea/`;

  console.log('[API] Plataforma:', Capacitor.getPlatform());
  console.log('[API] URL:', url);

  return url;
}

  // Las rutas deben empezar SIN diagonal para que tomen correctamente el baseURL
  async register(data: { nombre: string; email: string; password: string }) {
    const response = await this.api.post('register.php', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('login.php', { email, password });
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async getVuelos(): Promise<Vuelo[]> {
    const response = await this.api.get('vuelos.php');
    return response.data;
  }

  async crearReserva(reserva: Reserva) {
    const response = await this.api.post('reservas.php', reserva);
    return response.data;
  }
}