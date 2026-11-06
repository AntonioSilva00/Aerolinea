
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import axios from 'axios';

import {
  ToastController,
  IonContent,
  IonInput,
  IonIcon,
  IonSpinner
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  airplane,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonIcon,
    IonSpinner
  ]
})
export class LoginPage {

  email = '';
  password = '';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({
      airplane,
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      shieldCheckmarkOutline
    });
  }

  alternarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async onLogin(): Promise<void> {
    if (this.cargando) return;

    const correo = this.email.trim();

    if (!correo || !this.password.trim()) {
      await this.mostrarMensaje('Completa todos los campos');
      return;
    }

    this.cargando = true;

    try {
      const respuesta = await this.apiService.login(
        correo,
        this.password
      );

      if (respuesta.success && respuesta.token) {
        localStorage.setItem('auth_token', respuesta.token);
        localStorage.setItem(
          'usuario',
          JSON.stringify(respuesta.usuario)
        );

        await this.router.navigate(['/reservas']);
      } else {
        await this.mostrarMensaje(
          respuesta.message || 'No se pudo iniciar sesión'
        );
      }

    } catch (error: unknown) {
      console.error('[LOGIN] Error:', error);

      let mensaje = 'No se pudo conectar con el servidor';

      if (axios.isAxiosError(error)) {
        const estado = error.response?.status;
        const mensajeServidor = error.response?.data?.message;

        if (estado === 401) {
          mensaje = mensajeServidor ||
            'Correo o contraseña incorrectos';
        } else if (estado === 403) {
          mensaje = mensajeServidor ||
            'Debes verificar tu correo antes de iniciar sesión';
        } else if (estado === 404) {
          mensaje = 'No se encontró el archivo login.php';
        } else if (estado && estado >= 500) {
          mensaje = mensajeServidor ||
            'Error interno del servidor PHP';
        } else if (error.code === 'ECONNABORTED') {
          mensaje = 'El servidor tardó demasiado en responder';
        } else if (error.code === 'ERR_NETWORK') {
          mensaje = 'Error de red: revisa la conexión con el servidor';
        } else {
          mensaje = mensajeServidor || error.message || mensaje;
        }

      } else if (error instanceof Error) {
        mensaje = error.message;
      }

      await this.mostrarMensaje(mensaje);

    } finally {
      this.cargando = false;
    }
  }

  async mostrarMensaje(
    mensaje: string,
    color: 'success' | 'danger' = 'danger'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color
    });

    await toast.present();
  }
}
