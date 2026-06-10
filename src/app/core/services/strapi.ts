import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Programador } from '../models/programador.model';
import { Proyecto, TipoProyecto } from '../models/proyecto.model';
import { Servicio } from '../models/servicio.model';

interface StrapiListResponse {
  data: StrapiItem[];
}

interface StrapiItem {
  id?: number | string;
  documentId?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class StrapiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.strapiUrl.replace(/\/$/, '');

  getProgramadores(): Observable<Programador[]> {
    return this.getList(['/api/programadores', '/api/programadors']).pipe(
      map((items) => items.map((item) => this.mapProgramador(item))),
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
    return this.getList(['/api/proyectos', '/api/projects']).pipe(
      map((items) => items.map((item) => this.mapProyecto(item))),
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

  getProyectoBySlug(slug: string): Observable<Proyecto | undefined> {
    return this.getProyectos().pipe(
      map((proyectos) => proyectos.find((proyecto) => proyecto.slug === slug)),
    );
  }

  getServicios(): Observable<Servicio[]> {
    return this.getList(['/api/servicios', '/api/services']).pipe(
      map((items) => items.map((item) => this.mapServicio(item))),
      map((servicios) => servicios.filter((servicio) => servicio.activo)),
      catchError(() => of(FALLBACK_SERVICIOS)),
    );
  }

  private getList(paths: string[]): Observable<StrapiItem[]> {
    const [path, ...rest] = paths;

    if (!path) {
      return throwError(() => new Error('No Strapi collection path configured'));
    }

    return this.http.get<StrapiListResponse>(`${this.baseUrl}${path}?populate=*`).pipe(
      map((response) => (Array.isArray(response.data) ? response.data : [])),
      catchError((error) => (rest.length > 0 ? this.getList(rest) : throwError(() => error))),
    );
  }

  private mapProgramador(item: StrapiItem): Programador {
    const data = this.flatItem(item);
    const nombreCompleto = this.text(
      this.value(data, ['nombreCompleto', 'nombre_completo', 'nombre completo', 'nombre']),
      'Programador',
    );
    const slug = this.text(this.value(data, ['slug']), this.slugify(nombreCompleto));

    return {
      id: String(item.documentId ?? item.id ?? slug),
      nombreCompleto,
      especialidad: this.text(
        this.value(data, [
          'especialidad',
          'perfilProfesional',
          'perfil_profesional',
          'especialidadPerfilProfesional',
          'especialidad / perfil profesional',
        ]),
        'Desarrollo web',
      ),
      descripcionBreve: this.text(
        this.value(data, ['descripcionBreve', 'descripcion_breve', 'descripcion breve']),
      ),
      descripcionCompleta: this.text(
        this.value(data, ['descripcionCompleta', 'descripcion_completa', 'descripcion completa']),
      ),
      fotoPerfil: this.mediaUrl(this.value(data, ['fotoPerfil', 'foto_perfil', 'foto de perfil'])),
      correoContacto: this.text(
        this.value(data, ['correoContacto', 'correo_contacto', 'correo de contacto', 'email']),
      ),
      github: this.optionalText(this.value(data, ['github', 'gitHub'])),
      linkedin: this.optionalText(
        this.value(data, ['linkedin', 'linkedIn', 'otrasRedes', 'otras redes']),
      ),
      slug,
      activo: this.boolean(this.value(data, ['activo', 'estadoActivo', 'estado_activo', 'estado']), true),
      firebaseUid: this.optionalText(this.value(data, ['firebaseUid', 'firebase_uid'])),
      authEmail: this.optionalText(this.value(data, ['authEmail', 'auth_email', 'correoAuth'])),
    };
  }

  private mapProyecto(item: StrapiItem): Proyecto {
    const data = this.flatItem(item);
    const nombre = this.text(
      this.value(data, ['nombre', 'nombreProyecto', 'nombre_proyecto', 'nombre del proyecto']),
      'Proyecto',
    );
    const slug = this.text(this.value(data, ['slug']), this.slugify(nombre));

    return {
      id: String(item.documentId ?? item.id ?? slug),
      nombre,
      slug,
      descripcionBreve: this.text(
        this.value(data, ['descripcionBreve', 'descripcion_breve', 'descripcion breve']),
      ),
      descripcionCompleta: this.text(
        this.value(data, ['descripcionCompleta', 'descripcion_completa', 'descripcion completa']),
      ),
      imagenPrincipal: this.mediaUrl(
        this.value(data, ['imagenPrincipal', 'imagen_principal', 'imagen principal']),
      ),
      tipo: this.tipoProyecto(
        this.value(data, ['tipo', 'tipoProyecto', 'tipo_proyecto', 'tipo de proyecto']),
      ),
      tecnologias: this.stringArray(
        this.value(data, [
          'tecnologias',
          'tecnologiasUtilizadas',
          'tecnologias_utilizadas',
          'tecnologias utilizadas',
        ]),
      ),
      repositorioUrl: this.optionalText(
        this.value(data, [
          'repositorioUrl',
          'repositorio_url',
          'repositorio',
          'enlaceRepositorio',
          'enlace_repositorio',
          'enlace al repositorio',
        ]),
      ),
      demoUrl: this.optionalText(
        this.value(data, [
          'demoUrl',
          'demo_url',
          'demo',
          'despliegue',
          'enlaceDemo',
          'enlace_despliegue',
          'enlace al despliegue',
        ]),
      ),
      destacado: this.boolean(
        this.value(data, ['destacado', 'campoDestacado', 'campo_destacado', 'campo destacado']),
        false,
      ),
      programadores: this.relationSlugs(
        this.value(data, [
          'programadores',
          'programadoresRelacionados',
          'programadores_relacionados',
          'programadores relacionados',
        ]),
      ),
      areaDestacada: this.optionalText(
        this.value(data, ['areaDestacada', 'area_destacada', 'area destacada']),
      ),
    };
  }

  private mapServicio(item: StrapiItem): Servicio {
    const data = this.flatItem(item);
    const nombre = this.text(this.value(data, ['nombre', 'name']), 'Servicio');

    return {
      id: String(item.documentId ?? item.id ?? this.slugify(nombre)),
      nombre,
      descripcion: this.text(this.value(data, ['descripcion', 'descripcionServicio'])),
      categoria: this.optionalText(this.value(data, ['categoria', 'area', 'tipo'])),
      icono: this.mediaUrl(this.value(data, ['icono', 'imagen', 'imagenIcono'])),
      activo: this.boolean(this.value(data, ['activo', 'estado']), true),
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

  private value(data: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== null) {
        return data[key];
      }
    }

    const normalizedKeys = keys.map((key) => this.normalizeKey(key));
    const match = Object.entries(data).find(([key]) => normalizedKeys.includes(this.normalizeKey(key)));

    return match?.[1];
  }

  private text(value: unknown, fallback = ''): string {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return fallback;
  }

  private optionalText(value: unknown): string | undefined {
    const result = this.text(value);
    return result.length > 0 ? result : undefined;
  }

  private boolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = this.normalizeKey(value);

      if (['no', 'false', 'inactivo', 'oculto'].includes(normalized)) {
        return false;
      }

      if (normalized.length > 0) {
        return true;
      }
    }

    return fallback;
  }

  private tipoProyecto(value: unknown): TipoProyecto {
    return this.text(value, 'Academico');
  }

  private stringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((item) => this.textFromPossibleObject(item, ['nombre', 'name', 'tecnologia', 'title']))
        .filter(Boolean);
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

    if (typeof value === 'string') {
      return value
        .split(/[,+]/)
        .map((item) => this.slugify(item))
        .filter(Boolean);
    }

    return [];
  }

  private slugFromRelation(value: unknown): string {
    if (typeof value === 'string') {
      return this.slugify(value);
    }

    const relation = this.flatItem(this.record(value) as StrapiItem);
    const relationText = this.text(
      this.value(relation, ['slug', 'nombreCompleto', 'nombre_completo', 'nombre', 'name']),
    );

    return this.slugify(relationText);
  }

  private textFromPossibleObject(value: unknown, keys: string[]): string {
    if (typeof value !== 'object' || value === null) {
      return this.text(value);
    }

    const data = this.flatItem(this.record(value) as StrapiItem);
    return this.text(this.value(data, keys));
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
    const url = this.text(this.value(flatMedia, ['url']));

    return url ? this.absoluteUrl(url) : undefined;
  }

  private absoluteUrl(url: string): string {
    return url.startsWith('/') ? `${this.baseUrl}${url}` : url;
  }

  private slugify(value: string): string {
    return this.normalizeText(value)
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  private normalizeKey(value: string): string {
    return this.normalizeText(value).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  private normalizeText(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}

const FALLBACK_PROGRAMADORES: Programador[] = [
  {
    id: 'sebastian-alvarado',
    nombreCompleto: 'Sebastian Anibal Alvarado Munoz',
    especialidad: 'Ingenieria de Software, Desarrollo Web Full Stack y Soluciones Digitales',
    descripcionBreve:
      'Ingeniero especializado en el desarrollo de aplicaciones web modernas, diseno de sistemas de informacion y soluciones tecnologicas escalables.',
    descripcionCompleta:
      'Profesional del area de Ingenieria en Ciencias de la Computacion enfocado en el desarrollo de software, arquitectura de aplicaciones web y gestion de sistemas de informacion. Posee experiencia en tecnologias modernas para frontend y backend, integracion de servicios en la nube, diseno de bases de datos y desarrollo de soluciones digitales orientadas a optimizar procesos empresariales.',
    fotoPerfil: '/images/Programador1.png',
    correoContacto: 'salvaradom1@est.ups.edu.ec',
    github: 'https://github.com/sebmrd',
    linkedin: 'https://linkedin.com/in/sebas-alvaradom',
    slug: 'sebastian-alvarado',
    activo: true,
  },
  {
    id: 'mateo-orellana',
    nombreCompleto: 'Mateo Sebastian Orellana Flores',
    especialidad: 'Ingenieria en Computacion, Desarrollo Frontend y Diseno de Interfaces de Usuario',
    descripcionBreve:
      'Estudiante de Computacion con enfoque en el desarrollo de interfaces modernas, experiencia de usuario y creacion de productos digitales accesibles y visualmente solidos.',
    descripcionCompleta:
      'Estudiante de la carrera de Computacion en la Universidad Politecnica Salesiana, con orientacion hacia el desarrollo frontend y el diseno centrado en el usuario. Ha trabajado en proyectos academicos y personales aplicando frameworks modernos como Angular y herramientas de diseno UI/UX.',
    fotoPerfil: '/images/Programador2.png',
    correoContacto: 'morellana1@est.ups.edu.ec',
    github: 'https://github.com/MateOrellana',
    linkedin: 'https://linkedin.com/in/mateo-orellana',
    slug: 'mateo-orellana',
    activo: true,
    authEmail: 'mateo.orellana2017@gmail.com',
  },
];

const FALLBACK_PROYECTOS: Proyecto[] = [
  {
    id: 'sistema-gestion-academica',
    nombre: 'Sistema Inteligente de Gestion Academica',
    slug: 'sistema-gestion-academica',
    descripcionBreve:
      'Plataforma web para la administracion integral de estudiantes, docentes, asignaturas y procesos academicos institucionales.',
    descripcionCompleta:
      'Sistema desarrollado para optimizar la gestion academica de instituciones educativas mediante centralizacion de informacion estudiantil, registro de calificaciones, control de asistencia y administracion de cursos.',
    tipo: 'Sistema de Informacion Web - Academico',
    imagenPrincipal: '/images/ProyectoA.PNG',
    tecnologias: ['Angular 17', 'Java 21', 'Spring Boot 3', 'MySQL 8', 'Firebase', 'APIs REST', 'Git'],
    repositorioUrl: 'https://github.com/sebmrd/sistema-gestion-academica',
    demoUrl: 'https://sgacademica.web.app',
    destacado: true,
    programadores: ['sebastian-alvarado'],
    areaDestacada: 'Desarrollo de Sistemas Empresariales',
  },
  {
    id: 'tracker-inversiones-finanzas',
    nombre: 'Tracker de Gestion Patrimonial e Inversiones',
    slug: 'tracker-inversiones-finanzas',
    descripcionBreve:
      'Plataforma para el analisis, monitoreo y proyeccion de activos financieros e inversiones de largo plazo.',
    descripcionCompleta:
      'Sistema especializado para la gestion patrimonial y seguimiento de inversiones financieras, con registro de activos, portafolios, rendimientos y proyecciones.',
    tipo: 'Software Financiero - Personal',
    imagenPrincipal: '/images/ProyectoB.PNG',
    tecnologias: ['Java 17', 'Excel Avanzado', 'VBA', 'Modelado de Datos', 'Analisis Financiero'],
    repositorioUrl: 'https://github.com/sebmrd/tracker-inversiones-finanzas',
    demoUrl: 'https://tracker-finanzas.web.app',
    destacado: true,
    programadores: ['sebastian-alvarado'],
    areaDestacada: 'FinTech y Analisis de Inversiones',
  },
  {
    id: 'designkit-ui-angular',
    nombre: 'DesignKit UI: Libreria de Componentes para Angular',
    slug: 'designkit-ui-angular',
    descripcionBreve:
      'Libreria de componentes UI reutilizables y accesibles construida sobre Angular para acelerar el desarrollo frontend.',
    descripcionCompleta:
      'Libreria de componentes desarrollada en Angular que proporciona un sistema de diseno coherente y accesible para aplicaciones web empresariales.',
    tipo: 'Libreria Open Source - Personal',
    imagenPrincipal: '/images/ProyectoC.png',
    tecnologias: ['Angular 17', 'TypeScript', 'SCSS', 'Storybook', 'Figma', 'Git', 'npm'],
    repositorioUrl: 'https://github.com/mvillacis-dev/designkit-ui',
    demoUrl: 'https://designkit-ui.netlify.app',
    destacado: true,
    programadores: ['mateo-orellana'],
    areaDestacada: 'Diseno de Interfaces y Desarrollo Frontend',
  },
  {
    id: 'ecotrack-dashboard-ambiental',
    nombre: 'EcoTrack: Dashboard de Monitoreo Ambiental Urbano',
    slug: 'ecotrack-dashboard-ambiental',
    descripcionBreve:
      'Plataforma visual interactiva para monitorear indicadores ambientales urbanos en tiempo real.',
    descripcionCompleta:
      'Dashboard web desarrollado con Angular y Chart.js que consume APIs publicas de monitoreo ambiental para visualizar calidad del aire, temperatura, humedad y contaminacion sonora.',
    tipo: 'Aplicacion Web - Academico / Personal',
    imagenPrincipal: '/images/ProyectoD.png',
    tecnologias: ['Angular 17', 'TypeScript', 'Chart.js', 'Leaflet.js', 'APIs REST', 'SCSS', 'Firebase Hosting'],
    repositorioUrl: 'https://github.com/mvillacis-dev/ecotrack-dashboard',
    demoUrl: 'https://ecotrack-ups.web.app',
    destacado: true,
    programadores: ['mateo-orellana'],
    areaDestacada: 'Visualizacion de Datos y Desarrollo Frontend',
  },
  {
    id: 'devportfolio-pro-multiusuario',
    nombre: 'DevPortfolio Pro: Portafolio Web Multiusuario',
    slug: 'devportfolio-pro-multiusuario',
    descripcionBreve:
      'Aplicacion web profesional tipo portafolio multiusuario con perfiles, proyectos, servicios y solicitudes de contacto.',
    descripcionCompleta:
      'Plataforma web profesional construida con Angular, Firebase Authentication, Cloud Firestore y Strapi CMS como backend headless para administrar contenido dinamico del portafolio.',
    tipo: 'Aplicacion Web Full Stack - Academico',
    imagenPrincipal: '/images/ProyectoE.png',
    tecnologias: ['Angular 17', 'TypeScript', 'Firebase Auth', 'Cloud Firestore', 'Strapi CMS 5', 'SCSS', 'Git'],
    repositorioUrl: 'https://github.com/sebmrd-mvillacis/devportfolio-pro',
    demoUrl: 'https://devportfolio-pro.web.app',
    destacado: true,
    programadores: ['sebastian-alvarado', 'mateo-orellana'],
    areaDestacada: 'Desarrollo Web Full Stack y Experiencia de Usuario',
  },
];

const FALLBACK_SERVICIOS: Servicio[] = [
  {
    id: 'backend',
    nombre: 'Desarrollo y Arquitectura Backend',
    descripcion:
      'Diseno e implementacion de logica de negocio, modelado de datos, APIs REST, integracion de servicios en la nube y patrones de arquitectura.',
    categoria: 'Backend',
    activo: true,
  },
  {
    id: 'full-stack',
    nombre: 'Desarrollo Web Empresarial Full Stack',
    descripcion:
      'Construccion de aplicaciones web completas desde la base de datos hasta la interfaz de usuario, usando Angular, Firebase y tecnologias modernas.',
    categoria: 'Full Stack',
    activo: true,
  },
  {
    id: 'ui-ux',
    nombre: 'Diseno de Interfaces y Experiencia de Usuario (UI/UX)',
    descripcion:
      'Creacion de interfaces modernas, accesibles y coherentes con prototipado, maquetacion responsiva y componentes reutilizables.',
    categoria: 'UI/UX',
    activo: true,
  },
  {
    id: 'visualizacion-datos',
    nombre: 'Visualizacion de Datos e Integracion de APIs',
    descripcion:
      'Desarrollo de dashboards interactivos, reportes visuales e integraciones con APIs REST o bases de datos en tiempo real.',
    categoria: 'Datos',
    activo: true,
  },
];
