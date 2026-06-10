import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StrapiService } from '../../core/services/strapi';
import { ProjectCard } from '../../shared/components/project-card/project-card';
import { ServiceCard } from '../../shared/components/service-card/service-card';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, ProjectCard, ServiceCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly strapi = inject(StrapiService);

  readonly programadores$ = this.strapi.getProgramadores();
  readonly servicios$ = this.strapi.getServicios();
  readonly proyectosDestacados$ = this.strapi.getProyectosDestacados();

  readonly technologies = [
    { name: 'HTML5', icon: '/images/008-html-5.png' },
    { name: 'CSS3', icon: '/images/010-css-3.png' },
    { name: 'JavaScript', icon: '/images/009-js.png' },
    { name: 'TypeScript', icon: '/images/typescript.png' },
    { name: 'Firebase', icon: '/images/firebase.png' },
    { name: 'Strapi', icon: '/images/strapi.png' },
    { name: 'MySQL', icon: '/images/mysql.png' },
    { name: 'Git', icon: '/images/git.png' }
  ];

  serviceIcon(serviceId: string): string {
    const icons: Record<string, string> = {
      backend: '/images/004-enlace.png',
      'full-stack': '/images/013-contrato.png',
      'ui-ux': '/images/001-charla.png',
      'visualizacion-datos': '/images/003-asistencia.png',
    };

    return icons[serviceId] ?? '/images/003-asistencia.png';
  }
}
