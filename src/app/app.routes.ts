import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home';
import { ProgrammerProfile } from './features/programmers/programmer-profile/programmer-profile';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Inicio - Portafolio',
  },
  {
    path: 'programadores/:slug',
    component: ProgrammerProfile,
    title: 'Perfil del programador',
  },
  {
    path: 'login',
    component: Login,
    title: 'Login - Portafolio',
  },
  {
    path: 'registro',
    component: Register,
    title: 'Registro - Portafolio',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
