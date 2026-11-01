
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  refreshOutline,
  pawOutline,
  cloudOfflineOutline,
  qrCodeOutline
} from 'ionicons/icons';

import QRCode from 'qrcode';

import { ViajesStoreService } from '../../services/viajes-store.service';
import {
  Viaje,
  PasajeroViaje
} from '../../models/viajes.model';

@Component({
  selector: 'app-pase-abordar',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner
  ],
  templateUrl: './pase-abordar.page.html',
  styleUrls: ['./pase-abordar.page.scss']
})
export class PaseAbordarPage implements OnInit {

  viaje?: Viaje;
  pasajero?: PasajeroViaje;

  cargando = false;
  error = '';

  qrImagen: string | null = null;

  constructor(
    public store: ViajesStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    addIcons({
      arrowBackOutline,
      refreshOutline,
      pawOutline,
      cloudOfflineOutline,
      qrCodeOutline
    });
  }

  async ngOnInit(): Promise<void> {
    await this.actualizar();
  }

  async actualizar(): Promise<void> {
    this.cargando = true;
    this.error = '';
    this.qrImagen = null;

    try {
      await this.store.cargar();

      const reservaId = Number(
        this.route.snapshot.paramMap.get('reservaId')
      );

      const pasajeroId = Number(
        this.route.snapshot.paramMap.get('pasajeroId')
      );

      const viaje = this.store.viajes.find(
        v => Number(v.reserva_id) === reservaId
      );

      const pasajero = viaje?.pasajeros.find(
        p => Number(p.reserva_pasajero_id) === pasajeroId
      );

      if (!viaje || !pasajero) {
        throw new Error('No se encontró el pase solicitado.');
      }

      this.viaje = viaje;
      this.pasajero = pasajero;

  if (!pasajero.qr_payload) {
  throw new Error(
    'El pase no tiene un código QR registrado.'
  );
}

      // Identificador del pase registrado en MySQL.
      // No genera ni autoriza un pase nuevo.
      const contenidoQR = JSON.stringify({
        tipo: 'SKYFLOW_BOARDING_PASS',
        pase_id: pasajero.pase_id,
        reserva_id: viaje.reserva_id,
        reserva_pasajero_id: pasajero.reserva_pasajero_id
      });

   const imagen = await QRCode.toDataURL(
  pasajero.qr_payload,
  {
    errorCorrectionLevel: 'M',
    width: 320,
    margin: 2
  }
);

      this.zone.run(() => {
        this.qrImagen = imagen;
        this.cdr.detectChanges();
      });

    } catch (e: any) {
      this.zone.run(() => {
        this.error =
          e?.message || 'No se pudo cargar el pase de abordar.';
        this.cdr.detectChanges();
      });

    } finally {
      this.zone.run(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      });
    }
  }

  volver(): void {
    void this.router.navigate(['/mis-vuelos']);
  }
}
