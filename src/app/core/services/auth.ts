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
    return this.currentUserSubject.value ?? this.firebase.auth.currentUser;
  }

  async register(email: string, password: string, displayName?: string) {
    const credential = await createUserWithEmailAndPassword(this.firebase.auth, email, password);

    if (displayName?.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    }

    this.setCurrentUser(credential.user);
    return credential;
  }

  async login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(this.firebase.auth, email, password);
    this.setCurrentUser(credential.user);
    return credential;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(this.firebase.auth, provider);
    this.setCurrentUser(credential.user);
    return credential;
  }

  async logout() {
    await signOut(this.firebase.auth);
    this.setCurrentUser(null);
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

  private setCurrentUser(user: User | null) {
    this.currentUserSubject.next(user);
    this.authReadySubject.next(true);
  }
}
