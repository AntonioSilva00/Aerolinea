
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'mis-vuelos',
    loadComponent: () =>
      import('./pages/mis-vuelos/mis-vuelos.page')
        .then((m) => m.MisVuelosPage),
  },
  {
    path: 'pase-abordar/:reservaId/:pasajeroId',
    loadComponent: () =>
      import('./pages/pase-abordar/pase-abordar.page')
        .then((m) => m.PaseAbordarPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page')
        .then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page')
        .then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page')
        .then((m) => m.RegisterPage),
  },
  {
    path: 'verificar-correo',
    loadComponent: () =>
      import('./pages/verificar-correo/verificar-correo.page')
        .then((m) => m.VerificarCorreoPage),
  },
  {
    path: 'reservas',
    loadComponent: () =>
      import('./pages/reservas/reservas.page')
        .then((m) => m.ReservasPage),
  },
];
