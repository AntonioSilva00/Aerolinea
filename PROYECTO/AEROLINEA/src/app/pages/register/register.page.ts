import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { 
  ToastController, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonInput, IonButton, 
  IonText, IonHeader, IonToolbar, IonTitle 
} from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonContent, IonCard, 
    IonCardHeader, IonCardTitle, IonCardContent, IonItem, 
    IonInput, IonButton, IonText, IonHeader, IonToolbar, IonTitle
  ]
})
export class RegisterPage {
  nombre: string = '';
  email: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async onRegister() {
    if (!this.nombre || !this.email || !this.password) {
      this.mostrarMensaje('Completa todos los campos obligatorios', 'warning');
      return;
    }

    this.cargando = true;
    try {
      const response = await this.apiService.register({
        nombre: this.nombre,
        email: this.email,
        password: this.password
      });

      if (response.success) {
        this.mostrarMensaje('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
        this.router.navigate(['/login']);
      } else {
        this.mostrarMensaje(response.message || 'Error al registrar', 'danger');
      }
    } catch (error) {
      this.mostrarMensaje('Error de conexión con el servidor', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async mostrarMensaje(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}