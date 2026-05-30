import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StrapiService } from '../../core/services/strapi';
import { ProgrammerCard } from '../../shared/components/programmer-card/programmer-card';
import { ProjectCard } from '../../shared/components/project-card/project-card';
import { ServiceCard } from '../../shared/components/service-card/service-card';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, ProgrammerCard, ProjectCard, ServiceCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly strapi = inject(StrapiService);

  readonly programadores$ = this.strapi.getProgramadores();
  readonly servicios$ = this.strapi.getServicios();
  readonly proyectosDestacados$ = this.strapi.getProyectosDestacados();

  serviceIcon(serviceId: string): string {
    const icons: Record<string, string> = {
      frontend: '/images/002-contrato.png',
      backend: '/images/006-enlace.png',
      ui: '/images/009-charla.png',
    };

    return icons[serviceId] ?? '/images/007-asistencia.png';
  }
}
