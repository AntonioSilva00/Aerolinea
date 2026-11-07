
import { Injectable } from '@angular/core';
import { Viaje, ViajesResponse } from '../models/viajes.model';
import { ViajesApiService } from './viajes-api.service';
import { ViajesCacheService } from './viajes-cache.service';

@Injectable({
  providedIn: 'root'
})
export class ViajesStoreService {

  viajes: Viaje[] = [];
  sincronizadoEn: string | null = null;
  offline = false;
  error = '';

  private cargaActual?: Promise<void>;

  constructor(
    private api: ViajesApiService,
    private cache: ViajesCacheService
  ) {}

  private userKey(): string {
    const raw = localStorage.getItem('usuario');

    try {
      const u = JSON.parse(raw || '{}');
      return String(u.id ?? u.usuario?.id ?? '');
    } catch {
      return '';
    }
  }

  async cargar(): Promise<void> {
    if (this.cargaActual) {
      return this.cargaActual;
    }

    const tarea = this.cargarInternamente();
    this.cargaActual = tarea;

    try {
      await tarea;
    } finally {
      this.cargaActual = undefined;
    }
  }

  private async cargarInternamente(): Promise<void> {
    console.log('[VIAJES] Iniciando sincronización');

    const key = this.userKey();
console.log('[CACHE] ID usuario:', key);
console.log('[CACHE] ¿Se guardará?', Boolean(key));
    // Limpiar el estado anterior antes de recuperar datos.
    this.viajes = [];
    this.sincronizadoEn = null;
    this.error = '';

    if (key) {
      try {
        const saved = await this.cache.leer(key);

        if (saved && Array.isArray(saved.data?.reservas)) {
          this.viajes = saved.data.reservas;
          this.sincronizadoEn = saved.syncedAt;

          console.log('[VIAJES] Caché recuperada');
        }
      } catch (error) {
        console.warn('[VIAJES] Error leyendo caché:', error);
      }
    }

    if (!navigator.onLine) {
      this.offline = true;
      this.error = 'Sin conexión. Mostrando datos guardados.';
      return;
    }

    let data: ViajesResponse;

    // Consultar la API independientemente de SQLite.
    try {
      data = await this.api.listar();

      if (!data || !Array.isArray(data.reservas)) {
        throw new Error(
          'La API no devolvió una lista válida de reservas'
        );
      }
    } catch (error: any) {
      console.error('[VIAJES] Error consultando API:', {
        servidor: error?.config?.baseURL,
        endpoint: error?.config?.url,
        status: error?.response?.status,
        codigo: error?.code,
        mensaje: error?.message,
        respuesta: error?.response?.data
      });

      this.offline = true;

      if (error?.response?.status === 401) {
        this.error = 'Sesión vencida. Inicia sesión nuevamente.';
      } else {
        this.error =
          'No se pudo actualizar. Mostrando información guardada.';
      }

      return;
    }

    // La respuesta del servidor fue correcta.
    this.viajes = data.reservas;
    this.sincronizadoEn = new Date().toISOString();
    this.offline = false;
    this.error = '';

    console.log(
      '[VIAJES] Sincronización correcta:',
      this.viajes.length,
      'reservas'
    );

    // Guardar la caché sin alterar el estado de conexión.
    if (key) {
      try {
        await this.cache.guardar(key, data);
        console.log('[VIAJES] Caché actualizada');
      } catch (error) {
        console.warn(
          '[VIAJES] No se pudo guardar la caché:',
          error
        );
      }
    }
  }

  async checkin(reserva_pasajero_id: number): Promise<void> {
    if (this.offline) {
      throw new Error(
        'No se puede completar el check-in sin conexión al servidor.'
      );
    }

    await this.api.checkin(reserva_pasajero_id);
    await this.cargar();
  }
}
