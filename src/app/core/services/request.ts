import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { Solicitud } from '../models/solicitud.model';
import { Firebase } from './firebase';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly firebase = inject(Firebase);
  private readonly collectionName = 'solicitudes';

  async createRequest(request: Omit<Solicitud, 'id' | 'estado' | 'fechaCreacion'>) {
    const reference = collection(this.firebase.firestore, this.collectionName);

    return addDoc(reference, {
      ...request,
      estado: 'pendiente',
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });
  }

  async getRequestsByUser(usuarioUid: string): Promise<Solicitud[]> {
    return this.mergeRequests(await this.getRequestsByField('usuarioUid', usuarioUid));
  }

  async getRequestsForProgrammer(programadorId: string): Promise<Solicitud[]> {
    return this.getRequestsForProgrammerTarget(programadorId);
  }

  async getRequestsForProgrammerTarget(programadorId: string, programadorSlug?: string): Promise<Solicitud[]> {
    const requestsById = await this.getRequestsByField('programadorId', programadorId);
    const requestsBySlug =
      programadorSlug && programadorSlug !== programadorId
        ? await this.getRequestsByField('programadorSlug', programadorSlug)
        : [];

    return this.mergeRequests([...requestsById, ...requestsBySlug]);
  }

  private async getRequestsByField(fieldName: string, value: string): Promise<Solicitud[]> {
    const reference = collection(this.firebase.firestore, this.collectionName);
    const requestQuery = query(
      reference,
      where(fieldName, '==', value),
    );

    const snapshot = await getDocs(requestQuery);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Solicitud);
  }

  async answerRequest(id: string, respuesta: string) {
    const requestDocument = doc(this.firebase.firestore, this.collectionName, id);

    return updateDoc(requestDocument, {
      respuesta,
      estado: 'respondida',
      fechaActualizacion: serverTimestamp(),
    });
  }

  private mergeRequests(requests: Solicitud[]): Solicitud[] {
    const uniqueRequests = new Map<string, Solicitud>();

    for (const request of requests) {
      uniqueRequests.set(request.id ?? `${request.usuarioUid}-${request.programadorId}`, request);
    }

    return Array.from(uniqueRequests.values()).sort(
      (a, b) => this.timestampValue(b.fechaCreacion) - this.timestampValue(a.fechaCreacion),
    );
  }

  private timestampValue(value: unknown): number {
    if (value && typeof value === 'object' && 'toMillis' in value) {
      return (value as { toMillis: () => number }).toMillis();
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    return 0;
  }
}
