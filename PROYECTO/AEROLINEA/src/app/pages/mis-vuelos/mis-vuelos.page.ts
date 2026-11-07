
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  airplaneOutline,
  pawOutline,
  personOutline,
  refreshOutline,
  chevronForwardOutline,
  cloudOfflineOutline,
  logOutOutline,
  arrowBackOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

import { ViajesStoreService } from '../../services/viajes-store.service';
import { Viaje, PasajeroViaje } from '../../models/viajes.model';

@Component({
  selector: 'app-mis-vuelos',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './mis-vuelos.page.html',
  styleUrls: ['./mis-vuelos.page.scss']
})
export class MisVuelosPage implements OnInit, OnDestroy {

  ahora = Date.now();
  cargando = false;
  procesando: number | null = null;
  mensaje = '';

  vuelos: Viaje[] = [];

  private timer?: ReturnType<typeof setInterval>;

  constructor(
    public store: ViajesStoreService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    addIcons({
      airplaneOutline,
      pawOutline,
      personOutline,
      logOutOutline,
      arrowBackOutline,
      refreshOutline,
      chevronForwardOutline,
      cloudOfflineOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit(): void {
    void this.actualizar();

    this.timer = setInterval(() => {
      this.zone.run(() => {
        this.ahora = Date.now();
        this.cdr.detectChanges();
      });
    }, 30000);
this.sincronizador = setInterval(() => {
  if (navigator.onLine && !this.cargando) {
    void this.actualizar();
  }
}, 60000);
    window.addEventListener('online', this.onOnline);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
if (this.sincronizador) {
  clearInterval(this.sincronizador);
}
    window.removeEventListener('online', this.onOnline);
    document.removeEventListener('visibilitychange', this.onVisible);
  }
private sincronizador?: ReturnType<typeof setInterval>;
  private onOnline = (): void => {
    void this.actualizar();
  };

  private onVisible = (): void => {
    if (!document.hidden) {
      void this.actualizar();
    }
  };

  async actualizar(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      await this.store.cargar();

      this.zone.run(() => {
        this.vuelos = [...this.store.viajes];

        console.log(
          '[MIS VUELOS] Vuelos para mostrar:',
          this.vuelos
        );

        this.cdr.detectChanges();
      });

    } catch (error) {
      console.error('[MIS VUELOS] Error:', error);

      this.zone.run(() => {
        this.mensaje = 'No se pudieron cargar los vuelos.';
        this.vuelos = [...this.store.viajes];
        this.cdr.detectChanges();
      });

    } finally {
      this.zone.run(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      });
    }
  }
private salidaEfectiva(v: Viaje): number {
  const fecha = v.fecha_salida_estimada || v.fecha_salida;

  return new Date(
    fecha.replace(' ', 'T') + '-06:00'
  ).getTime();
}
restante(v: Viaje): string {
  const diferencia = this.salidaEfectiva(v) - this.ahora;

  if (diferencia <= 0) {
    return 'Salida alcanzada';
  }

  const dias = Math.floor(diferencia / 86400000);
  const horas = Math.floor((diferencia % 86400000) / 3600000);
  const minutos = Math.floor((diferencia % 3600000) / 60000);

  return `${dias}d ${horas}h ${minutos}min`;
}
disponible(v: Viaje): boolean {
  if (this.store.offline) {
    return false;
  }

  const estado = (v.estado || '').toLowerCase();
  const situacion = (
    v.situacion_operativa || ''
  ).toLowerCase();

  if (
    estado === 'cancelado' ||
    situacion === 'cancelado'
  ) {
    return false;
  }

  return v.checkin_habilitado === true;
}

  async checkin(v: Viaje, p: PasajeroViaje): Promise<void> {
    this.procesando = p.reserva_pasajero_id;
    this.mensaje = '';

    try {
      await this.store.checkin(p.reserva_pasajero_id);

      this.mensaje = 'Check-in completado correctamente';

      await this.actualizar();

    } catch (error: any) {
      this.mensaje =
        error?.response?.data?.message ||
        'No se pudo realizar el check-in';

    } finally {
      this.procesando = null;
      this.cdr.detectChanges();
    }
  }

  abrirPase(v: Viaje, p: PasajeroViaje): void {
    void this.router.navigate([
      '/pase-abordar',
      v.reserva_id,
      p.reserva_pasajero_id
    ]);
  }
  // ========================================
  // CERRAR SESIÓN
  // ========================================

  cerrarSesion(): void {

    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');

    void this.router.navigate(['/login']);
  }
  volver(): void {
    void this.router.navigate(['/reservas']);
  }
  trackByReserva(
    index: number,
    vuelo: Viaje
  ): number {
    return vuelo.reserva_id;
  }
}
