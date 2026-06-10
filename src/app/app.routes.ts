import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { ProgrammerProfile } from './features/programmers/programmer-profile/programmer-profile';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { RequestForm } from './features/requests/request-form/request-form';
import { Dashboard } from './features/requests/dashboard/dashboard';
import { ProjectDetail } from './features/projects/project-detail/project-detail';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, title: 'Inicio - Portafolio' },
  { path: 'programadores/:slug', component: ProgrammerProfile, title: 'Perfil del programador' },
  { path: 'proyectos/:slug', component: ProjectDetail, title: 'Detalle del proyecto' },
  { path: 'login', component: Login, title: 'Login - Portafolio' },
  { path: 'registro', component: Register, title: 'Registro - Portafolio' },
  { path: 'solicitar/:slug', component: RequestForm, title: 'Solicitar Proyecto', canActivate: [authGuard] },
  { path: 'panel', component: Dashboard, title: 'Panel de Solicitudes', canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
