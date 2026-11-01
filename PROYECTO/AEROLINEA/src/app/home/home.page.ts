
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon],
})
export class HomePage implements OnInit, OnDestroy {

  private timer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {
    addIcons({ airplane });
  }

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      this.verificarSesion();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private verificarSesion(): void {
    const token = localStorage.getItem('auth_token');
    const usuarioGuardado = localStorage.getItem('usuario');

    let usuarioValido = false;

    try {
      const usuario = JSON.parse(usuarioGuardado || 'null');
      usuarioValido = !!usuario && !!usuario.id;
    } catch {
      usuarioValido = false;
    }

    if (token && usuarioValido) {
      console.log('[HOME] Sesión local encontrada');

      void this.router.navigateByUrl('/mis-vuelos', {
        replaceUrl: true
      });

    } else {
      console.log('[HOME] No existe sesión local');

      void this.router.navigateByUrl('/login', {
        replaceUrl: true
      });
    }
  }
}
