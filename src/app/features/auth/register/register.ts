import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  readonly form = this.formBuilder.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
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
      const { displayName, email, password } = this.form.getRawValue();
      await this.auth.register(email, password, displayName);
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.errorMessage = this.authErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async registerWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.auth.loginWithGoogle();
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.errorMessage = this.authErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private authErrorMessage(error: unknown): string {
    const code = (error as { code?: string }).code;

    if (code === 'auth/email-already-in-use') {
      return 'Ya existe una cuenta registrada con ese correo.';
    }

    if (code === 'auth/weak-password') {
      return 'La contrasena es demasiado debil.';
    }

    if (code === 'auth/popup-closed-by-user') {
      return 'Se cerro la ventana de Google antes de completar el registro.';
    }

    return 'No se pudo crear la cuenta. Revisa los datos e intenta nuevamente.';
  }
}
