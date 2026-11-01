import { Injectable } from '@angular/core';
import { Viaje } from '../models/viajes.model';
import { ViajesApiService } from './viajes-api.service';
import { ViajesCacheService } from './viajes-cache.service';
@Injectable({providedIn:'root'})
export class ViajesStoreService {
 async checkin(reserva_pasajero_id: number): Promise<void> {
  await this.api.checkin(reserva_pasajero_id);
  await this.cargar();
}
 viajes:Viaje[]=[]; sincronizadoEn:string|null=null; offline=false; error='';
 constructor(private api:ViajesApiService,private cache:ViajesCacheService){}
 private userKey():string {
   // IMPORTANTE: el backend debe exponer un ID autenticado estable. Esta clave es provisional.
   // Nunca usarla como prueba de autorización: la API usa el token verificado.
   const raw=localStorage.getItem('usuario');
   try {const u=JSON.parse(raw||'{}');return String(u.id??u.usuario?.id??'');}catch{return '';}
 }
async cargar(): Promise<void> {
  console.log('[VIAJES] Iniciando carga');

  const key = this.userKey();
  console.log('[VIAJES] Usuario ID:', key);

  const saved = key ? await this.cache.leer(key) : null;

  if (saved) {
    this.viajes = saved.data.reservas;
    this.sincronizadoEn = saved.syncedAt;
    console.log('[VIAJES] Caché recuperada:', this.viajes);
  }

  if (!navigator.onLine) {
    this.offline = true;
    this.error = 'Sin conexión: mostrando última copia guardada';
    return;
  }

  try {
    console.log('[VIAJES] Consultando API...');

    const data = await this.api.listar();

    console.log('[VIAJES] Respuesta API:', data);

    this.viajes = data.reservas;
    this.sincronizadoEn = new Date().toISOString();
    this.offline = false;
    this.error = '';

    if (key) {
      await this.cache.guardar(key, data);
      console.log('[VIAJES] Caché guardada');
    }
  } catch (e: any) {
    console.error('[VIAJES] Error:', e);

    this.offline = true;
    this.error =
      e?.response?.status === 401
        ? 'Sesión vencida. Inicia sesión de nuevo.'
        : 'No se pudo actualizar. Mostrando información guardada.';
  }
      }
    }