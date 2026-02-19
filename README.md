# ArcGIS Experience Builder - Custom Extensions

Este repositorio contiene extensiones personalizadas para ArcGIS Experience Builder 1.19.

## 📋 Descripción

Repositorio de extensiones personalizadas que incluye widgets y temas desarrollados para ArcGIS Experience Builder. Este proyecto se estructura siguiendo las mejores prácticas de desarrollo de extensiones para la plataforma ArcGIS.

## 🗂️ Estructura del Proyecto

```
your-extensions/
├── widgets/           # Widgets personalizados
│   ├── sigi-assets/
│   ├── sigi-ficha-proyecto/
│   ├── sigi-header/
│   ├── sigi-logo/
│   ├── sigi-search-panel/
│   ├── sigi-toolbar/
│   └── simple/
├── themes/            # Temas personalizados
├── manifest.json      # Configuración del repositorio
└── README.md
```

## 🚀 Instalación

1. Clone este repositorio en la carpeta de extensiones de ArcGIS Experience Builder:

```bash
git clone <repository-url> <arcgis-experience-builder>/client/your-extensions
```

2. Navegue a la carpeta de extensiones:

```bash
cd <arcgis-experience-builder>/client/your-extensions
```

3. Las extensiones estarán disponibles automáticamente en ArcGIS Experience Builder.

## 📦 Widgets Incluidos

### SIGI Assets
Widget para gestión de recursos y assets del sistema SIGI.

### SIGI Ficha Proyecto
Widget para visualización y gestión de fichas de proyectos.

### SIGI Header
Encabezado personalizado para la aplicación SIGI.

### SIGI Logo
Widget para mostrar el logo institucional.

### SIGI Search Panel
Panel de búsqueda avanzada integrado con el sistema SIGI.

### SIGI Toolbar
Barra de herramientas personalizada con funcionalidades específicas.

### Simple Widget
Widget de ejemplo simple para demostración.

## 🛠️ Desarrollo

### Requisitos Previos

- ArcGIS Experience Builder 1.19
- Node.js (versión recomendada según ArcGIS Experience Builder)
- npm o yarn

### Crear un Nuevo Widget

1. Cree una nueva carpeta dentro de `widgets/` con el nombre de su widget
2. Agregue los archivos requeridos:
   - `manifest.json` - Configuración del widget
   - `config.json` - Configuración por defecto
   - `src/` - Código fuente del widget

### Estructura de un Widget

```
mi-widget/
├── manifest.json
├── config.json
├── src/
│   ├── runtime/
│   │   └── widget.tsx
│   └── setting/
│       └── setting.tsx
└── images/
    └── icon.svg
```

## 📝 Configuración

El archivo `manifest.json` en la raíz define la configuración del repositorio de extensiones:

```json
{
  "name": "esri-core-repo",
  "type": "exb-web-extension-repo",
  "description": "This is a sample extension repository, put your extensions here.",
  "copyright": "",
  "license": "http://www.apache.org/licenses/LICENSE-2.0"
}
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Cree una rama para su funcionalidad (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit sus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abra un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo Apache License 2.0 - vea el archivo [LICENSE](LICENSE) para más detalles.

## 📚 Recursos

- [ArcGIS Experience Builder Developer Guide](https://developers.arcgis.com/experience-builder/)
- [Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/getting-started-widget/)
- [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/)

## 📧 Contacto

Para preguntas o soporte, por favor abra un issue en este repositorio.

---

**Nota:** Este es un repositorio de extensiones personalizadas para ArcGIS Experience Builder. Asegúrese de tener instalado ArcGIS Experience Builder 1.19 para utilizar estas extensiones.
