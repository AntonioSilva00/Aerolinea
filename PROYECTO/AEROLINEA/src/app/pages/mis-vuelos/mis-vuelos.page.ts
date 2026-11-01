
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

    window.addEventListener('online', this.onOnline);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    window.removeEventListener('online', this.onOnline);
    document.removeEventListener('visibilitychange', this.onVisible);
  }

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

  restante(v: Viaje): string {
    const fecha = new Date(
      v.fecha_salida.replace(' ', 'T') + '-06:00'
    ).getTime();

    const diferencia = fecha - this.ahora;

    if (diferencia <= 0) {
      return 'Salida alcanzada';
    }

    const dias = Math.floor(diferencia / 86400000);
    const horas = Math.floor(
      (diferencia % 86400000) / 3600000
    );
    const minutos = Math.floor(
      (diferencia % 3600000) / 60000
    );

    return `${dias}d ${horas}h ${minutos}min`;
  }

  disponible(v: Viaje): boolean {
    const fecha = new Date(
      v.fecha_salida.replace(' ', 'T') + '-06:00'
    ).getTime();

    const diferencia = fecha - this.ahora;

    return (
      !this.store.offline &&
      v.estado === 'disponible' &&
      diferencia > 0 &&
      diferencia <= 86400000
    );
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

  trackByReserva(
    index: number,
    vuelo: Viaje
  ): number {
    return vuelo.reserva_id;
  }
}
