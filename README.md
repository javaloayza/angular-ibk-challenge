# Challenge Angular Interbank - Aplicación de Gestión de Posts

Una aplicación Angular moderna construida con las últimas características de Angular 18, implementando un sistema híbrido de gestión de datos que consume la API de JSONPlaceholder mientras proporciona funcionalidad CRUD completa a través de persistencia en LocalStorage.

## 🚀 Instrucciones para Ejecutar el Proyecto

### Requisitos Previos
- Node.js (v18 o superior)
- npm (v9 o superior)  
- Angular CLI (v19)

### Instalación y Ejecución

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd angular-interbank-app

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ng serve

# La aplicación estará disponible en: http://localhost:4200
```

### Comandos Adicionales

```bash
# Build de producción
ng build

# Ejecutar pruebas unitarias
ng test

# Ejecutar linting
ng lint
```

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Angular 18**: Framework con las últimas características y componentes standalone
- **Componentes Standalone**: Arquitectura sin módulos para mejor tree-shaking
- **Signals**: Sistema moderno de reactividad para gestión de estado
- **RxJS**: Programación reactiva para manejo de APIs y funcionalidad de búsqueda
- **SCSS**: Preprocesador CSS con arquitectura mobile-first
- **TypeScript**: Tipado estricto con configuraciones avanzadas
- **Jasmine/Karma**: Framework de testing para pruebas unitarias

### Estructura del Proyecto

**Arquitectura Modular Basada en Features** con clara separación de responsabilidades:

```
src/app/
├── core/
│   └── services/           # ApiService, LocalStorageService
├── shared/
│   ├── components/        # Modal, SearchBox, Pagination
│   └── pipes/            # TruncatePipe
└── features/posts/
    ├── components/       # PostList, PostCard, PostDetail, PostForm
    ├── services/        # PostService, PostStateService  
    ├── models/          # Post, User, Comment interfaces
    └── ...
```

## 🔧 Decisiones Técnicas Principales

### 1. Sistema Híbrido de Gestión de Datos

**Desafío**: Proporcionar funcionalidad CRUD completa mientras se consume una API de solo lectura.

**Solución**: Implementé un enfoque híbrido combinando la API JSONPlaceholder con LocalStorage:

- **Posts de la API**: IDs 1-100, solo lectura desde JSONPlaceholder
- **Posts Personalizados**: IDs 10001+, CRUD completo en LocalStorage
- **Seguimiento de Posts Eliminados**: Mantiene lista de IDs de posts de API eliminados
- **Integración Transparente**: Interfaz de servicio única para ambas fuentes de datos

```typescript
// Acceso unificado a datos a través de PostService
getAllPosts(): Observable<Post[]> {
  return combineLatest([
    this.apiService.get<Post[]>('/posts').pipe(catchError(() => of([]))),
    of(this.localStorageService.getCustomPosts()),
    of(this.localStorageService.getDeletedPostIds())
  ]).pipe(
    map(([apiPosts, customPosts, deletedIds]) => {
      const filteredApiPosts = apiPosts.filter(post => !deletedIds.includes(post.id));
      return [...filteredApiPosts, ...customPosts].sort((a, b) => b.id - a.id);
    })
  );
}
```

### 2. Funcionalidades Modernas de Angular 18

**Componentes Standalone**: Adopté la arquitectura standalone nativa de Angular 18, eliminando la necesidad de NgModules tradicionales para mejor rendimiento y tamaños de bundle más pequeños.

**Signals para Gestión de Estado**: Utilicé el sistema de Signals nativo de Angular 18 en lugar de BehaviorSubjects para gestión de estado reactivo con detección automática de cambios y mejor rendimiento.

```

### 3. Optimizaciones de Rendimiento

**OnPush Change Detection**: Los componentes solo se re-renderizan cuando los inputs cambian o los signals se actualizan.

**Funciones TrackBy**: Renderizado de listas optimizado para prevenir manipulaciones innecesarias del DOM.

**Búsqueda con Debounce**: Retraso de 350ms para minimizar requests durante el tipeo del usuario.

**Carga Bajo Demanda**: Los comentarios se cargan solo cuando se accede a los detalles del post.

```typescript
// Función trackBy optimizada
trackByPostId(index: number, post: EnrichedPost): number {
  return post.id;
}
```

### 4. Implementación de Modales con JavaScript Puro

**Requerimiento**: Las interacciones de modal deben usar JavaScript puro (sin soluciones específicas de Angular).

**Implementación**: 
- Manejo de tecla ESC con event listeners nativos
- Funcionalidad de cerrar-al-hacer-clic-fuera
- Prevención de scroll del body con compensación de layout shift
- Gestión de foco para accesibilidad


### 5. Estrategia de Integración con APIs

**Desafío**: Enriquecer posts con datos de usuario e imágenes de múltiples fuentes.

**Solución**: Llamadas API paralelas con estrategias de fallback integrando múltiples servicios externos:

- **Avatares**: DiceBear Avatars API (https://api.dicebear.com) para generar avatares únicos por usuario
- **Imágenes de Posts**: Picsum Photos (https://picsum.photos) para imágenes placeholder aleatorias
- **Datos Base**: JSONPlaceholder para posts y usuarios

**Nota sobre Hardcoding**: Algunas URLs y configuraciones están hardcodeadas por optimización de tiempo de desarrollo para cumplir con todos los requerimientos del challenge más funcionalidades bonus y diseño visual completo. Ejemplos: SVG icons embebidos en componentes, URLs de APIs externas, breakpoints CSS responsivos, y configuraciones de paginación.

```typescript
getEnrichedPosts(): Observable<EnrichedPost[]> {
  return forkJoin({
    posts: this.getAllPosts(),
    users: this.getAllUsers()
  }).pipe(
    map(({ posts, users }) => {
      const userMap = new Map(users.map(user => [user.id, user]));
      
      return posts.map(post => {
        const user = userMap.get(post.userId) || this.createDefaultUser(post.userId);
        const hasImage = Math.random() > 0.3;
        
        return {
          ...post,
          user,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${post.userId}post${post.id}`,
          postImage: hasImage ? `https://picsum.photos/400/250?random=${post.id}` : undefined,
          hasImage
        } as EnrichedPost;
      });
    })
  );
}
```

### 6. Validaciones de Formularios Diferenciadas

**Modo Crear**: Validación campo por campo conforme el usuario interactúa
**Modo Editar**: Validación instantánea de todo el formulario al detectar cambios

## 🧪 Estrategia de Testing

### Enfoque de Pruebas Unitarias (15 Tests Esenciales)

Enfocado en validación de lógica de negocio más que cobertura exhaustiva:

**LocalStorageService** (5 tests): Persistencia de datos, operaciones CRUD, seguimiento de posts eliminados
**PostService** (6 tests): Gestión híbrida de datos, integración con API, manejo de errores  
**PostCardComponent** (4 tests): Lógica de permisos, interacciones de usuario, creación de componente

```bash
# Ejecutar tests
npm test

# Resultados actuales: 15 specs, 0 failures
```

### Filosofía de Testing

- **Enfoque en Lógica de Negocio**: Testear funcionalidad core, no detalles de implementación
- **Estrategia de Mocks**: Tests unitarios aislados con inyección de dependencias
- **Cobertura Esencial**: Enfoque de calidad sobre cantidad para el contexto del challenge

## 📱 Características de UI/UX

### Diseño Responsive
- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: Adaptación fluida desde móvil hasta desktop
- **Touch Interactions**: Optimizado para interacciones táctiles

### Tema Visual
- **Color Primario**: Verde Interbank (#279b57)
- **Gradientes**: Efectos visuales modernos con degradados
- **Iconografía**: SVGs optimizados para mejor rendimiento
- **Animaciones**: Transiciones suaves para mejor experiencia

### Accesibilidad
- **Contraste**: Colores que cumplen estándares WCAG
- **Navegación por Teclado**: Soporte completo para navegación sin mouse
- **Screen Readers**: Etiquetas ARIA y textos descriptivos
- **Focus Management**: Gestión apropiada del foco en modales

## 🌟 Funcionalidades Principales

### Gestión de Posts
- **Crear Posts**: Formulario con validaciones avanzadas
- **Editar Posts**: Solo posts creados por el usuario (ID 10001+)
- **Eliminar Posts**: Confirmación con modal y animaciones
- **Visualizar Posts**: Modal de preview con carga de comentarios

### Sistema de Búsqueda
- **Búsqueda en Tiempo Real**: Con debounce de 350ms
- **Múltiples Campos**: Busca en título, contenido y nombre de usuario
- **Resaltado Visual**: Indicador de término de búsqueda activo

### Paginación Inteligente
- **Navegación Fluida**: Controles de página anterior/siguiente
- **Números de Página**: Navegación directa a páginas específicas
- **Información Contextual**: "Mostrando X a Y de Z posts"

### Persistencia de Datos
- **LocalStorage**: Almacenamiento local para posts personalizados
- **Seguimiento de Estado**: Mantenimiento de posts eliminados
- **Recuperación**: Datos persisten entre sesiones del navegador

## 🔧 Configuración de Desarrollo

### Configuración TypeScript
- Tipado estricto habilitado
- Path mapping para imports limpios
- Opciones avanzadas del compilador para mejor tree-shaking

### Configuración Angular
- OnPush change detection por defecto
- Componentes standalone en toda la aplicación
- Configuración de build optimizada para producción

### Calidad de Código
- ESLint con reglas específicas de Angular
- Prettier para formateo consistente
- Configuración estricta de TypeScript

## 📊 Métricas del Proyecto

### Bundle Size
- **Desarrollo**: Variable según dependencias (incluye source maps y debugging)
- **Producción**: Optimizado con tree-shaking y minificación para tamaño mínimo

### Rendimiento
- **First Contentful Paint**: Optimizado con lazy loading
- **Largest Contentful Paint**: Imágenes optimizadas con placeholder
- **Cumulative Layout Shift**: Prevención de saltos de layout

### Cobertura de Tests
- **15 tests esenciales**: Enfocados en lógica de negocio crítica
- **0 failures**: Todos los tests pasan consistentemente
- **Cobertura estratégica**: Servicios core y componentes principales

---

**Desarrollado como parte del Challenge Técnico Angular Interbank - Demostrando prácticas modernas de desarrollo Angular, patrones arquitectónicos y toma de decisiones técnicas.**
