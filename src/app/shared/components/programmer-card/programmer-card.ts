import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Programador } from '../../../core/models/programador.model';

@Component({
  selector: 'app-programmer-card',
  imports: [RouterLink],
  templateUrl: './programmer-card.html',
  styleUrl: './programmer-card.css',
})
export class ProgrammerCard {
  @Input({ required: true }) programmer!: Programador;

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
