import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfiguracionSitio } from '../models/configuracion-sitio.model';
import { Programador } from '../models/programador.model';
import { Proyecto, TipoProyecto } from '../models/proyecto.model';
import { Servicio } from '../models/servicio.model';
import { CategoriaTecnologia, Tecnologia } from '../models/tecnologia.model';

interface StrapiListResponse {
  data: StrapiItem[];
}

interface StrapiSingleResponse {
  data: StrapiItem | null;
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
      catchError(() => of([])),
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
      catchError(() => of([])),
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
      catchError(() => of([])),
    );
  }

  getConfiguracionSitio(): Observable<ConfiguracionSitio | undefined> {
    return this.getList(['/api/configuracion-sitios', '/api/configuracion-sitioss']).pipe(
      map((items) => items.map((item) => this.mapConfiguracionSitio(item))),
      map((items) => items.find((item) => item.activo) ?? items[0]),
      catchError(() =>
        this.getSingle(['/api/configuracion-sitio', '/api/configuracion']).pipe(
          map((item) => (item ? this.mapConfiguracionSitio(item) : undefined)),
          catchError(() => of(undefined)),
        ),
      ),
    );
  }

  getTecnologias(): Observable<Tecnologia[]> {
    return this.getList(['/api/tecnologias', '/api/technologies']).pipe(
      map((items) => items.map((item) => this.mapTecnologia(item))),
      map((tecnologias) =>
        tecnologias
          .filter((tecnologia) => tecnologia.activo)
          .sort((a, b) => a.orden - b.orden),
      ),
      catchError(() => of([])),
    );
  }

  getCategoriasTecnologias(): Observable<CategoriaTecnologia[]> {
    return this.getTecnologias().pipe(
      map((tecnologias) => this.groupTecnologiasByCategoria(tecnologias)),
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

  private getSingle(paths: string[]): Observable<StrapiItem | undefined> {
    const [path, ...rest] = paths;

    if (!path) {
      return throwError(() => new Error('No Strapi single type path configured'));
    }

    return this.http.get<StrapiSingleResponse>(`${this.baseUrl}${path}?populate=*`).pipe(
      map((response) => response.data ?? undefined),
      catchError((error) => (rest.length > 0 ? this.getSingle(rest) : throwError(() => error))),
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
      linkedin: this.optionalText(this.value(data, ['linkedin', 'linkedIn', 'otrasRedes', 'otras redes'])),
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
          'programadors',
          'programadoresRelacionados',
          'programadores_relacionados',
          'programadores relacionados',
          'programmers',
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

  private mapConfiguracionSitio(item: StrapiItem): ConfiguracionSitio {
    const data = this.flatItem(item);

    return {
      id: String(item.documentId ?? item.id ?? 'configuracion-sitio'),
      nombreEmpresa: this.text(
        this.value(data, ['nombreEmpresa', 'nombre_empresa', 'nombre empresa', 'nombre']),
        'WebFlow',
      ),
      descripcion: this.text(this.value(data, ['descripcion', 'description'])),
      logo: this.mediaUrl(this.value(data, ['logo', 'imagenLogo', 'imagen_logo'])),
      repositorioUrl: this.optionalText(
        this.value(data, ['repositorioUrl', 'repositorio_url', 'repositorio']),
      ),
      linkedinSebastian: this.optionalText(
        this.value(data, ['linkedinSebastian', 'linkedin_sebastian']),
      ),
      linkedinMateo: this.optionalText(this.value(data, ['linkedinMateo', 'linkedin_mateo'])),
      githubIcon: this.mediaUrl(this.value(data, ['githubIcon', 'github_icon', 'iconoGithub'])),
      linkedinIcon: this.mediaUrl(
        this.value(data, ['linkedinIcon', 'linkedin_icon', 'iconoLinkedin']),
      ),
      telefonoIcon: this.mediaUrl(
        this.value(data, ['telefonoIcon', 'telefono_icon', 'iconoTelefono']),
      ),
      activo: this.boolean(this.value(data, ['activo', 'estado']), true),
    };
  }

  private mapTecnologia(item: StrapiItem): Tecnologia {
    const data = this.flatItem(item);
    const nombre = this.text(this.value(data, ['nombre', 'name']), 'Tecnologia');

    return {
      id: String(item.documentId ?? item.id ?? this.slugify(nombre)),
      nombre,
      categoria: this.text(this.value(data, ['categoria', 'category']), 'OTRAS'),
      icono: this.mediaUrl(this.value(data, ['icono', 'imagen', 'logo'])),
      color: this.optionalText(this.value(data, ['color', 'colorCategoria', 'color_categoria'])),
      orden: this.number(this.value(data, ['orden', 'order']), 999),
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

  private number(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
  }

  private tipoProyecto(value: unknown): TipoProyecto {
    return this.text(value, 'Academico');
  }

  private groupTecnologiasByCategoria(tecnologias: Tecnologia[]): CategoriaTecnologia[] {
    const groups = new Map<string, CategoriaTecnologia>();

    for (const tecnologia of tecnologias) {
      const title = tecnologia.categoria.trim().toUpperCase();
      const current = groups.get(title) ?? {
        title,
        color: tecnologia.color ?? '#d6b36a',
        items: [],
      };

      if (!current.color && tecnologia.color) {
        current.color = tecnologia.color;
      }

      current.items.push({
        name: tecnologia.nombre,
        icon: tecnologia.icono,
      });

      groups.set(title, current);
    }

    return Array.from(groups.values());
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
