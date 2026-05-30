import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
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
    const reference = collection(this.firebase.firestore, this.collectionName);
    const requestQuery = query(
      reference,
      where('usuarioUid', '==', usuarioUid),
      orderBy('fechaCreacion', 'desc'),
    );

    const snapshot = await getDocs(requestQuery);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Solicitud);
  }

  async getRequestsForProgrammer(programadorId: string): Promise<Solicitud[]> {
    const reference = collection(this.firebase.firestore, this.collectionName);
    const requestQuery = query(
      reference,
      where('programadorId', '==', programadorId),
      orderBy('fechaCreacion', 'desc'),
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
}
