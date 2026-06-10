import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { shareReplay } from 'rxjs';

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

  readonly configuracion$ = this.strapi.getConfiguracionSitio().pipe(shareReplay(1));
  readonly programadores$ = this.strapi.getProgramadores().pipe(shareReplay(1));
  readonly servicios$ = this.strapi.getServicios();
  readonly proyectosDestacados$ = this.strapi.getProyectosDestacados();
  readonly techCategories$ = this.strapi.getCategoriasTecnologias();
}
