import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Vuelo } from '../../models/aerolinea.models';
import { addIcons } from 'ionicons';
import {
  airplane, airplaneOutline, calendarOutline, logOutOutline,
  peopleOutline, searchOutline, closeOutline, arrowForwardOutline,
  refreshOutline, homeOutline, personCircleOutline, chevronBackOutline,
  chevronForwardOutline, ticketOutline, compassOutline
} from 'ionicons/icons';
import {
  ToastController, AlertController, IonHeader, IonToolbar, IonButtons,
  IonButton, IonContent, IonSpinner, IonIcon
} from '@ionic/angular';

interface DestinoSlide {
  titulo: string;
  destacado: string;
  descripcion: string;
  etiqueta: string;
  imagen: string;
}

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonButtons,
    IonButton, IonContent, IonSpinner, IonIcon]
})
export class ReservasPage implements OnInit, OnDestroy {
  vuelos: Vuelo[] = [];
  busqueda = '';
  cargando = true;
  reservando = false;
  vueloReservando: number | null = null;
  slideActual = 0;
  private intervaloCarrusel: ReturnType<typeof setInterval> | null = null;

  // Coloca estas imágenes en src/assets/destinos/.
  destinos: DestinoSlide[] = [
    { etiqueta: 'DESCUBRE MÉXICO', titulo: 'Tu próxima aventura', destacado: 'comienza aquí.', descripcion: 'Encuentra el vuelo ideal y explora nuevos horizontes.', imagen: 'assets/destinos/cancun.jpg' },
    { etiqueta: 'VIAJA CON SKYFLOW', titulo: 'Historias que empiezan', destacado: 'con un vuelo.', descripcion: 'Haz de tu siguiente destino un recuerdo inolvidable.', imagen: 'assets/destinos/ciudad-mexico.jpg' },
    { etiqueta: 'NUEVOS HORIZONTES', titulo: 'El mundo está', destacado: 'esperando por ti.', descripcion: 'Descubre los vuelos disponibles para tu próxima escapada.', imagen: 'assets/destinos/monterrey.jpg' }
  ];

  constructor(
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    addIcons({ airplane, airplaneOutline, calendarOutline, logOutOutline,
      peopleOutline, searchOutline, closeOutline, arrowForwardOutline,
      refreshOutline, homeOutline, personCircleOutline, chevronBackOutline,
      chevronForwardOutline, ticketOutline, compassOutline });
  }

  ngOnInit(): void {
    void this.cargarVuelos();
    this.iniciarCarrusel();
  }

  ngOnDestroy(): void { this.detenerCarrusel(); }

  get vuelosFiltrados(): Vuelo[] {
    const texto = this.busqueda.trim().toLocaleLowerCase('es');
    if (!texto) return this.vuelos;
    return this.vuelos.filter(v =>
      (v.origen || '').toLocaleLowerCase('es').includes(texto) ||
      (v.destino || '').toLocaleLowerCase('es').includes(texto)
    );
  }

  trackByVuelo(_index: number, vuelo: Vuelo): number { return vuelo.id; }
  formatearFecha(fecha: string): string { return fecha ? fecha.replace(' ', 'T') : ''; }

  private iniciarCarrusel(): void {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.detenerCarrusel();
    this.intervaloCarrusel = setInterval(() => {
      this.slideActual = (this.slideActual + 1) % this.destinos.length;
    }, 6500);
  }

  private detenerCarrusel(): void {
    if (this.intervaloCarrusel !== null) {
      clearInterval(this.intervaloCarrusel);
      this.intervaloCarrusel = null;
    }
  }

  seleccionarSlide(indice: number): void {
    this.slideActual = (indice + this.destinos.length) % this.destinos.length;
    this.iniciarCarrusel();
  }

  cambiarSlide(direccion: number): void {
    this.seleccionarSlide(this.slideActual + direccion);
  }

  irInicio(): void { void this.router.navigate(['/reservas']); }
  MisVuelos(): void { void this.router.navigate(['/mis-vuelos']); }
  // Ajusta la ruta cuando exista la página de perfil.
  irPerfil(): void { void this.router.navigate(['/perfil']); }

  async cargarVuelos(): Promise<void> {
    this.cargando = true;
    try {
      const resultado = await this.apiService.getVuelos();
      if (Array.isArray(resultado)) {
        this.vuelos = resultado;
      } else {
        this.vuelos = [];
        await this.mostrarMensaje('La API devolvió un formato incorrecto.', 'danger');
      }
    } catch (error: any) {
      this.vuelos = [];
      await this.mostrarMensaje(error?.response?.data?.message || 'No se pudieron cargar los vuelos.', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async reservar(vuelo_id: number): Promise<void> {
    if (this.reservando) return;
    const vuelo = this.vuelos.find(v => v.id === vuelo_id);
    if (!vuelo) {
      await this.mostrarMensaje('No se encontró el vuelo seleccionado.', 'danger');
      return;
    }
    if (vuelo.estado !== 'disponible' || vuelo.capacidad <= 0) {
      await this.mostrarMensaje('Este vuelo no está disponible para reservar.', 'danger');
      return;
    }
    this.reservando = true;
    this.vueloReservando = vuelo_id;
    try {
      const resultado = await this.apiService.crearReserva({ vuelo_id, pasajeros: 1, asiento: '12A' });
      if (resultado?.success === false) throw new Error(resultado.message || 'No se pudo crear la reserva.');
      await this.mostrarMensaje('¡Reserva confirmada exitosamente!', 'success');
      await this.cargarVuelos();
    } catch (error: any) {
      await this.mostrarMensaje(error?.response?.data?.message || error?.message || 'Error al procesar la reserva.', 'danger');
    } finally {
      this.reservando = false;
      this.vueloReservando = null;
    }
  }

  async mostrarMensaje(mensaje: string, color: 'success' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 3000, position: 'bottom', color });
    await toast.present();
  }

  async cerrarSesion(): Promise<void> {
    const alerta = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas salir de tu cuenta SkyFlow?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Cerrar sesión', role: 'destructive', handler: () => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('usuario');
          void this.router.navigate(['/login']);
        } }
      ]
    });
    await alerta.present();
  }
}
export declare const expect: (actual: unknown) => any;