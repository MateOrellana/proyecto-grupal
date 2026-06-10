import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigateByUrl(this.returnUrl());
    } catch (error) {
      this.errorMessage = this.authErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async loginWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.auth.loginWithGoogle();
      await this.router.navigateByUrl(this.returnUrl());
    } catch (error) {
      this.errorMessage = this.authErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
  }

  private authErrorMessage(error: unknown): string {
    const code = (error as { code?: string }).code;

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Correo o contraseña incorrectos.';
    }

    if (code === 'auth/user-not-found') {
      return 'No existe una cuenta registrada con ese correo.';
    }

    if (code === 'auth/popup-closed-by-user') {
      return 'Se cerró la ventana de Google antes de completar el ingreso.';
    }

    return 'No se pudo iniciar sesión. Revisa los datos e intenta nuevamente.';
  }
}
