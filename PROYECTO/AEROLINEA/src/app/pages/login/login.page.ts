
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import axios from 'axios';

import {
  ToastController,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle
} from '@ionic/angular';

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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonTitle
  ]
})
export class LoginPage {

  email: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async onLogin(): Promise<void> {

    if (this.cargando) {
      return;
    }

    const correo = this.email.trim();

    if (!correo || !this.password.trim()) {
      await this.mostrarMensaje('Completa todos los campos');
      return;
    }

    this.cargando = true;

    try {

      console.log('[LOGIN] Iniciando solicitud al servidor');


const respuesta = await this.apiService.login(
  this.email,
  this.password
);

if (respuesta.success && respuesta.token) {

  localStorage.setItem(
    'auth_token',
    respuesta.token
  );

  localStorage.setItem(
    'usuario',
    JSON.stringify(respuesta.usuario)
  );

  await this.router.navigate(['/mis-vuelos']);

} else {
  console.error('No se pudo iniciar sesión');
}


    } catch (error: unknown) {

      console.error('[LOGIN] Error completo:', error);

      let mensaje = 'No se pudo conectar con el servidor';

      if (axios.isAxiosError(error)) {

        console.error('[LOGIN] Código Axios:', error.code);
        console.error('[LOGIN] Mensaje:', error.message);
        console.error('[LOGIN] URL base:', error.config?.baseURL);
        console.error('[LOGIN] Ruta:', error.config?.url);
        console.error('[LOGIN] Estado HTTP:', error.response?.status);

        const estado = error.response?.status;
        const mensajeServidor = error.response?.data?.message;

        if (estado === 401) {

          mensaje = mensajeServidor ||
            'Correo o contraseña incorrectos';

        } else if (estado === 404) {

          mensaje = 'No se encontró el archivo login.php';

        } else if (estado && estado >= 500) {

          mensaje = mensajeServidor ||
            'Error interno del servidor PHP';

        } else if (error.code === 'ECONNABORTED') {

          mensaje = 'El servidor tardó demasiado en responder';

        } else if (error.code === 'ERR_NETWORK') {

          mensaje = 'Error de red: revisa la IP, HTTP y permisos de Android';

        } else {

          mensaje = mensajeServidor ||
            error.message ||
            mensaje;

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
