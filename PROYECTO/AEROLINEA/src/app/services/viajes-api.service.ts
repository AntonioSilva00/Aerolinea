
import { Injectable } from '@angular/core';
import { ViajesResponse } from '../models/viajes.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ViajesApiService {

  constructor(private api: ApiService) {}

  async listar(): Promise<ViajesResponse> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('No hay una sesión iniciada');
    }

    return await this.api.getMisVuelos();
  }

  async checkin(reserva_pasajero_id: number): Promise<void> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      throw new Error('No hay una sesión iniciada');
    }

    await this.api.realizarCheckin(reserva_pasajero_id);
  }
}
