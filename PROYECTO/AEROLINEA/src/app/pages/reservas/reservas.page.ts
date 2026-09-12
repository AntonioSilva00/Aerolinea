import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { Vuelo } from '../../interfaces/aerolinea.models';

import { addIcons } from 'ionicons';
import {
  airplane,
  calendarOutline,
  logOutOutline,
  peopleOutline
} from 'ionicons/icons';

import {
  ToastController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonSpinner
} from '@ionic/angular';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonSpinner
  ]
})
export class ReservasPage implements OnInit {

  // ==========================================
  // DATOS
  // ==========================================

  vuelos: Vuelo[] = [];

  // Estado de carga
  cargando = true;

  // Evita múltiples reservas al mismo tiempo
  reservando = false;

  // Guarda el vuelo que se está reservando
  vueloReservando: number | null = null;


  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {

    // Registrar iconos
    addIcons({
      airplane,
      calendarOutline,
      logOutOutline,
      peopleOutline
    });

  }


  // ==========================================
  // INICIO
  // ==========================================

  async ngOnInit() {
    await this.cargarVuelos();
  }


  // ==========================================
  // CARGAR VUELOS
  // ==========================================

  async cargarVuelos() {

    console.log('✈️ Iniciando consulta de vuelos...');

    this.cargando = true;

    try {

      const resultado = await this.apiService.getVuelos();

      console.log('📦 Respuesta de vuelos:', resultado);

      // Verificamos que realmente sea un arreglo
      if (Array.isArray(resultado)) {

        this.vuelos = resultado;

        console.log(
          `✅ Vuelos cargados: ${this.vuelos.length}`
        );

      } else {

        console.error(
          '❌ La API no devolvió un arreglo:',
          resultado
        );

        this.vuelos = [];

        await this.mostrarMensaje(
          'La API devolvió un formato incorrecto.'
        );
      }

    } catch (error) {

      console.error(
        '❌ Error al cargar vuelos:',
        error
      );

      this.vuelos = [];

      await this.mostrarMensaje(
        'No se pudieron cargar los vuelos.'
      );

    } finally {

      // IMPORTANTE:
      // Siempre se ejecuta aunque haya error
      this.cargando = false;

      console.log(
        '🏁 Consulta de vuelos terminada'
      );
    }
  }


  // ==========================================
  // RESERVAR VUELO
  // ==========================================

  async reservar(vuelo_id: number) {

    // Evitar doble clic
    if (this.reservando) {
      return;
    }

    console.log(
      '🛫 Intentando reservar vuelo:',
      vuelo_id
    );

    this.reservando = true;
    this.vueloReservando = vuelo_id;

    try {

      await this.apiService.crearReserva({

        vuelo_id: vuelo_id,

        pasajeros: 1,

        asiento: '12A'

      });

      console.log(
        '✅ Reserva creada correctamente'
      );

      await this.mostrarMensaje(
        '¡Reserva confirmada exitosamente!'
      );


      // ======================================
      // ACTUALIZAR VUELOS
      // ======================================

      console.log(
        '🔄 Actualizando disponibilidad...'
      );

      await this.cargarVuelos();

      console.log(
        '✅ Disponibilidad actualizada'
      );


    } catch (error) {

      console.error(
        '❌ Error al crear reserva:',
        error
      );

      await this.mostrarMensaje(
        'Error al procesar la reserva. Verifica tu sesión.'
      );

    } finally {

      this.reservando = false;

      this.vueloReservando = null;

    }
  }


  // ==========================================
  // MENSAJE
  // ==========================================

  async mostrarMensaje(mensaje: string) {

    const toast = await this.toastCtrl.create({

      message: mensaje,

      duration: 3000,

      position: 'bottom'

    });

    await toast.present();
  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  cerrarSesion() {

    localStorage.removeItem('auth_token');

    this.router.navigate(['/login']);

  }

}