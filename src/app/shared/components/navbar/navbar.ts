import { AsyncPipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { shareReplay } from 'rxjs';

import { AuthService } from '../../../core/services/auth';
import { StrapiService } from '../../../core/services/strapi';

@Component({
  selector: 'app-navbar',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly strapi = inject(StrapiService);

  readonly isScrolled = signal(false);
  readonly currentUser$ = this.auth.currentUser$;
  readonly configuracion$ = this.strapi.getConfiguracionSitio().pipe(shareReplay(1));

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 28);
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
