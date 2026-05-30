import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Programador } from '../models/programador.model';
import { Proyecto, TipoProyecto } from '../models/proyecto.model';
import { Servicio } from '../models/servicio.model';

interface StrapiListResponse {
  data: StrapiItem[];
}

interface StrapiItem {
  id?: number | string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class StrapiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.strapiUrl;

  getProgramadores(): Observable<Programador[]> {
    return this.http.get<StrapiListResponse>(`${this.baseUrl}/api/programadores?populate=*`).pipe(
      map((response) => response.data.map((item) => this.mapProgramador(item))),
      map((programadores) => programadores.filter((programador) => programador.activo)),
      catchError(() => of(FALLBACK_PROGRAMADORES)),
    );
  }

  getProgramadorBySlug(slug: string): Observable<Programador | undefined> {
    return this.getProgramadores().pipe(
      map((programadores) => programadores.find((programador) => programador.slug === slug)),
    );
  }

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<StrapiListResponse>(`${this.baseUrl}/api/proyectos?populate=*`).pipe(
      map((response) => response.data.map((item) => this.mapProyecto(item))),
      catchError(() => of(FALLBACK_PROYECTOS)),
    );
  }

  getProyectosDestacados(): Observable<Proyecto[]> {
    return this.getProyectos().pipe(
      map((proyectos) => proyectos.filter((proyecto) => proyecto.destacado)),
    );
  }

  getProyectosByProgramador(programadorSlug: string): Observable<Proyecto[]> {
    return this.getProyectos().pipe(
      map((proyectos) =>
        proyectos.filter((proyecto) => proyecto.programadores.includes(programadorSlug)),
      ),
    );
  }

  getServicios(): Observable<Servicio[]> {
    return this.http.get<StrapiListResponse>(`${this.baseUrl}/api/servicios?populate=*`).pipe(
      map((response) => response.data.map((item) => this.mapServicio(item))),
      map((servicios) => servicios.filter((servicio) => servicio.activo)),
      catchError(() => of(FALLBACK_SERVICIOS)),
    );
  }

  private mapProgramador(item: StrapiItem): Programador {
    const data = this.flatItem(item);
    const slug = this.text(data['slug'], `programador-${item.id ?? 'sin-id'}`);

    return {
      id: String(item.id ?? slug),
      nombreCompleto: this.text(data['nombreCompleto'] ?? data['nombre_completo'], 'Programador'),
      especialidad: this.text(data['especialidad'] ?? data['perfilProfesional'], 'Desarrollo web'),
      descripcionBreve: this.text(data['descripcionBreve'] ?? data['descripcion_breve']),
      descripcionCompleta: this.text(data['descripcionCompleta'] ?? data['descripcion_completa']),
      fotoPerfil: this.mediaUrl(data['fotoPerfil'] ?? data['foto_perfil']),
      correoContacto: this.text(data['correoContacto'] ?? data['correo_contacto']),
      github: this.text(data['github']),
      linkedin: this.text(data['linkedin']),
      slug,
      activo: this.boolean(data['activo'] ?? data['estadoActivo'], true),
      firebaseUid: this.optionalText(data['firebaseUid']),
      authEmail: this.optionalText(data['authEmail']),
    };
  }

  private mapProyecto(item: StrapiItem): Proyecto {
    const data = this.flatItem(item);
    const slug = this.text(data['slug'], `proyecto-${item.id ?? 'sin-id'}`);

    return {
      id: String(item.id ?? slug),
      nombre: this.text(data['nombre'] ?? data['nombreProyecto'], 'Proyecto'),
      slug,
      descripcionBreve: this.text(data['descripcionBreve'] ?? data['descripcion_breve']),
      descripcionCompleta: this.text(data['descripcionCompleta'] ?? data['descripcion_completa']),
      imagenPrincipal: this.mediaUrl(data['imagenPrincipal'] ?? data['imagen_principal']),
      tipo: this.tipoProyecto(data['tipo']),
      tecnologias: this.stringArray(data['tecnologias'] ?? data['tecnologiasUtilizadas']),
      repositorioUrl: this.optionalText(data['repositorioUrl'] ?? data['repositorio']),
      demoUrl: this.optionalText(data['demoUrl'] ?? data['demo']),
      destacado: this.boolean(data['destacado'], false),
      programadores: this.relationSlugs(data['programadores']),
    };
  }

  private mapServicio(item: StrapiItem): Servicio {
    const data = this.flatItem(item);
    const nombre = this.text(data['nombre'], 'Servicio');

    return {
      id: String(item.id ?? nombre),
      nombre,
      descripcion: this.text(data['descripcion']),
      categoria: this.optionalText(data['categoria']),
      activo: this.boolean(data['activo'], true),
    };
  }

  private flatItem(item: StrapiItem): Record<string, unknown> {
    return {
      ...item,
      ...this.record(item.attributes),
    };
  }

  private record(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  }

  private text(value: unknown, fallback = ''): string {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
  }

  private optionalText(value: unknown): string | undefined {
    const result = this.text(value);
    return result.length > 0 ? result : undefined;
  }

  private boolean(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
  }

  private tipoProyecto(value: unknown): TipoProyecto {
    const validTypes: TipoProyecto[] = ['academico', 'personal', 'laboral', 'simulado'];
    const result = this.text(value).toLowerCase() as TipoProyecto;

    return validTypes.includes(result) ? result : 'academico';
  }

  private stringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  private relationSlugs(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => this.slugFromRelation(item)).filter(Boolean);
    }

    const relation = this.record(value);
    const data = relation['data'];

    if (Array.isArray(data)) {
      return data.map((item) => this.slugFromRelation(item)).filter(Boolean);
    }

    return this.stringArray(value);
  }

  private slugFromRelation(value: unknown): string {
    const relation = this.flatItem(this.record(value) as StrapiItem);
    return this.text(relation['slug']);
  }

  private mediaUrl(value: unknown): string | undefined {
    if (typeof value === 'string' && value.length > 0) {
      return this.absoluteUrl(value);
    }

    const media = this.record(value);
    const data = media['data'];

    if (Array.isArray(data) && data.length > 0) {
      return this.mediaUrl(data[0]);
    }

    if (data) {
      return this.mediaUrl(data);
    }

    const flatMedia = this.flatItem(media as StrapiItem);
    const url = this.text(flatMedia['url']);

    return url ? this.absoluteUrl(url) : undefined;
  }

  private absoluteUrl(url: string): string {
    return url.startsWith('/') ? `${this.baseUrl}${url}` : url;
  }
}

const FALLBACK_PROGRAMADORES: Programador[] = [
  {
    id: 'integrante-1',
    nombreCompleto: 'Programador 1',
    especialidad: 'Desarrollo frontend',
    descripcionBreve: 'Construye interfaces modernas, responsive y conectadas a servicios web.',
    descripcionCompleta:
      'Perfil orientado a Angular, componentes reutilizables, consumo de APIs y experiencia de usuario. Participa en el diseno visual del portafolio y en la estructura de las vistas publicas.',
    fotoPerfil: '/images/programador1.png',
    correoContacto: 'integrante1@example.com',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    slug: 'integrante-1',
    activo: true,
    authEmail: 'mateo.orellana2048@gmail.com',
  },
  {
    id: 'integrante-2',
    nombreCompleto: 'Programador 2',
    especialidad: 'Desarrollo backend y datos',
    descripcionBreve: 'Organiza datos, servicios y flujos de solicitudes para aplicaciones web.',
    descripcionCompleta:
      'Perfil orientado a bases de datos, Firebase, Firestore, integracion con CMS y logica de negocio. Participa en la autenticacion, solicitudes de contacto y conexion con servicios externos.',
    fotoPerfil: '/images/programador2.png',
    correoContacto: 'integrante2@example.com',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    slug: 'integrante-2',
    activo: true,
  },
];

const FALLBACK_PROYECTOS: Proyecto[] = [
  {
    id: 'proyecto-portafolio',
    nombre: 'Portafolio profesional multiusuario',
    slug: 'portafolio-profesional',
    descripcionBreve: 'Aplicacion web con Angular, Firebase y Strapi para mostrar perfiles y servicios.',
    descripcionCompleta:
      'Proyecto academico que integra frontend, autenticacion, solicitudes y contenido dinamico administrado desde un CMS.',
    tipo: 'academico',
    tecnologias: ['Angular', 'Firebase', 'Firestore', 'Strapi'],
    repositorioUrl: 'https://github.com/',
    demoUrl: '',
    destacado: true,
    programadores: ['integrante-1', 'integrante-2'],
  },
  {
    id: 'dashboard-solicitudes',
    nombre: 'Gestion de solicitudes',
    slug: 'gestion-solicitudes',
    descripcionBreve: 'Flujo para enviar, revisar y responder solicitudes de contacto.',
    descripcionCompleta:
      'Modulo pensado para que usuarios externos contacten a un programador y puedan revisar el estado de su solicitud.',
    tipo: 'simulado',
    tecnologias: ['Angular', 'Firestore'],
    repositorioUrl: '',
    demoUrl: '',
    destacado: true,
    programadores: ['integrante-2'],
  },
];

const FALLBACK_SERVICIOS: Servicio[] = [
  {
    id: 'frontend',
    nombre: 'Desarrollo frontend',
    descripcion: 'Creacion de interfaces web responsive con Angular y componentes reutilizables.',
    categoria: 'Web',
    activo: true,
  },
  {
    id: 'backend',
    nombre: 'Integracion backend',
    descripcion: 'Conexion con APIs, Firebase, Firestore y servicios externos.',
    categoria: 'Datos',
    activo: true,
  },
  {
    id: 'ui',
    nombre: 'Experiencia de usuario',
    descripcion: 'Organizacion visual de pantallas, formularios, cards y navegacion clara.',
    categoria: 'UX',
    activo: true,
  },
];
