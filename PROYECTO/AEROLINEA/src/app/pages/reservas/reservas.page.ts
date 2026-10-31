
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { Vuelo } from '../../interfaces/aerolinea.models';

import { addIcons } from 'ionicons';

import {
  airplane,
  airplaneOutline,
  calendarOutline,
  logOutOutline,
  peopleOutline,
  searchOutline,
  closeOutline,
  arrowForwardOutline,
  refreshOutline
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
  IonSpinner,
  IonIcon,
  IonLabel,
  IonItem
} from '@ionic/angular';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonSpinner,
    IonIcon
  ]
})
export class ReservasPage implements OnInit {

  // LISTA DE VUELOS
  vuelos: Vuelo[] = [];

  // BUSCADOR
  busqueda: string = '';

  // ESTADOS
  cargando: boolean = true;
  reservando: boolean = false;
  vueloReservando: number | null = null;

  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({
      airplane,
      airplaneOutline,
      calendarOutline,
      logOutOutline,
      peopleOutline,
      searchOutline,
      closeOutline,
      arrowForwardOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    void this.cargarVuelos();
  }

  // ========================================
  // FILTRAR VUELOS POR ORIGEN O DESTINO
  // ========================================

  get vuelosFiltrados(): Vuelo[] {

    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      return this.vuelos;
    }

    return this.vuelos.filter(vuelo => {
      const origen = (vuelo.origen || '').toLowerCase();
      const destino = (vuelo.destino || '').toLowerCase();

      return (
        origen.includes(texto) ||
        destino.includes(texto)
      );
    });
  }

  // ========================================
  // IDENTIFICAR CADA VUELO EN EL HTML
  // ========================================

  trackByVuelo(index: number, vuelo: Vuelo): number {
    return vuelo.id;
  }

  // ========================================
  // FORMATEAR FECHAS DE MYSQL
  // ========================================

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return '';
    }

    // Convierte:
    // 2026-11-05 08:00:00
    // a:
    // 2026-11-05T08:00:00

    return fecha.replace(' ', 'T');
  }

  // ========================================
  // CONSULTAR VUELOS DESDE LA API
  // ========================================

  async cargarVuelos(): Promise<void> {

    console.log('✈️ Iniciando consulta de vuelos...');

    this.cargando = true;

    try {

      const resultado = await this.apiService.getVuelos();

      console.log('📦 Respuesta de vuelos:', resultado);

      if (Array.isArray(resultado)) {

        this.vuelos = resultado;

        console.log(
          '✅ Vuelos cargados:',
          this.vuelos.length
        );

        if (this.vuelos.length > 0) {
          console.log(
            '🔎 Primer vuelo recibido:',
            this.vuelos[0]
          );
        }

      } else {

        this.vuelos = [];

        console.error(
          '❌ La API no devolvió un arreglo:',
          resultado
        );

        await this.mostrarMensaje(
          'La API devolvió un formato incorrecto.',
          'danger'
        );
      }

    } catch (error: any) {

      console.error(
        '❌ Error al cargar vuelos:',
        error
      );

      this.vuelos = [];

      await this.mostrarMensaje(
        error?.response?.data?.message ||
        'No se pudieron cargar los vuelos.',
        'danger'
      );

    } finally {

      this.cargando = false;

      console.log(
        '🏁 Consulta de vuelos terminada'
      );
    }
  }

  // ========================================
  // REALIZAR RESERVA
  // ========================================

  async reservar(vuelo_id: number): Promise<void> {

    if (this.reservando) {
      return;
    }

    // Validar que el vuelo exista y esté disponible
    const vuelo = this.vuelos.find(v => v.id === vuelo_id);

    if (!vuelo) {
      await this.mostrarMensaje(
        'No se encontró el vuelo seleccionado.',
        'danger'
      );
      return;
    }

    if (vuelo.estado !== 'disponible' || vuelo.capacidad <= 0) {
      await this.mostrarMensaje(
        'Este vuelo no está disponible para reservar.',
        'danger'
      );
      return;
    }

    this.reservando = true;
    this.vueloReservando = vuelo_id;

    console.log('🛫 Intentando reservar vuelo:', vuelo_id);

    try {

      const resultado = await this.apiService.crearReserva({
        vuelo_id,
        pasajeros: 1,
        asiento: '12A'
      });

      if (resultado?.success === false) {
        throw new Error(
          resultado.message ||
          'No se pudo crear la reserva.'
        );
      }

      console.log(
        '✅ Reserva creada correctamente:',
        resultado
      );

      await this.mostrarMensaje(
        '¡Reserva confirmada exitosamente!',
        'success'
      );

      // Actualizar la lista después de reservar
      await this.cargarVuelos();

    } catch (error: any) {

      console.error(
        '❌ Error al crear reserva:',
        error
      );

      await this.mostrarMensaje(
        error?.response?.data?.message ||
        error?.message ||
        'Error al procesar la reserva.',
        'danger'
      );

    } finally {

      this.reservando = false;
      this.vueloReservando = null;
    }
  }

  // ========================================
  // MOSTRAR NOTIFICACIONES
  // ========================================

  async mostrarMensaje(
    mensaje: string,
    color: 'success' | 'danger' = 'success'
  ): Promise<void> {

    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color
    });

    await toast.present();
  }

  // ========================================
  // CERRAR SESIÓN
  // ========================================

  cerrarSesion(): void {

    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');

    void this.router.navigate(['/login']);
  }
}
export declare const expect: (actual: unknown) => any;

