import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { StrapiService } from '../../../core/services/strapi';
import { AuthService } from '../../../core/services/auth';
import { ProjectCard } from '../../../shared/components/project-card/project-card';

@Component({
  selector: 'app-programmer-profile',
  imports: [AsyncPipe, RouterLink, ProjectCard],
  templateUrl: './programmer-profile.html',
  styleUrl: './programmer-profile.css',
})
export class ProgrammerProfile {
  private readonly route = inject(ActivatedRoute);
  private readonly strapi = inject(StrapiService);
  private readonly auth = inject(AuthService);

  readonly slug$ = this.route.paramMap.pipe(map((params) => params.get('slug') ?? ''));
  readonly currentUser$ = this.auth.currentUser$;

  readonly programador$ = this.slug$.pipe(
    switchMap((slug) => this.strapi.getProgramadorBySlug(slug)),
  );

  readonly proyectos$ = this.slug$.pipe(
    switchMap((slug) => this.strapi.getProyectosByProgramador(slug)),
  );

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
