
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
  mailOutline,
  callOutline,
  locationOutline,
  calendarOutline,
  globeOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  airplaneOutline
} from 'ionicons/icons';

import { ApiService } from '../../services/api.service';

interface PerfilUsuario {
  id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  direccion: string;
  fecha_nacimiento: string;
  genero: string;
  pais_origen: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss']
})
export class PerfilPage implements OnInit {

  perfil: PerfilUsuario = this.perfilVacio();
  respaldo: PerfilUsuario = this.perfilVacio();

  editando = false;
  guardando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' = 'success';

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      createOutline,
      checkmarkOutline,
      closeOutline,
      mailOutline,
      callOutline,
      locationOutline,
      calendarOutline,
      globeOutline,
      shieldCheckmarkOutline,
      logOutOutline,
      airplaneOutline
    });
  }

ngOnInit(): void {
  this.cargarPerfil();
  void this.cargarPerfilServidor();
}

async cargarPerfilServidor(): Promise<void> {
  try {
    const respuesta = await this.api.obtenerPerfil();

    if (!respuesta.success || !respuesta.usuario) {
      throw new Error('No se pudo obtener el perfil');
    }

    this.perfil = {
      ...this.perfilVacio(),
      ...respuesta.usuario,
      fecha_nacimiento:
      
        respuesta.usuario.fecha_nacimiento?.substring(0, 10) || ''
    };

    this.respaldo = { ...this.perfil };

    localStorage.setItem(
      'usuario',
      JSON.stringify(respuesta.usuario)
    );

  } catch (error) {
    console.error('[PERFIL] Error consultando servidor:', error);

    this.mostrarMensaje(
      'No se pudo actualizar el perfil desde el servidor.',
      'error'
    );
  }
}

  private perfilVacio(): PerfilUsuario {
    return {
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      email: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: '',
      genero: '',
      pais_origen: ''
    };
  }

  
cargarPerfil(): void {
  try {
    const raw = localStorage.getItem('usuario');

    if (!raw) {
      console.warn('[PERFIL] No hay usuario guardado');
      return;
    }

    const almacenado = JSON.parse(raw);

    const usuario = almacenado.usuario ?? almacenado;

    this.perfil = {
      ...this.perfilVacio(),
      ...usuario,

      // Aceptar tanto "email" como "correo"
      email: usuario.email ?? usuario.correo ?? '',

      // Formato compatible con input type="date"
      fecha_nacimiento:
        usuario.fecha_nacimiento?.substring(0, 10) ?? ''
    };

    this.respaldo = { ...this.perfil };

    console.log('[PERFIL] Información cargada');

  } catch (error) {
    console.error(
      '[PERFIL] Error cargando usuario:',
      error
    );

    this.mostrarMensaje(
      'No se pudo cargar la información del perfil.',
      'error'
    );
  }
}


  get nombreCompleto(): string {
    return [
      this.perfil.nombre,
      this.perfil.apellido_paterno,
      this.perfil.apellido_materno
    ].filter(Boolean).join(' ');
  }

  get iniciales(): string {
    const nombre = this.perfil.nombre?.charAt(0) ?? '';
    const apellido = this.perfil.apellido_paterno?.charAt(0) ?? '';

    return (nombre + apellido).toUpperCase() || 'SF';
  }

  activarEdicion(): void {
    this.respaldo = { ...this.perfil };
    this.editando = true;
    this.mensaje = '';
  }

  cancelarEdicion(): void {
    this.perfil = { ...this.respaldo };
    this.editando = false;
    this.mensaje = '';
  }

  async guardarCambios(): Promise<void> {
    if (this.guardando) return;

    if (
      !this.perfil.nombre.trim() ||
      !this.perfil.apellido_paterno.trim() ||
      !this.perfil.email.trim()
    ) {
      this.mostrarMensaje(
        'Completa los campos obligatorios.',
        'error'
      );
      return;
    }

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.perfil.email);

    if (!emailValido) {
      this.mostrarMensaje(
        'Introduce un correo electrónico válido.',
        'error'
      );
      return;
    }

    const telefono = this.perfil.telefono.trim();

    if (telefono && !/^\d{10}$/.test(telefono)) {
      this.mostrarMensaje(
        'El teléfono debe contener 10 dígitos.',
        'error'
      );
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    try {
      const respuesta = await this.api.actualizarPerfil({
        nombre: this.perfil.nombre.trim(),
        apellido_paterno: this.perfil.apellido_paterno.trim(),
        apellido_materno: this.perfil.apellido_materno.trim(),
        telefono,
        direccion: this.perfil.direccion.trim(),
        fecha_nacimiento: this.perfil.fecha_nacimiento,
        genero: this.perfil.genero,
        pais_origen: this.perfil.pais_origen
      });

      if (!respuesta?.success || !respuesta?.usuario) {
        throw new Error(
          respuesta?.message ||
          'El servidor no confirmó la actualización.'
        );
      }

      const usuarioActualizado = respuesta.usuario;

      this.perfil = {
        ...this.perfilVacio(),
        ...usuarioActualizado
      };

      this.respaldo = { ...this.perfil };

      localStorage.setItem(
        'usuario',
        JSON.stringify(usuarioActualizado)
      );

      this.editando = false;

      this.mostrarMensaje(
        'Tu información se actualizó correctamente.',
        'success'
      );

    } catch (error: any) {
      console.error('[PERFIL] Error actualizando:', error);

      this.mostrarMensaje(
        error?.response?.data?.message ||
        error?.message ||
        'No se pudieron guardar los cambios.',
        'error'
      );
    } finally {
      this.guardando = false;
    }
  }

  private mostrarMensaje(
    texto: string,
    tipo: 'success' | 'error'
  ): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }

  volver(): void {
    void this.router.navigate(['/reservas']);
  }

  cerrarSesion(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('usuario');

    void this.router.navigate(['/login']);
  }
  

}
