export interface Tecnologia {
  id: string;
  nombre: string;
  categoria: string;
  icono?: string;
  color?: string;
  orden: number;
  activo: boolean;
}

export interface CategoriaTecnologia {
  title: string;
  color: string;
  items: TecnologiaItem[];
}

export interface TecnologiaItem {
  name: string;
  icon?: string;
}
