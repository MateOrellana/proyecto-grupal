export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria?: string;
  icono?: string;
  activo: boolean;
}
