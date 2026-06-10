import { Component, Input } from '@angular/core';

import { Servicio } from '../../../core/models/servicio.model';

@Component({
  selector: 'app-service-card',
  imports: [],
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCard {
  @Input({ required: true }) service!: Servicio;
  @Input() iconSrc?: string;
}
