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

  readonly techCategories = [
    {
      title: 'FRONTEND',
      color: '#3b82f6', // Borde Azul
      items: [
        { name: 'HTML5', icon: '/images/008-html-5.png' },
        { name: 'CSS3', icon: '/images/010-css-3.png' },
        { name: 'JavaScript', icon: '/images/009-js.png' },
        { name: 'TypeScript', icon: '/images/typescript.png' },
        { name: 'React', icon: '/images/react.png' },
        { name: 'Vue.js', icon: '/images/vue.js.png' },
        { name: 'Tailwind', icon: '/images/tailwind.png' }
      ]
    },
    {
      title: 'BACKEND',
      color: '#16a34a', // Borde Verde
      items: [
        { name: 'Python', icon: '/images/python.png' },
        { name: 'C++', icon: '/images/C++.png' },
        { name: 'Java', icon: '/images/java.png' },
        { name: 'Node.js', icon: '/images/nodejs.png' }
      ]
    },
    {
      title: 'BASES DE DATOS',
      color: '#f59e0b', // Borde Amarillo
      items: [
        { name: 'MongoDB', icon: '/images/mongodb.png' },
        { name: 'MySQL', icon: '/images/mysql.png' },
        { name: 'Firebase', icon: '/images/firebase.png' },
        { name: 'Strapi', icon: '/images/strapi.png' }
      ]
    },
    {
      title: 'HERRAMIENTAS',
      color: '#ef4444', // Borde Rojo
      items: [
        { name: 'Git', icon: '/images/git.png' },
        { name: 'VSCode', icon: '/images/visualstudiocode.png' },
        { name: 'npm', icon: '/images/npm.png' }
      ]
    }
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
