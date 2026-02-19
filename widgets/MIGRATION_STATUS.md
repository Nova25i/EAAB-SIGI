# Estado de Migración SIGI a Experience Builder

## Resumen de Widgets Creados

Todos los widgets han sido creados directamente en:
`D:\arcgis-experience-builder-1.19\client\your-extensions\widgets\`

### ✅ Widgets Completados

#### 1. sigi-toolbar
- **Ubicación**: `sigi-toolbar/`
- **Archivos**:
  - `manifest.json` - Metadatos del widget
  - `config.json` - Configuración por defecto
  - `src/config.ts` - Interfaz TypeScript
  - `src/runtime/widget.tsx` - Componente React principal
- **Funcionalidad**: Barra vertical de herramientas con botones para:
  - Medición
  - Galería de mapas base
  - Lista de capas
  - Herramientas de dibujo
  - Compartir

#### 2. sigi-logo
- **Ubicación**: `sigi-logo/`
- **Archivos**:
  - `manifest.json` - Metadatos del widget
  - `config.json` - URLs de imágenes y link
  - `src/config.ts` - Interfaz TypeScript
  - `src/runtime/widget.tsx` - Componente con efecto hover
- **Funcionalidad**: Logo EAAB con efecto hover y enlace a sitio web

#### 3. sigi-header
- **Ubicación**: `sigi-header/`
- **Archivos**:
  - `manifest.json` - Metadatos del widget
  - `config.json` - Configuración del geocodificador
  - `src/config.ts` - Interfaz TypeScript
  - `src/runtime/widget.tsx` - Barra de búsqueda y navegación
- **Funcionalidad**: Barra superior con:
  - Campo de búsqueda (geocodificador)
  - Botón Zoom In
  - Botón Zoom Out
  - Botón Home (extensión inicial)
  - Botón Mi Ubicación (geolocalización)

#### 4. sigi-search-panel
- **Ubicación**: `sigi-search-panel/`
- **Archivos**:
  - `manifest.json` - Metadatos del widget
  - `config.json` - URLs de servicios y opciones de filtros
  - `src/config.ts` - Interfaces TypeScript
  - `src/runtime/widget.tsx` - Panel completo de búsqueda (~700 líneas)
- **Funcionalidad** (equivalente a widget Macroproyectos WAB):
  - Acordeón con 3 secciones de búsqueda:
    - Búsqueda General (por localidad)
    - Búsqueda Específica (PDD + Estado)
    - Búsqueda por Proyecto (código + contrato)
  - Tabla de resultados con proyectos
  - Botón de descarga a CSV/Excel
  - Zoom a proyecto seleccionado
  - Filtrado dinámico de capa en mapa

#### 5. sigi-ficha-proyecto
- **Ubicación**: `sigi-ficha-proyecto/`
- **Archivos**:
  - `manifest.json` - Metadatos del widget
  - `config.json` - Configuración de URLs e imágenes
  - `src/config.ts` - Interfaces TypeScript (ProjectData, ContractData, PopulationData)
  - `src/runtime/widget.tsx` - Modal con pestañas (~800 líneas)
- **Funcionalidad** (equivalente a widget PopUpAcueducto WAB):
  - Modal responsive con información del proyecto
  - Pestaña "Descripción Inversión":
    - Objetivo del proyecto
    - Información de inversión y fechas
    - Estado de avance por fases (Fase 1, 2, 3, Otros Costos)
    - Imagen del proyecto
  - Pestaña "Detalle de Ejecución":
    - Sidebar con selector de fases
    - Tarjetas de contratos por fase
    - Barras de progreso (físico y financiero)
  - Pestaña "Población Beneficiada":
    - Total de población beneficiada
    - Desglose por género, edad, etnia
    - Nota informativa

### 📁 sigi-assets
- **Ubicación**: `sigi-assets/images/`
- **Contenido**: Imágenes compartidas
  - logo.png, logoover.png, app-logo.png
  - Imágenes de fases (Fase1On.png, Fase1Off.png, etc.)
  - Indicadores y otros recursos

## Configuración del WebMap y Capas

### Portal y Servicios
- **Portal ArcGIS**: https://www.acueducto.com.co/portalgis
- **WebMap ID**: f4eccdc1647b438db6b64462a80ff2b3
- **Feature Service**: https://www.acueducto.com.co/servergis/rest/services/SIGI/SIGI/FeatureServer

### Capas del Feature Service

#### Capa 0: Proyectos SIGI
- **URL**: https://www.acueducto.com.co/servergis/rest/services/SIGI/SIGI/FeatureServer/0
- **Tipo**: Feature Layer (Polígonos/Puntos)
- **Campos principales**:
  - `OBJECTID` - ID único del feature
  - `COD_PROYEC` - Código del proyecto (ej: "AA-0000-000")
  - `NOM_PROYEC` - Nombre del proyecto
  - `ESTADO` - Estado del proyecto (Suscrito, En Ejecución, Terminado, etc.)
  - `PDD` - Plan de Desarrollo Distrital (BMPT, NCSA, BCS)
  - `LOCALIDAD` - Nombre de la localidad
  - `MACROPROY` - Macroproyecto asociado
  - `ALC_PROYEC` - Alcance del proyecto
  - `FECHA_INICIO` - Fecha de inicio (timestamp)
  - `FECHA_FIN` - Fecha de finalización (timestamp)
  - `FECHA_POS_FIN_PRY` - Fecha posible fin proyecto
  - `FECHA_LIQ_PRY` - Fecha de liquidación
- **Usado por**: sigi-search-panel, sigi-ficha-proyecto
- **Geometría**: Polígonos o puntos en coordenadas geográficas (WKID: 4686 o 4326)

#### Capa 1: Localidades de Bogotá
- **URL**: https://www.acueducto.com.co/servergis/rest/services/SIGI/SIGI/FeatureServer/1
- **Tipo**: Feature Layer (Polígonos)
- **Campos principales**:
  - `OBJECTID` - ID único del feature
  - `LOCNOMBRE` o `NOMBRE` - Nombre de la localidad
  - Geometría de límites de localidades
- **Usado por**: sigi-search-panel (filtro por localidad)
- **Geometría**: Polígonos de límites administrativos

### Otros Servicios

#### Geocodificador EAAB
- **URL**: https://www.acueducto.com.co/servergis/rest/services/Localizador/LocalizadorEAAB/GeocodeServer
- **Usado por**: sigi-header (barra de búsqueda)
- **Función**: Búsqueda de direcciones y lugares en Bogotá

#### Imágenes de Proyectos
- **Template URL**: https://www.acueducto.com.co/sigipruebas/images/proyectos/{0}.jpg
- **Usado por**: sigi-ficha-proyecto
- **Función**: Mostrar imágenes de los proyectos usando el código del proyecto

## Colores Corporativos

| Color | Hex | Uso |
|-------|-----|-----|
| Primario | #0083DB | Botones, enlaces, bordes activos |
| Hover | #139BF5 | Estado hover de botones |
| Borde | #005791 | Bordes oscuros |
| Info | #108adc | Títulos, texto informativo |
| Danger/Accent | #dc3545 | Código de proyecto, alertas |
| Background | #f9f9f9 | Fondo de paneles |

## Próximos Pasos

1. **Reiniciar Experience Builder** para que detecte los nuevos widgets:
   ```powershell
   cd D:\arcgis-experience-builder-1.19\client
   npm start
   ```

2. **Crear nueva experiencia** y agregar los widgets:
   - Agregar widget Map conectado al WebMap
   - Agregar sigi-search-panel al panel lateral derecho
   - Agregar sigi-toolbar flotante a la izquierda
   - Agregar sigi-logo en la esquina superior izquierda
   - Agregar sigi-header en la parte superior
   - Agregar sigi-ficha-proyecto (se activa con click en mapa)

3. **Configurar cada widget** con el datasource del mapa:
   
   **IMPORTANTE**: Los widgets SIGI están diseñados para detectar automáticamente las capas del mapa. 
   Solo necesitas conectarlos al widget Map y ellos encontrarán las capas correctas.
   
   a. **Selecciona el widget** que quieres configurar (click sobre él)
   
   b. **En el panel derecho** (Configuración), verás:
      - **"Seleccionar Widget de Mapa"**: Haz click y selecciona el widget Map que agregaste
      - Las URLs de servicios ya están preconfiguradas en cada widget
      - Los colores corporativos ya están aplicados por defecto
   
   c. **Configuración específica por widget**:
      
      | Widget | Configuraciones Disponibles | URLs Preconfiguradas |
      |--------|---------------------------|---------------------|
      | sigi-search-panel | Mapa, URLs de capas, WebMap ID, PDD, Estados, Colores | ✅ Capa 0 (Proyectos)<br>✅ Capa 1 (Localidades) |
      | sigi-toolbar | Mapa, Herramientas visibles, Colores | N/A - Usa capas del mapa |
      | sigi-header | Mapa, URL Geocodificador, Placeholder, Colores | ✅ Geocodificador EAAB |
      | sigi-ficha-proyecto | Mapa, URL capa proyectos, Template imágenes, Colores | ✅ Capa 0 (Proyectos)<br>✅ Template de imágenes |
      | sigi-logo | URL de imágenes, Link destino | ✅ Logos EAAB |
   
   d. **Detección Automática de Capas** (sigi-search-panel):
      
      El widget busca las capas en este orden:
      1. Por URLs configuradas en el panel de configuración
      2. Por títulos/palabras clave ("proyecto", "sigi", "localidad")
      3. Por campos característicos (COD_PROYEC, NOM_PROYEC, LOCNOMBRE)
      4. Por índice en el Feature Service (/0 para proyectos, /1 para localidades)
      
      **Campos detectados automáticamente**:
      - Código de Proyecto: `COD_PROYEC`, `CODIGO_PROYECTO`, `COD_PROYECTO`, `CODIGO`
      - Nombre de Proyecto: `NOM_PROYEC`, `NOMBRE_PROYECTO`, `NOM_PROYECTO`, `NOMBRE`
      - Estado: `ESTADO`, `EST_PROYEC`, `ESTADO_PROYECTO`
      - PDD: `PDD`, `PLAN_DESARROLLO`, `PLAN_DES`
      - Localidad: `LOCALIDAD`, `LOC_NOMBRE`, `NOMBRE_LOCALIDAD`, `NOM_LOC`
   
   e. **Verificar Conexión**:
      
      Abre la consola del navegador (F12) y busca logs con prefijo `[SIGI Search]`:
      ```
      [SIGI Search] All layers in map: ...
      [SIGI Search] Found proyectos layer: ...
      [SIGI Search] Found localidades layer: ...
      [SIGI Search] Proyectos layer fields: ...
      [SIGI Search] Loaded X features
      ```
      
      Si ves estos mensajes, la conexión está funcionando correctamente.

4. **Ajustar estilos** según necesidad

5. **Probar funcionalidad** con datos reales

6. **Publicar** la aplicación

## Dependencias de Widgets

Todos los widgets requieren:
- `jimu-core` - Framework base de Experience Builder
- `jimu-arcgis` - Integración con ArcGIS (JimuMapViewComponent)
- `@arcgis/core` - ArcGIS Maps SDK for JavaScript

## Notas Técnicas

- Los widgets usan React con TypeScript
- Los estilos usan CSS-in-JS con emotion (jsx/css)
- La integración con el mapa se hace mediante JimuMapViewComponent
- Los queries a Feature Layers usan @arcgis/core/rest/support/Query

## Troubleshooting: Conexión de Capas

### Problema: Widget no encuentra las capas

**Síntomas**:
- Panel de búsqueda vacío o sin opciones
- Mensajes en consola: "No feature layers found in map"
- Filtros no funcionan

**Soluciones**:

1. **Verificar que el WebMap contiene las capas correctas**:
   - Abre el WebMap en el portal: https://www.acueducto.com.co/portalgis
   - Verifica que las capas del Feature Service estén agregadas
   - Asegúrate de que las capas estén visibles y habilitadas

2. **Verificar conexión del widget al Map**:
   - Selecciona el widget en Experience Builder
   - En el panel de configuración, verifica que el "Widget de Mapa" esté seleccionado
   - Si no hay mapas disponibles, primero agrega un widget Map a tu experiencia

3. **Revisar logs de consola**:
   - Presiona F12 para abrir Developer Tools
   - Ve a la pestaña "Console"
   - Busca mensajes con `[SIGI Search]`
   - Los logs te indicarán qué capas se encontraron y qué campos se detectaron

4. **Verificar URLs de servicio**:
   - Si las capas no se detectan automáticamente, configúralas manualmente:
     - Selecciona el widget sigi-search-panel
     - En configuración, ingresa manualmente:
       - URL Capa de Proyectos: `https://www.acueducto.com.co/servergis/rest/services/SIGI/SIGI/FeatureServer/0`
       - URL Capa de Localidades: `https://www.acueducto.com.co/servergis/rest/services/SIGI/SIGI/FeatureServer/1`

5. **Verificar acceso al servicio**:
   - Abre en el navegador: https://www.acueducto.com.co/servergis/rest/services/SIGI/SIGI/FeatureServer
   - Deberías ver la descripción del servicio y las capas disponibles
   - Si no carga, puede haber un problema de red o permisos

### Problema: Campos no se muestran correctamente

**Síntomas**:
- Tabla de resultados muestra "Sin código" o "Sin nombre"
- Filtros no funcionan correctamente

**Soluciones**:

1. **Los widgets detectan automáticamente variaciones de nombres de campos**:
   - Si tu servicio usa nombres diferentes (ej: `CODIGO_PROYECTO` en vez de `COD_PROYEC`)
   - El widget debería detectarlos automáticamente
   - Revisa los logs de consola para ver qué campos se detectaron

2. **Agregar nuevas variaciones de campos**:
   - Edita el archivo `widget.tsx` del widget correspondiente
   - Busca las constantes de campos (ej: `codeFieldNames`)
   - Agrega el nombre de tu campo a la lista

### Problema: Filtros no aplican a la capa del mapa

**Síntomas**:
- Los resultados se muestran en la tabla
- Pero la capa del mapa muestra todos los proyectos

**Soluciones**:

1. **Verificar que la capa es editable**:
   - La capa debe permitir `definitionExpression`
   - Algunas capas de solo lectura no permiten filtros dinámicos

2. **Revisar permisos de la capa**:
   - La capa debe estar agregada directamente al mapa
   - No debe estar dentro de un Group Layer protegido

### Logs útiles para debugging

Busca estos mensajes en la consola del navegador:

```javascript
// Inicialización correcta
[SIGI Search] All layers in map: ...
[SIGI Search] Found proyectos layer: Nombre de la Capa
[SIGI Search] Proyectos layer fields: [{name: "COD_PROYEC", ...}, ...]
[SIGI Search] Loaded 150 features

// Detección de campos
[SIGI Search] Using code field: COD_PROYEC
[SIGI Search] Found localidad name field: LOCNOMBRE
[SIGI Search] Loaded 20 unique localidades: ["Kennedy", "Suba", ...]

// Aplicación de filtros
[SIGI Search] Applying filters: {selectedPDD: ["BMPT"], ...}
[SIGI Search] After PDD filter: 45 features
[SIGI Search] After Estado filter: 23 features

// Exportación
[SIGI Search] Exporting 23 features to CSV
```

Si no ves estos mensajes o hay errores, revisa la configuración del widget y la conexión al mapa.
