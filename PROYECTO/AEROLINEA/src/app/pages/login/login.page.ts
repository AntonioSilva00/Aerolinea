import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { 
  ToastController, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonInput, IonButton, 
  IonText, IonIcon, IonHeader, IonToolbar, IonTitle 
} from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, IonContent, IonCard, 
    IonCardHeader, IonCardTitle, IonCardContent, IonItem, 
    IonInput, IonButton, IonText, IonIcon, IonHeader, 
    IonToolbar, IonTitle
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

  async onLogin() {
    if (!this.email || !this.password) {
      this.mostrarMensaje('Completa todos los campos');
      return;
    }
    
    this.cargando = true;
    try {
      const response = await this.apiService.login(this.email, this.password);
      if (response.success) {
        this.router.navigate(['/reservas']);
      } else {
        this.mostrarMensaje(response.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      this.mostrarMensaje('Error de conexión con el servidor');
    } finally {
      this.cargando = false;
    }
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }
}