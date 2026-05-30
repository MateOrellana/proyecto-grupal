import { inject, Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { BehaviorSubject, filter, firstValueFrom, map } from 'rxjs';

import { Firebase } from './firebase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firebase = inject(Firebase);
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly authReadySubject = new BehaviorSubject(false);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly authReady$ = this.authReadySubject.asObservable();

  constructor() {
    onAuthStateChanged(this.firebase.auth, (user) => {
      this.currentUserSubject.next(user);
      this.authReadySubject.next(true);
    });
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async register(email: string, password: string, displayName?: string) {
    const credential = await createUserWithEmailAndPassword(this.firebase.auth, email, password);

    if (displayName?.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
      this.currentUserSubject.next(credential.user);
    }

    return credential;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.firebase.auth, email, password);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    return signInWithPopup(this.firebase.auth, provider);
  }

  logout() {
    return signOut(this.firebase.auth);
  }

  getCurrentUserWhenReady(): Promise<User | null> {
    if (this.authReadySubject.value) {
      return Promise.resolve(this.currentUser);
    }

    return firstValueFrom(
      this.authReady$.pipe(
        filter((ready) => ready),
        map(() => this.currentUser),
      ),
    );
  }
}
