
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  alertCircle,
  airplaneOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-verificar-correo',
  templateUrl: './verificar-correo.page.html',
  styleUrls: ['./verificar-correo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonSpinner,
    IonIcon
  ]
})
export class VerificarCorreoPage implements OnInit {

  cargando = true;
  verificado = false;
  mensaje = 'Estamos verificando tu correo electrónico...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    addIcons({
      checkmarkCircle,
      alertCircle,
      airplaneOutline,
      shieldCheckmarkOutline
    });
  }

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.cargando = false;
      this.mensaje = 'El enlace no contiene un token de verificación.';
      return;
    }

    try {
      const respuesta = await this.apiService.verificarCorreo(token);

      this.verificado =
        respuesta.success === true ||
        respuesta.ok === true;

      this.mensaje = this.verificado
        ? 'Tu cuenta de SkyFlow Club ha sido activada correctamente. Ya puedes iniciar sesión.'
        : 'No fue posible verificar tu correo electrónico.';

    } catch (error: any) {
      this.verificado = false;

      this.mensaje =
        error?.response?.data?.message ||
        'El enlace es inválido, ha vencido o ya fue utilizado.';

    } finally {
      this.cargando = false;
    }
  }

  irAlLogin() {
    this.router.navigateByUrl('/login');
  }
}
