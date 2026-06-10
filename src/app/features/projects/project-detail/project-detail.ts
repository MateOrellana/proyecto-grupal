import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { StrapiService } from '../../../core/services/strapi';

@Component({
  selector: 'app-project-detail',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly strapi = inject(StrapiService);

  readonly project$ = this.route.paramMap.pipe(
    map((params) => params.get('slug') ?? ''),
    switchMap((slug) => this.strapi.getProyectoBySlug(slug)),
  );
}
