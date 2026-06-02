import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { RequestService } from '../../../core/services/request';
import { StrapiService } from '../../../core/services/strapi';
import { Solicitud } from '../../../core/models/solicitud.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(RequestService);
  private readonly strapiService = inject(StrapiService);
  private readonly fb = inject(FormBuilder);

  solicitudes: Solicitud[] = [];
  isProgrammer = false;
  loading = true;
  selectedSolicitud: Solicitud | null = null;

  readonly answerForm = this.fb.nonNullable.group({
    respuesta: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading = true;
    const user = this.authService.currentUser;
    if (!user) return;

    try {
      const programadores = await firstValueFrom(this.strapiService.getProgramadores()) || [];
      const perfilProgramador = programadores.find(p => p.authEmail?.toLowerCase() === user.email?.toLowerCase());

      if (perfilProgramador) {
        this.isProgrammer = true;
        this.solicitudes = await this.requestService.getRequestsForProgrammer(perfilProgramador.id);
      } else {
        this.isProgrammer = false;
        this.solicitudes = await this.requestService.getRequestsByUser(user.uid);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      this.loading = false;
    }
  }

  openAnswerModal(solicitud: Solicitud) {
    this.selectedSolicitud = solicitud;
    this.answerForm.setValue({ respuesta: solicitud.respuesta ?? '' });
  }

  closeAnswerModal() {
    this.selectedSolicitud = null;
    this.answerForm.reset();
  }

  async submitAnswer() {
    if (this.answerForm.invalid || !this.selectedSolicitud?.id) return;

    try {
      const { respuesta } = this.answerForm.getRawValue();
      await this.requestService.answerRequest(this.selectedSolicitud.id, respuesta);
      
      this.solicitudes = this.solicitudes.map(s => 
        s.id === this.selectedSolicitud?.id ? { ...s, estado: 'respondida', respuesta } : s
      );
      this.closeAnswerModal();
    } catch (error) {
      console.error('Error guardando respuesta:', error);
    }
  }
}
