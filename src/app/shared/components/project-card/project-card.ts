import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Proyecto } from '../../../core/models/proyecto.model';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard {
  @Input({ required: true }) project!: Proyecto;
}
