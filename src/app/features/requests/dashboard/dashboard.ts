import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from 'firebase/auth';
import { AuthService } from '../../../core/services/auth';
import { RequestService } from '../../../core/services/request';
import { StrapiService } from '../../../core/services/strapi';
import { Solicitud } from '../../../core/models/solicitud.model';
import { firstValueFrom } from 'rxjs';

const PROGRAMMER_ADMINS: Record<string, { slug: string; name: string }> = {
  'sebas88@gmail.com': {
    slug: 'sebastian-alvarado',
    name: 'Sebastian Alvarado',
  },
  'mateo.orellana2017@gmail.com': {
    slug: 'mateo-orellana',
    name: 'Mateo Orellana',
  },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
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
  adminName = '';
  loading = true;
  errorMessage = '';
  selectedSolicitud: Solicitud | null = null;

  readonly answerForm = this.fb.nonNullable.group({
    respuesta: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.getCurrentUserWhenReady();
      const activeUser = user ?? await this.waitForCurrentUser();

      if (!activeUser) {
        this.solicitudes = [];
        this.errorMessage = 'Debes iniciar sesion para revisar tus solicitudes.';
        return;
      }

      const userEmail = activeUser.email?.toLowerCase() ?? '';
      const adminProfile = PROGRAMMER_ADMINS[userEmail];
      const programadores = await firstValueFrom(this.strapiService.getProgramadores()) || [];
      const perfilProgramador = programadores.find(p =>
        p.authEmail?.toLowerCase() === userEmail || p.slug === adminProfile?.slug
      );

      if (adminProfile || perfilProgramador) {
        this.isProgrammer = true;
        this.adminName = perfilProgramador?.nombreCompleto ?? adminProfile?.name ?? 'Programador';
        this.solicitudes = await this.requestService.getRequestsForProgrammerTarget(
          perfilProgramador?.id ?? adminProfile?.slug ?? '',
          perfilProgramador?.slug ?? adminProfile?.slug,
        );
      } else {
        this.isProgrammer = false;
        this.adminName = '';
        this.solicitudes = await this.requestService.getRequestsByUser(activeUser.uid);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      this.loading = false;
    }
  }

  private async waitForCurrentUser(): Promise<User | null> {
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 120));

      if (this.authService.currentUser) {
        return this.authService.currentUser;
      }
    }

    return null;
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
