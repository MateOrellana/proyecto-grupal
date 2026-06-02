import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { switchMap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { StrapiService } from '../../../core/services/strapi';
import { AuthService } from '../../../core/services/auth';
import { RequestService } from '../../../core/services/request';
import { Programador } from '../../../core/models/programador.model';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AsyncPipe],
  templateUrl: './request-form.html',
  styleUrl: './request-form.css'
})
export class RequestForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly strapiService = inject(StrapiService);
  private readonly authService = inject(AuthService);
  private readonly requestService = inject(RequestService);

  programador$: Observable<Programador | undefined> = of(undefined);
  loading = false;
  successMessage = '';
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    nombreSolicitante: ['', [Validators.required, Validators.minLength(3)]],
    correoSolicitante: ['', [Validators.required, Validators.email]],
    descripcionProyecto: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.programador$ = this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug') ?? '';
        return this.strapiService.getProgramadorBySlug(slug);
      })
    );

    // Auto-completar datos del usuario si está autenticado
    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.form.patchValue({
          nombreSolicitante: user.displayName ?? '',
          correoSolicitante: user.email ?? ''
        });
      }
    });
  }

  async submit(programador: Programador) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      this.errorMessage = 'Debes iniciar sesión para enviar una solicitud.';
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const formValues = this.form.getRawValue();
      
      await this.requestService.createRequest({
        nombreSolicitante: formValues.nombreSolicitante,
        correoSolicitante: formValues.correoSolicitante,
        descripcionProyecto: formValues.descripcionProyecto,
        programadorId: programador.id,
        programadorNombre: programador.nombreCompleto,
        usuarioUid: user.uid,
        usuarioEmail: user.email ?? ''
      });

      this.successMessage = '¡Solicitud enviada con éxito! El programador la revisará pronto.';
      this.form.controls.descripcionProyecto.reset();
    } catch (error) {
      this.errorMessage = 'Hubo un error al enviar la solicitud. Intenta nuevamente.';
    } finally {
      this.loading = false;
    }
  }
}
