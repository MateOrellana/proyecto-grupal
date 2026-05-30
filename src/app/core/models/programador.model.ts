export interface Programador {
  id: string;
  nombreCompleto: string;
  especialidad: string;
  descripcionBreve: string;
  descripcionCompleta: string;
  fotoPerfil?: string;
  correoContacto: string;
  github?: string;
  linkedin?: string;
  slug: string;
  activo: boolean;
  firebaseUid?: string;
  authEmail?: string;
}
