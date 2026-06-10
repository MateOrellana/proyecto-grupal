export type EstadoSolicitud = 'pendiente' | 'respondida';

export interface Solicitud {
  id?: string;
  nombreSolicitante: string;
  correoSolicitante: string;
  descripcionProyecto: string;
  programadorId: string;
  programadorSlug?: string;
  programadorNombre: string;
  usuarioUid: string;
  usuarioEmail: string;
  estado: EstadoSolicitud;
  respuesta?: string;
  fechaCreacion?: unknown;
  fechaActualizacion?: unknown;
}
