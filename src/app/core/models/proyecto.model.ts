export type TipoProyecto = string;

export interface Proyecto {
  id: string;
  nombre: string;
  slug: string;
  descripcionBreve: string;
  descripcionCompleta: string;
  imagenPrincipal?: string;
  tipo: TipoProyecto;
  tecnologias: string[];
  repositorioUrl?: string;
  demoUrl?: string;
  destacado: boolean;
  programadores: string[];
  areaDestacada?: string;
}
