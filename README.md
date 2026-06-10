# WebFlow - Portafolio profesional multiusuario

WebFlow es una aplicacion web tipo portafolio profesional para dos programadores. Permite mostrar perfiles individuales, proyectos, servicios y tecnologias, ademas de gestionar solicitudes de contacto mediante usuarios autenticados.

El proyecto fue desarrollado como aplicacion frontend en Angular, conectado con Firebase para autenticacion, Firestore para solicitudes y Strapi Cloud como CMS para administrar el contenido dinamico.

## Integrantes

- Sebastian Alvarado
- Mateo Orellana

## Tecnologias utilizadas

- Angular 21
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Strapi Cloud
- PostgreSQL en el CMS
- Tailwind CSS
- DaisyUI
- Google Fonts

## Funcionalidades principales

- Pagina de inicio con presentacion de WebFlow.
- Cards clicables de los dos programadores.
- Perfil individual de cada programador.
- Listado y detalle de proyectos.
- Servicios o areas de especializacion.
- Login y registro con correo/contrasena.
- Inicio de sesion con Google.
- Formulario de solicitudes de proyecto.
- Panel para revisar solicitudes enviadas.
- Panel de administradores para responder solicitudes.
- Contenido dinamico desde Strapi Cloud.
- Despliegue en Firebase Hosting.

## Arquitectura general

La aplicacion se divide en tres partes principales:

```text
Angular
Frontend de la aplicacion. Muestra las vistas, consume Strapi y Firebase.

Firebase
Authentication: login, registro y Google.
Cloud Firestore: almacenamiento de solicitudes.
Hosting: despliegue final de la SPA.

Strapi Cloud
CMS para programadores, proyectos, servicios, tecnologias y configuracion del sitio.
```

## Decisiones de diseno y desarrollo

Se eligio una interfaz oscura, sobria y minimalista para que el sitio parezca un portafolio real y no una pagina academica. La paleta principal usa fondo negro, superficies oscuras, texto claro y acentos dorados.

El contenido visible del portafolio no esta escrito directamente en Angular. Programadores, proyectos, servicios, tecnologias, logo, enlaces e iconos se administran desde Strapi Cloud. Esto permite editar informacion sin modificar codigo.

Firebase se usa solo para las partes solicitadas en el proyecto: autenticacion, Firestore y hosting. No se uso Firebase como CMS para evitar mezclar responsabilidades.

Firestore se usa para solicitudes porque estas dependen de usuarios autenticados y cambian durante el uso de la aplicacion. Strapi se usa para contenido publico administrable.

## Desafios encontrados

- La integracion con Firebase Auth necesitaba esperar correctamente a que la sesion estuviera lista antes de cargar el panel de solicitudes.
- Strapi Cloud requirio configurar permisos publicos para que Angular pudiera leer los endpoints.
- Las imagenes locales fueron migradas a Strapi para demostrar que el contenido visual tambien puede venir del CMS.
- La relacion entre proyectos y programadores se configuro como many-to-many para que un proyecto compartido aparezca en ambos perfiles.
- Se ajusto el diseno responsive para que las cards de los programadores no tapen el contenido principal.

## Estructura del proyecto

```text
src/app/core
Modelos, guards y servicios principales.

src/app/features
Vistas principales: home, auth, programmers, projects, requests.

src/app/shared
Componentes reutilizables como navbar, footer, project-card y service-card.

src/environments
Configuracion de Firebase y Strapi.

firebase.json
Configuracion de Firebase Hosting.
```

## Configuracion local

### 1. Instalar dependencias

```powershell
cd C:\Users\mateo\Downloads\ProyectoGrupo\ProyectoPortafolio
npm install
```

### 2. Revisar configuracion

El archivo principal de entorno esta en:

```text
src/environments/environment.ts
```

Actualmente usa:

```ts
strapiUrl: 'https://promising-dog-f30d84cc7c.strapiapp.com'
```

Firebase esta configurado con el proyecto:

```text
proyectogrupo-85ca7
```

### 3. Ejecutar Angular

```powershell
npm start
```

Luego abrir:

```text
http://localhost:4200
```

## Configuracion de Strapi Cloud

El CMS esta publicado en:

```text
https://promising-dog-f30d84cc7c.strapiapp.com
```

Endpoints principales:

```text
/api/programadores?populate=*
/api/proyectos?populate=*
/api/servicios?populate=*
/api/tecnologias?populate=*
/api/configuracion-sitios?populate=*
```

Colecciones usadas:

- Programadores
- Proyectos
- Servicios
- Tecnologias
- ConfiguracionSitio

Permisos necesarios en Strapi:

```text
USERS & PERMISSIONS PLUGIN > Roles > Public
```

Activar `find` y `findOne` para las colecciones publicas.

## Configuracion de Firebase

Productos usados:

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

Proyecto:

```text
proyectogrupo-85ca7
```

Metodos de login habilitados:

- Correo electronico/contrasena
- Google

La coleccion de Firestore usada para solicitudes es:

```text
solicitudes
```

## Administradores de solicitudes

Los correos que pueden responder solicitudes son:

```text
sebas88@gmail.com
mateo.orellana2017@gmail.com
```

Cuando estos usuarios entran al panel, ven las solicitudes recibidas para su perfil de programador y pueden responderlas. Al responder, el estado cambia de:

```text
pendiente
```

a:

```text
respondida
```

## Despliegue en Firebase Hosting

### 1. Instalar Firebase CLI

```powershell
npm install -g firebase-tools
```

### 2. Iniciar sesion

```powershell
firebase login
```

### 3. Compilar la aplicacion

```powershell
npm run build
```

### 4. Desplegar

```powershell
firebase deploy
```

El archivo `firebase.json` usa como carpeta publica:

```text
dist/ProyectoPortafolio/browser
```

Tambien incluye rewrites para que Angular Router funcione al recargar rutas internas.

## Guia de usuario final

### Visitante

1. Entrar al sitio.
2. Explorar la pagina principal.
3. Dar click en una card de programador.
4. Revisar perfil, descripcion y proyectos.
5. Iniciar sesion para enviar una solicitud.

### Usuario autenticado

1. Crear cuenta o iniciar sesion.
2. Entrar al perfil de un programador.
3. Presionar `Enviar solicitud`.
4. Completar nombre, correo e idea del proyecto.
5. Enviar la solicitud.
6. Entrar a `Mis Solicitudes` para revisar el estado.

### Administrador/programador

1. Iniciar sesion con uno de los correos administradores.
2. Entrar a `Mis Solicitudes`.
3. Revisar solicitudes recibidas.
4. Presionar `Responder`.
5. Escribir una respuesta.
6. Guardar.
7. La solicitud queda marcada como `respondida`.

## Guia para administrar contenido en Strapi

Para cambiar contenido publico:

1. Entrar al panel de Strapi Cloud.
2. Ir a `Content Manager`.
3. Seleccionar la coleccion a editar.
4. Cambiar texto, enlaces o imagenes.
5. Guardar y publicar.
6. Recargar la aplicacion Angular.

Ejemplos de cambios:

- Cambiar foto de un programador.
- Editar descripcion del perfil.
- Agregar o modificar un proyecto.
- Cambiar iconos de tecnologias.
- Actualizar logo o enlaces en ConfiguracionSitio.

## Prueba de integracion con Strapi

Para demostrar que la informacion viene de Strapi:

1. Abrir la app desplegada.
2. Abrir Strapi Cloud.
3. Editar un registro visible, por ejemplo un servicio o tecnologia.
4. Guardar y publicar.
5. Recargar la app.
6. Verificar que el cambio aparece.

Tambien se puede abrir DevTools en el navegador y revisar las peticiones a:

```text
https://promising-dog-f30d84cc7c.strapiapp.com/api/...
```

## Comandos utiles

```powershell
npm start
npm run build
firebase deploy
```

## Estado actual

La aplicacion esta conectada a Strapi Cloud, Firebase Authentication, Firestore y Firebase Hosting. El contenido principal del portafolio se administra desde Strapi y las solicitudes se gestionan desde Firestore.
