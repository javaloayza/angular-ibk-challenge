# Challenge Angular Interbank - Aplicación de Gestión de Posts

Una aplicación Angular moderna construida con las últimas características de Angular 18, implementando un sistema híbrido de gestión de datos que consume la API de JSONPlaceholder mientras proporciona funcionalidad CRUD completa a través de persistencia en LocalStorage.

## 🎥 Demo en Funcionamiento

![Demo de la Aplicación](https://res.cloudinary.com/dek59rwek/image/upload/v1756673679/Animation_rfnsu3.gif)

## 🚀 Instrucciones para Ejecutar el Proyecto

### Requisitos Previos
- Node.js (v18 o superior)
- npm (v9 o superior)  
- Angular CLI (v19)

### Instalación y Ejecución

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd angular-ibk-challenge

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ng serve

# La aplicación estará disponible en: http://localhost:4200
```


## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Angular 18**: Componentes standalone y Signals para mejor rendimiento
- **RxJS**: Manejo reactivo de APIs y búsqueda con debounce
- **SCSS**: Diseño responsive mobile-first
- **TypeScript**: Tipado estricto para mejor mantenibilidad

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

- **Posts de la API** (IDs 1-100): Solo lectura desde JSONPlaceholder
- **Posts personalizados** (IDs 10001+): CRUD completo en LocalStorage  
- **Seguimiento de eliminados**: Mantiene lista de IDs de posts de API eliminados
- **Integración transparente**: Interfaz de servicio única para ambas fuentes

### 2. Angular 18 Moderno

**Componentes Standalone**: Sin NgModules para mejor tree-shaking y bundles más pequeños.

**Signals**: Reactividad nativa de Angular 18 con detección automática de cambios.

**OnPush Change Detection**: Los componentes solo se re-renderizan cuando los inputs cambian o los signals se actualizan, mejorando el rendimiento.

**TrackBy Functions**: Optimización de renderizado en listas para prevenir manipulaciones innecesarias del DOM cuando los datos cambian.

### 3. Modal con JavaScript Puro

**Implementación nativa**: Event listeners para ESC, click outside, gestión de foco y prevención de scroll.

### 4. Integración Multi-API

**forkJoin** para llamadas paralelas combinando:
- **JSONPlaceholder**: Posts y usuarios base
- **DiceBear**: Avatares únicos generados
- **Picsum**: Imágenes aleatorias para posts

**Resultado**: Posts enriquecidos con datos visuales y metadata completa.


## ✅ Cumplimiento de Requisitos del Challenge

### Requisitos Mínimos Completados:
1. **Listado con paginación** ✅ - 10 posts por página con navegación funcional
2. **Búsqueda dinámica** ✅ - Filtro en tiempo real con debounce de 350ms
3. **Detalle del ítem** ✅ - Modal y página de detalle (versión demo implementa ambas opciones)
4. **Manejo de estado** ✅ - Servicios Angular con loading states y manejo de errores
5. **JavaScript puro** ✅ - Event listeners nativos para modal (ESC key, click outside, scroll prevention)
6. **Responsive + SCSS** ✅ - Diseño mobile-first con arquitectura SCSS moderna

### Bonus Features Implementados:
- **✅ RxJS**: forkJoin, debounceTime, switchMap para manejo reactivo
- **✅ Formularios reactivos**: Validaciones avanzadas para crear/editar posts
- **✅ Angular Router**: Navegación entre /posts, /posts/new, /posts/edit/:id
- **✅ Tests unitarios**: 15 specs con Jasmine/Karma (0 failures)

## 🧪 Testing

**15 tests esenciales** enfocados en lógica de negocio crítica:
- LocalStorageService: CRUD y persistencia
- PostService: Gestión híbrida de datos  
- PostCardComponent: Interacciones de usuario

```bash
npm test  # 15 specs, 0 failures
```

---

**Desarrollado como parte del Challenge Técnico Angular Interbank - Demostrando prácticas modernas de desarrollo Angular, patrones arquitectónicos y toma de decisiones técnicas.**
