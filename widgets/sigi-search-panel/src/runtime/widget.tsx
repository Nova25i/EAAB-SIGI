/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, DataSourceComponent } from 'jimu-core';
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis';
import { Collapse, Button, TextInput, Loading, Alert } from 'jimu-ui';
import { type IMConfig, type PDDOption, type EstadoOption } from '../config';

// ArcGIS Core imports
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Point from '@arcgis/core/geometry/Point';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import * as locator from '@arcgis/core/rest/locator';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Color from '@arcgis/core/Color';

// Interfaces
interface ProjectFeature {
  attributes: {
    OBJECTID: number;
    COD_PROYEC: string;
    NOM_PROYEC: string;
    ALC_PROYEC?: string;
    ESTADO?: string;
    PDD?: string;
    MACROPROY?: string;
    LOCALIDAD?: string;
    FECHA_INICIO?: number;
    FECHA_FIN?: number;
    FECHA_POS_FIN_PRY?: number;
    FECHA_LIQ_PRY?: number;
    [key: string]: any;
  };
  geometry?: __esri.Geometry;
}

interface WidgetState {
  jimuMapView: JimuMapView | null;
  proyectosLayer: FeatureLayer | null;
  localidadesLayer: FeatureLayer | null;
  graphicsLayer: GraphicsLayer | null;
  geocoderGraphicsLayer: GraphicsLayer | null;
  
  // Data
  allFeatures: ProjectFeature[];
  filteredFeatures: ProjectFeature[];
  localidades: string[];
  localidadFieldName: string; // Campo dinámico para localidades
  
  // Filters
  selectedPDD: string[];
  selectedEstados: string[];
  selectedLocalidad: string;
  projectCode: string;
  contractNumber: string;
  
  // Search
  searchText: string;
  searchResults: any[];
  showSearchResults: boolean;
  geocoderSuggestions: any[];
  showGeocoderSuggestions: boolean;
  
  // UI State
  isLoading: boolean;
  expandedSection: string;
  showPDDDescription: boolean;
  currentPDDDescription: PDDOption | null;
  
  // Validation
  projectCodeError: boolean;
  contractNumberError: boolean;
}

// Styles
const widgetStyles = css`
  .sigi-search-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    font-family: 'Montserrat', sans-serif;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1;
  }

  .search-section {
    padding: 16px 20px;
    overflow-y: auto;
    flex: 1;
  }

  .accordion-header {
    background-color: transparent;
    color: #108adc;
    font-weight: bold;
    font-size: 14px;
    padding: 12px 0;
    cursor: pointer;
    border: none;
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    border-radius: 0;
    transition: all 0.2s ease;
  }

  .accordion-header:hover {
    background-color: transparent;
  }

  .accordion-header.active {
    font-weight: 800;
  }

  .accordion-content {
    background-color: #ffffff;
    padding: 12px 0;
    border: none;
    border-radius: 0;
    margin-bottom: 8px;
  }

  .description-text {
    font-size: 12px;
    color: #878484;
    margin-bottom: 8px;
    display: block;
  }

  .search-box-title {
    color: #878484;
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 6px;
    display: block;
  }

  .filter-box {
    background-color: #eeeeee;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #808080;
    cursor: pointer;
  }

  .checkbox-label input {
    margin-right: 10px;
    cursor: pointer;
  }

  .pdd-description-box {
    background-color: #eeeeee;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 10px;
    color: #808080;
    font-size: 11px;
  }

  .pdd-description-text {
    font-size: 10px;
    margin-bottom: 2px;
  }

  .pdd-date-text {
    font-size: 9px;
    color: #a0a0a0;
  }

  .filter-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .filter-col {
    flex: 1;
  }

  .search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
  }

  .search-input::placeholder {
    color: #808080;
    font-size: 12px;
  }

  .error-text {
    color: red;
    font-size: 10px;
    font-weight: bold;
    margin-top: 4px;
    display: block;
  }

  .clear-button-container {
    text-align: center;
    padding: 16px 20px;
  }

  .clear-button {
    background-color: #0079c1;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .clear-button:hover {
    background-color: #005a8f;
  }

  .results-section {
    border-top: 2px solid #0083DB;
    background-color: #fff;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    color: #108adc;
    font-size: 14px;
  }

  .results-count {
    font-weight: bold;
  }

  .download-button {
    background-color: #0083DB;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>');
    background-size: 18px 18px;
    background-repeat: no-repeat;
    background-position: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .download-button:hover {
    background-color: #139BF5;
  }

  .projects-table-container {
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .projects-table {
    width: 100%;
    border-collapse: collapse;
  }

  .projects-table tbody tr {
    background-color: #eeeeee;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .projects-table tbody tr:hover {
    background-color: #939393;
  }

  .projects-table tbody tr:hover td {
    color: #eeeeee;
  }

  .projects-table td {
    padding: 10px;
    text-align: left;
    color: #808080;
    font-size: 12px;
    border-bottom: 1px solid #ddd;
  }

  .projects-table td:first-child {
    width: 35%;
    font-weight: 500;
  }

  .view-button {
    background-color: #0083DB;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>');
    background-size: 16px 20px;
    background-repeat: no-repeat;
    background-position: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .view-button:hover {
    background-color: #139BF5;
  }

  .spinner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .localidad-select {
    width: 100%;
    margin-top: 4px;
    border: 1px solid #ccc !important;
    border-radius: 0 !important;
  }

  .localidad-select .jimu-dropdown-button {
    border-radius: 0 !important;
  }

  .localidad-native-select {
    width: 100%;
    margin-top: 4px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 0;
    font-size: 12px;
    background-color: #fff;
    color: #333;
    cursor: pointer;
    appearance: auto;
  }

  .localidad-native-select:focus {
    outline: none;
    border-color: #0083DB;
  }

  .search-with-icon {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 0;
    background-color: #fff;
    margin-top: 8px;
    position: relative;
  }

  .search-with-icon input {
    flex: 1;
    border: none;
    padding: 8px 12px;
    font-size: 12px;
    outline: none;
    background: transparent;
  }

  .search-with-icon input::placeholder {
    color: #999;
  }

  .search-with-icon .search-icon {
    padding: 8px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-right: 1px solid #ccc;
  }

  .search-with-icon .dropdown-arrow {
    color: #666;
    font-size: 10px;
    padding: 0 8px;
  }

  .search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 50;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .search-result-item {
    padding: 10px 12px;
    cursor: pointer;
    font-size: 12px;
    color: #333;
    border-bottom: 1px solid #eee;
  }

  .search-result-item:hover {
    background-color: #f0f0f0;
  }

  .search-result-item:last-child {
    border-bottom: none;
  }

  .arrow-icon {
    transition: transform 0.3s ease;
  }

  .arrow-icon.expanded {
    transform: rotate(180deg);
  }
`;

export default class SigiSearchPanel extends React.PureComponent<AllWidgetProps<IMConfig>, WidgetState> {
  
  private searchContainerRef = React.createRef<HTMLDivElement>();
  private geocoderContainerRef = React.createRef<HTMLDivElement>();
  private locatorUrl = 'https://utility.arcgis.com/usrsvcs/servers/7f935bb47e864c7398662cadeff7db41/rest/services/World/GeocodeServer';
  private geocoderTimeout: any = null;

  constructor(props: AllWidgetProps<IMConfig>) {
    super(props);
    this.state = {
      jimuMapView: null,
      proyectosLayer: null,
      localidadesLayer: null,
      graphicsLayer: null,
      geocoderGraphicsLayer: null,
      allFeatures: [],
      filteredFeatures: [],
      localidades: [],
      localidadFieldName: 'LOCNOMBRE',
      selectedPDD: [],
      selectedEstados: [],
      selectedLocalidad: '',
      projectCode: '',
      contractNumber: '',
      searchText: '',
      searchResults: [],
      showSearchResults: false,
      geocoderSuggestions: [],
      showGeocoderSuggestions: false,
      isLoading: false,
      expandedSection: '', // Ninguna sección colapsable abierta por defecto
      showPDDDescription: false,
      currentPDDDescription: null,
      projectCodeError: false,
      contractNumberError: false
    };
  }

  componentDidMount(): void {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount(): void {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  handleClickOutside = (event: MouseEvent): void => {
    if (this.searchContainerRef.current && 
        !this.searchContainerRef.current.contains(event.target as Node)) {
      this.setState({ 
        showSearchResults: false,
        showGeocoderSuggestions: false 
      });
    }
  };

  // Map view handler
  onActiveViewChange = (jimuMapView: JimuMapView): void => {
    if (jimuMapView) {
      this.setState({ jimuMapView }, () => {
        this.initializeLayers();
      });
    }
  };

  // Initialize layers - Usar las capas del mapa en lugar de crear nuevas
  initializeLayers = async (): Promise<void> => {
    const { jimuMapView } = this.state;
    const { config } = this.props;
    
    if (!jimuMapView) return;

    this.setState({ isLoading: true });

    try {
      // Create graphics layer for search results
      let graphicsLayer = jimuMapView.view.map.findLayerById('sigi-search-graphics') as GraphicsLayer;
      if (!graphicsLayer) {
        graphicsLayer = new GraphicsLayer({ 
          id: 'sigi-search-graphics',
          title: 'Resultados de Búsqueda SIGI',
          listMode: 'hide'
        });
        jimuMapView.view.map.add(graphicsLayer);
      }

      // Buscar las capas en el mapa existente
      const allLayers = jimuMapView.view.map.allLayers;
      console.log('[SIGI Search] All layers in map:', allLayers.map(l => ({ 
        id: l.id, 
        title: l.title, 
        type: l.type,
        url: (l as any).url 
      })).toArray());

      let proyectosLayer: FeatureLayer | null = null;
      let localidadesLayer: FeatureLayer | null = null;

      // 1. Intentar usar URLs de configuración si están disponibles
      if (config?.proyectosLayerUrl) {
        const matchingLayer = allLayers.find((l: any) => 
          l.type === 'feature' && l.url && l.url.includes(config.proyectosLayerUrl)
        );
        if (matchingLayer) {
          proyectosLayer = matchingLayer as FeatureLayer;
          console.log('[SIGI Search] Found proyectos layer from config URL:', proyectosLayer.title);
        }
      }

      if (config?.localidadesLayerUrl) {
        const matchingLayer = allLayers.find((l: any) => 
          l.type === 'feature' && l.url && l.url.includes(config.localidadesLayerUrl)
        );
        if (matchingLayer) {
          localidadesLayer = matchingLayer as FeatureLayer;
          console.log('[SIGI Search] Found localidades layer from config URL:', localidadesLayer.title);
        }
      }

      // 2. Buscar por título o palabras clave
      if (!proyectosLayer || !localidadesLayer) {
        allLayers.forEach((layer: any) => {
          if (layer.type === 'feature') {
            const title = (layer.title || '').toLowerCase();
            const url = (layer.url || '').toLowerCase();
            const layerId = (layer.id || '').toLowerCase();
            
            // Identificar capa de proyectos
            if (!proyectosLayer && (
              title.includes('proyecto') || 
              title.includes('sigi') || 
              title.includes('eaab') ||
              title.includes('alcantarillado') ||
              layerId.includes('proyecto') ||
              (url && (url.includes('featureserver/0') || url.endsWith('/0')))
            )) {
              proyectosLayer = layer as FeatureLayer;
              console.log('[SIGI Search] Found proyectos layer by keyword:', layer.title);
            }
            
            // Identificar capa de localidades
            if (!localidadesLayer && (
              title.includes('localidad') || 
              title.includes('localidades') ||
              layerId.includes('localidad') ||
              (url && (url.includes('featureserver/1') || url.endsWith('/1')))
            )) {
              localidadesLayer = layer as FeatureLayer;
              console.log('[SIGI Search] Found localidades layer by keyword:', layer.title);
            }
          }
        });
      }

      // 3. Buscar por campos característicos
      if (!proyectosLayer) {
        const featureLayers = allLayers.filter((l: any) => l.type === 'feature').toArray();
        for (const layer of featureLayers) {
          const fl = layer as FeatureLayer;
          if (fl.fields) {
            const fieldNames = fl.fields.map(f => f.name.toUpperCase());
            // Si tiene campos típicos de proyectos
            if (fieldNames.includes('COD_PROYEC') || 
                fieldNames.includes('NOM_PROYEC') || 
                fieldNames.includes('CODIGO_PROYECTO')) {
              proyectosLayer = fl;
              console.log('[SIGI Search] Found proyectos layer by fields:', fl.title);
              break;
            }
          }
        }
      }

      // 4. Como último recurso, usar las primeras capas feature
      if (!proyectosLayer) {
        const featureLayers = allLayers.filter((l: any) => l.type === 'feature').toArray();
        if (featureLayers.length > 0) {
          proyectosLayer = featureLayers[0] as FeatureLayer;
          console.log('[SIGI Search] Using first feature layer as proyectos:', proyectosLayer.title);
        }
        if (featureLayers.length > 1 && !localidadesLayer) {
          localidadesLayer = featureLayers[1] as FeatureLayer;
          console.log('[SIGI Search] Using second feature layer as localidades:', localidadesLayer.title);
        }
      }

      // Log de campos disponibles
      if (proyectosLayer) {
        console.log('[SIGI Search] Proyectos layer fields:', proyectosLayer.fields?.map(f => ({
          name: f.name,
          alias: f.alias,
          type: f.type
        })));
      }
      if (localidadesLayer) {
        console.log('[SIGI Search] Localidades layer fields:', localidadesLayer.fields?.map(f => ({
          name: f.name,
          alias: f.alias,
          type: f.type
        })));
      }

      this.setState({
        proyectosLayer,
        localidadesLayer,
        graphicsLayer
      }, () => {
        if (proyectosLayer) {
          this.loadAllFeatures();
        } else {
          console.warn('[SIGI Search] No proyectos layer found');
          this.setState({ isLoading: false });
        }
        if (localidadesLayer) {
          this.loadLocalidades();
        } else {
          console.warn('[SIGI Search] No localidades layer found - localidades filter will not be available');
        }
      });

    } catch (error) {
      console.error('[SIGI Search] Error initializing layers:', error);
      this.setState({ isLoading: false });
    }
  };

  // Load all project features
  loadAllFeatures = async (): Promise<void> => {
    const { proyectosLayer } = this.state;
    if (!proyectosLayer) return;

    try {
      console.log('[SIGI Search] Loading all features from:', proyectosLayer.title);
      
      const query = new Query();
      query.where = '1=1';
      query.returnGeometry = true;
      query.outFields = ['*'];

      const result = await proyectosLayer.queryFeatures(query);
      console.log('[SIGI Search] Loaded', result.features.length, 'features');
      
      if (result.features.length > 0) {
        console.log('[SIGI Search] Sample feature attributes:', result.features[0].attributes);
      }

      const features = result.features.map(f => ({
        attributes: f.attributes,
        geometry: f.geometry
      })) as ProjectFeature[];

      // Detectar campo de código de proyecto
      const possibleCodeFields = ['COD_PROYEC', 'CODIGO_PROYECTO', 'COD_PROYECTO', 'CODIGO', 'CODE'];
      let codeField = 'COD_PROYEC';
      if (features.length > 0) {
        const firstFeature = features[0].attributes;
        const foundField = possibleCodeFields.find(field => field in firstFeature);
        if (foundField) {
          codeField = foundField;
          console.log('[SIGI Search] Using code field:', codeField);
        }
      }

      // Sort by project code
      features.sort((a, b) => {
        const codeA = a.attributes[codeField] || '';
        const codeB = b.attributes[codeField] || '';
        return codeA.toString().localeCompare(codeB.toString());
      });

      this.setState({ 
        allFeatures: features,
        isLoading: false 
      });

    } catch (error) {
      console.error('[SIGI Search] Error loading features:', error);
      this.setState({ isLoading: false });
    }
  };

  // Load localidades for dropdown
  loadLocalidades = async (): Promise<void> => {
    const { localidadesLayer } = this.state;
    if (!localidadesLayer) {
      console.log('[SIGI Search] No localidades layer available');
      return;
    }

    try {
      // Primero obtener los campos disponibles
      const fields = localidadesLayer.fields;
      console.log('[SIGI Search] Localidades layer fields:', fields?.map(f => ({ 
        name: f.name, 
        alias: f.alias,
        type: f.type 
      })));

      // Buscar el campo correcto para el nombre de localidad
      const possibleFields = ['LOCNOMBRE', 'LocNombre', 'NOMBRE', 'Nombre', 'NAME', 'NOM_LOC', 'LOCALIDAD', 'NOMBRE_LOCALIDAD'];
      let nameField = 'LOCNOMBRE';
      
      if (fields) {
        const foundField = fields.find(f => 
          possibleFields.some(pf => f.name.toUpperCase() === pf.toUpperCase())
        );
        if (foundField) {
          nameField = foundField.name;
          console.log('[SIGI Search] Found localidad name field:', nameField);
        } else {
          // Si no encuentra, usar el primer campo de tipo string
          const stringField = fields.find(f => f.type === 'string' || f.type === 'esriFieldTypeString');
          if (stringField) {
            nameField = stringField.name;
            console.log('[SIGI Search] Using first string field for localidades:', nameField);
          }
        }
      }

      const query = new Query();
      query.where = '1=1';
      query.returnGeometry = false;
      query.outFields = ['*'];
      query.returnDistinctValues = false;

      const result = await localidadesLayer.queryFeatures(query);
      
      console.log('[SIGI Search] Localidades query result:', result.features.length, 'features');
      if (result.features.length > 0) {
        console.log('[SIGI Search] Sample localidad attributes:', result.features[0].attributes);
      }

      const localidades = [...new Set(
        result.features
          .map(f => {
            const value = f.attributes[nameField];
            return value ? String(value).trim() : null;
          })
          .filter(Boolean)
          .sort()
      )];

      console.log('[SIGI Search] Loaded', localidades.length, 'unique localidades:', localidades);
      this.setState({ localidades, localidadFieldName: nameField });

    } catch (error) {
      console.error('[SIGI Search] Error loading localidades:', error);
    }
  };

  // Toggle accordion section
  toggleSection = (section: string): void => {
    this.setState(prevState => ({
      expandedSection: prevState.expandedSection === section ? '' : section
    }));
  };

  // Helper: Detectar nombre de campo automáticamente
  getFieldName = (feature: ProjectFeature, possibleNames: string[]): string | null => {
    if (!feature || !feature.attributes) return null;
    
    for (const name of possibleNames) {
      const found = Object.keys(feature.attributes).find(
        key => key.toUpperCase() === name.toUpperCase()
      );
      if (found) return found;
    }
    return possibleNames[0]; // Default al primero
  };

  // Helper: Obtener valor de campo usando nombres posibles
  getFieldValue = (feature: ProjectFeature, possibleNames: string[]): any => {
    if (!feature || !feature.attributes) return null;
    
    for (const name of possibleNames) {
      const found = Object.keys(feature.attributes).find(
        key => key.toUpperCase() === name.toUpperCase()
      );
      if (found && feature.attributes[found] !== null && feature.attributes[found] !== undefined) {
        return feature.attributes[found];
      }
    }
    return null;
  };

  // Handle PDD checkbox change
  handlePDDChange = (pddValue: string, checked: boolean): void => {
    const { config } = this.props;
    
    this.setState(prevState => {
      const newSelectedPDD = checked
        ? [...prevState.selectedPDD, pddValue]
        : prevState.selectedPDD.filter(p => p !== pddValue);

      // Get PDD description
      const pddOption = config.pddOptions?.find(p => p.value === pddValue);
      
      return {
        selectedPDD: newSelectedPDD,
        showPDDDescription: newSelectedPDD.length > 0,
        currentPDDDescription: newSelectedPDD.length > 0 
          ? config.pddOptions?.find(p => p.value === newSelectedPDD[newSelectedPDD.length - 1]) || null
          : null
      };
    }, this.applyFilters);
  };

  // Handle Estado checkbox change
  handleEstadoChange = (estadoValue: string, checked: boolean): void => {
    this.setState(prevState => ({
      selectedEstados: checked
        ? [...prevState.selectedEstados, estadoValue]
        : prevState.selectedEstados.filter(e => e !== estadoValue)
    }), this.applyFilters);
  };

  // Handle localidad selection
  handleLocalidadChange = async (localidad: string): Promise<void> => {
    this.setState({ selectedLocalidad: localidad, isLoading: true });
    
    if (!localidad) {
      this.clearFilters();
      return;
    }

    const { localidadesLayer, proyectosLayer, jimuMapView, graphicsLayer, localidadFieldName } = this.state;
    if (!localidadesLayer || !proyectosLayer || !jimuMapView) {
      this.setState({ isLoading: false });
      return;
    }

    try {
      // Clear previous graphics
      graphicsLayer?.removeAll();

      // Query localidad geometry usando el campo guardado
      const locQuery = new Query();
      locQuery.where = `${localidadFieldName} = '${localidad}'`;
      locQuery.returnGeometry = true;

      console.log('Querying localidad with:', locQuery.where);

      const locResult = await localidadesLayer.queryFeatures(locQuery);
      console.log('Localidad query result:', locResult.features.length, 'features');
      
      if (locResult.features.length === 0) {
        console.log('No localidad found for:', localidad);
        this.setState({ isLoading: false });
        return;
      }

      const localidadGeometry = locResult.features[0].geometry;

      // Query projects within localidad
      const projQuery = new Query();
      projQuery.geometry = localidadGeometry;
      projQuery.spatialRelationship = 'intersects';
      projQuery.returnGeometry = true;
      projQuery.outFields = ['*'];

      const projResult = await proyectosLayer.queryFeatures(projQuery);
      console.log('Projects in localidad:', projResult.features.length);

      const features = projResult.features.map(f => ({
        attributes: f.attributes,
        geometry: f.geometry
      })) as ProjectFeature[];

      features.sort((a, b) => 
        (a.attributes.COD_PROYEC || '').localeCompare(b.attributes.COD_PROYEC || '')
      );

      // Zoom to localidad
      await jimuMapView.view.goTo(localidadGeometry.extent.expand(1.1));

      this.setState({
        allFeatures: features,
        filteredFeatures: features,
        isLoading: false
      });

    } catch (error) {
      console.error('Error filtering by localidad:', error);
      this.setState({ isLoading: false });
    }
  };

  // Handle project code input
  handleProjectCodeChange = (value: string): void => {
    const projectCodePattern = /^[a-zA-Z]{2}-\d{4}-\d{3}$/;
    const isValid = projectCodePattern.test(value) || value === '';
    
    this.setState({ 
      projectCode: value,
      projectCodeError: !isValid && value !== '',
      contractNumber: '', // Disable contract field when using project code
    }, () => {
      if (isValid || value === '') {
        this.applyFilters();
      }
    });
  };

  // Handle contract number input
  handleContractNumberChange = (value: string): void => {
    const contractPattern = /^\d-\d{2}-\d{5}-\d{4}-\d{4}$/;
    const isValid = contractPattern.test(value) || value === '';
    
    this.setState({ 
      contractNumber: value,
      contractNumberError: !isValid && value !== '',
      projectCode: '', // Disable project code field when using contract
    }, () => {
      if (isValid || value === '') {
        this.applyFilters();
      }
    });
  };

  // Handle search text change
  handleSearchTextChange = (value: string): void => {
    this.setState({ searchText: value }, () => {
      // Clear previous timeout
      if (this.geocoderTimeout) {
        clearTimeout(this.geocoderTimeout);
      }

      if (value.length >= 3) {
        // Debounce the geocoder suggestions
        this.geocoderTimeout = setTimeout(() => {
          this.getGeocoderSuggestions(value);
        }, 300);
      } else {
        this.setState({ 
          geocoderSuggestions: [], 
          showGeocoderSuggestions: false 
        });
      }
    });
  };

  // Get geocoder suggestions using Esri Locator service
  getGeocoderSuggestions = async (text: string): Promise<void> => {
    try {
      const params = {
        text: text,
        location: this.state.jimuMapView?.view.center,
        maxSuggestions: 6
      };

      const response = await locator.suggestLocations(this.locatorUrl, params);
      
      const suggestions = response.map(suggestion => ({
        text: suggestion.text,
        magicKey: suggestion.magicKey,
        isCollection: suggestion.isCollection
      }));

      this.setState({ 
        geocoderSuggestions: suggestions,
        showGeocoderSuggestions: suggestions.length > 0 
      });
    } catch (error) {
      console.error('[SIGI Search] Error getting geocoder suggestions:', error);
      this.setState({ 
        geocoderSuggestions: [], 
        showGeocoderSuggestions: false 
      });
    }
  };

  // Handle geocoder suggestion selection
  handleGeocoderSelect = async (suggestion: any): Promise<void> => {
    try {
      this.setState({ 
        searchText: suggestion.text,
        showGeocoderSuggestions: false,
        isLoading: true 
      });

      // Geocode the address
      const params = {
        magicKey: suggestion.magicKey,
        location: this.state.jimuMapView?.view.center
      };

      const results = await locator.addressToLocations(this.locatorUrl, {
        address: { SingleLine: suggestion.text },
        ...params
      });

      if (results && results.length > 0) {
        const result = results[0];
        const point = new Point({
          x: result.location.x,
          y: result.location.y,
          spatialReference: result.location.spatialReference
        });

        // Clear filters and localidades select
        this.clearFiltersForGeocoder();

        // Create graphics for the point and buffer
        this.createGeocoderGraphics(point);

        // Create 3km buffer and find intersecting features
        const bufferGeometry = geometryEngine.geodesicBuffer(point, 3, 'kilometers');
        await this.findIntersectingFeatures(bufferGeometry as __esri.Polygon);

      } else {
        console.warn('[SIGI Search] No geocoding results found');
        this.setState({ isLoading: false });
      }
    } catch (error) {
      console.error('[SIGI Search] Error geocoding address:', error);
      this.setState({ isLoading: false });
    }
  };

  // Clear filters when using geocoder
  clearFiltersForGeocoder = (): void => {
    this.setState({
      selectedPDD: [],
      selectedEstados: [],
      selectedLocalidad: '',
      projectCode: '',
      contractNumber: '',
      showPDDDescription: false,
      currentPDDDescription: null,
      projectCodeError: false,
      contractNumberError: false
    });
  };

  // Create graphics for geocoder point and buffer
  createGeocoderGraphics = (point: Point): void => {
    const { jimuMapView, geocoderGraphicsLayer } = this.state;
    if (!jimuMapView) return;

    let graphicsLayer = geocoderGraphicsLayer;
    
    if (!graphicsLayer) {
      graphicsLayer = new GraphicsLayer({
        id: 'geocoderGraphicsLayer',
        listMode: 'hide'
      });
      jimuMapView.view.map.add(graphicsLayer);
    } else {
      graphicsLayer.removeAll();
    }

    // Create point symbol (red circle)
    const pointSymbol = new SimpleMarkerSymbol({
      style: 'circle',
      size: 12,
      color: new Color([255, 0, 0, 0.7]),
      outline: {
        color: new Color([255, 0, 0, 0.8]),
        width: 1
      }
    });

    const pointGraphic = new Graphic({
      geometry: point,
      symbol: pointSymbol
    });

    graphicsLayer.add(pointGraphic);

    // Create buffer symbol (red outline with transparent fill)
    const bufferGeometry = geometryEngine.geodesicBuffer(point, 3, 'kilometers');
    const bufferSymbol = new SimpleFillSymbol({
      style: 'none',
      color: new Color([255, 0, 0, 0.2]),
      outline: {
        color: new Color([255, 0, 0, 0.8]),
        width: 1
      }
    });

    const bufferGraphic = new Graphic({
      geometry: bufferGeometry,
      symbol: bufferSymbol
    });

    graphicsLayer.add(bufferGraphic);

    this.setState({ geocoderGraphicsLayer: graphicsLayer });
  };

  // Find intersecting features with buffer geometry
  findIntersectingFeatures = async (bufferGeometry: __esri.Polygon): Promise<void> => {
    const { proyectosLayer, jimuMapView } = this.state;
    
    if (!proyectosLayer || !jimuMapView) {
      this.setState({ isLoading: false });
      return;
    }

    try {
      const query = new Query();
      query.geometry = bufferGeometry;
      query.spatialRelationship = 'intersects';
      query.returnGeometry = true;
      query.outFields = ['*'];

      const result = await proyectosLayer.queryFeatures(query);
      
      console.log('[SIGI Search] Found', result.features.length, 'features within 3km buffer');

      const features = result.features.map(f => ({
        attributes: f.attributes,
        geometry: f.geometry
      })) as ProjectFeature[];

      // Sort by project code
      const codeFieldNames = ['COD_PROYEC', 'CODIGO_PROYECTO', 'COD_PROYECTO', 'CODIGO'];
      features.sort((a, b) => {
        const codeA = this.getFieldValue(a, codeFieldNames) || '';
        const codeB = this.getFieldValue(b, codeFieldNames) || '';
        return codeA.toString().localeCompare(codeB.toString());
      });

      this.setState({ 
        filteredFeatures: features,
        isLoading: false 
      });

      // Update layer definition expression
      if (features.length > 0) {
        const objectIds = features.map(f => f.attributes.OBJECTID).join(',');
        proyectosLayer.definitionExpression = `OBJECTID IN (${objectIds})`;
        
        // Zoom to buffer center
        const center = bufferGeometry.extent.center;
        await jimuMapView.view.goTo({
          target: center,
          zoom: 14
        });
      } else {
        proyectosLayer.definitionExpression = '1=0';
      }

    } catch (error) {
      console.error('[SIGI Search] Error finding intersecting features:', error);
      this.setState({ isLoading: false });
    }
  };

  // Perform search for sectors/localidades/barrios
  performSearch = async (text: string): Promise<void> => {
    const { localidades, allFeatures } = this.state;
    
    const searchLower = text.toLowerCase();
    const results: any[] = [];

    // Search in localidades
    localidades.forEach(loc => {
      if (loc.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'localidad',
          name: loc,
          label: `${loc} (Localidad)`
        });
      }
    });

    // Search in project names (as barrios/sectores)
    const localidadFieldNames = ['LOCALIDAD', 'LOC_NOMBRE', 'NOMBRE_LOCALIDAD', 'NOM_LOC'];
    const uniqueLocalities = new Set<string>();
    
    allFeatures.forEach(f => {
      const localidad = this.getFieldValue(f, localidadFieldNames);
      if (localidad) {
        const localidadStr = localidad.toString();
        if (localidadStr.toLowerCase().includes(searchLower) && !uniqueLocalities.has(localidadStr)) {
          uniqueLocalities.add(localidadStr);
          // Only add if not already in localidades results
          if (!results.find(r => r.name === localidadStr)) {
            results.push({
              type: 'sector',
              name: localidadStr,
              label: `${localidadStr} (Sector)`
            });
          }
        }
      }
    });

    this.setState({ 
      searchResults: results.slice(0, 10), // Limit to 10 results
      showSearchResults: results.length > 0 
    });
  };

  // Handle search result selection
  handleSearchResultSelect = (result: any): void => {
    this.setState({ 
      searchText: result.name,
      showSearchResults: false 
    });

    if (result.type === 'localidad') {
      this.handleLocalidadChange(result.name);
    } else {
      // Filter projects by the selected sector
      this.filterByLocalidad(result.name);
    }
  };

  // Filter projects by localidad name
  filterByLocalidad = async (localidadName: string): Promise<void> => {
    const { allFeatures, jimuMapView } = this.state;
    
    const localidadFieldNames = ['LOCALIDAD', 'LOC_NOMBRE', 'NOMBRE_LOCALIDAD', 'NOM_LOC'];
    
    const filtered = allFeatures.filter(f => {
      const localidadValue = this.getFieldValue(f, localidadFieldNames);
      return localidadValue && localidadValue.toString().toLowerCase() === localidadName.toLowerCase();
    });

    console.log('[SIGI Search] Filtered by localidad name:', localidadName, '- Found:', filtered.length, 'features');

    this.setState({ filteredFeatures: filtered });

    // Zoom to first result if available
    if (filtered.length > 0 && filtered[0].geometry && jimuMapView) {
      await jimuMapView.view.goTo({
        target: filtered[0].geometry,
        zoom: 14
      });
    }
  };

  // Apply all active filters
  applyFilters = (): void => {
    const { allFeatures, selectedPDD, selectedEstados, projectCode, contractNumber } = this.state;

    console.log('[SIGI Search] Applying filters:', { selectedPDD, selectedEstados, projectCode, contractNumber });

    let filtered = [...allFeatures];

    // Detectar nombres de campos si hay features
    const sampleFeature = allFeatures.length > 0 ? allFeatures[0] : null;
    const pddFieldNames = ['PDD', 'PLAN_DESARROLLO', 'PLAN_DES'];
    const estadoFieldNames = ['ESTADO', 'EST_PROYEC', 'ESTADO_PROYECTO'];
    const codeFieldNames = ['COD_PROYEC', 'CODIGO_PROYECTO', 'COD_PROYECTO', 'CODIGO'];

    // Filter by PDD
    if (selectedPDD.length > 0 && sampleFeature) {
      filtered = filtered.filter(f => {
        const pddValue = this.getFieldValue(f, pddFieldNames);
        return pddValue && selectedPDD.includes(pddValue.toString());
      });
      console.log('[SIGI Search] After PDD filter:', filtered.length, 'features');
    }

    // Filter by Estado
    if (selectedEstados.length > 0 && sampleFeature) {
      filtered = filtered.filter(f => {
        const estadoValue = this.getFieldValue(f, estadoFieldNames);
        return estadoValue && selectedEstados.includes(estadoValue.toString());
      });
      console.log('[SIGI Search] After Estado filter:', filtered.length, 'features');
    }

    // Filter by project code
    if (projectCode && sampleFeature) {
      filtered = filtered.filter(f => {
        const codeValue = this.getFieldValue(f, codeFieldNames);
        return codeValue && codeValue.toString().toUpperCase().includes(projectCode.toUpperCase());
      });
      console.log('[SIGI Search] After project code filter:', filtered.length, 'features');
    }

    // Filter by contract number (would need related table query in real implementation)
    if (contractNumber) {
      // For now, just show all features when filtering by contract
      // Real implementation would query related table
      console.log('[SIGI Search] Contract filter not yet implemented');
    }

    // Only show results if at least one filter is active
    const hasActiveFilters = selectedPDD.length > 0 || selectedEstados.length > 0 || 
                            projectCode !== '' || contractNumber !== '';

    this.setState({ 
      filteredFeatures: hasActiveFilters ? filtered : []
    });

    // Update layer definition expression
    this.updateLayerFilter(filtered, hasActiveFilters);
  };

  // Update layer definition expression
  updateLayerFilter = (features: ProjectFeature[], hasFilters: boolean): void => {
    const { jimuMapView, proyectosLayer } = this.state;
    if (!jimuMapView || !proyectosLayer) return;

    // Solo modificar el filtro si hay filtros activos
    if (hasFilters) {
      if (features.length > 0) {
        const objectIds = features.map(f => f.attributes.OBJECTID).join(',');
        proyectosLayer.definitionExpression = `OBJECTID IN (${objectIds})`;
        console.log('Applied filter:', `OBJECTID IN (${objectIds.substring(0, 50)}...)`);
      } else {
        proyectosLayer.definitionExpression = '1=0'; // Show nothing if filter returns no results
        console.log('Applied filter: 1=0 (no results)');
      }
    } else {
      // Sin filtros activos - mostrar todo
      proyectosLayer.definitionExpression = '';
      console.log('Cleared filter - showing all features');
    }
  };

  // Clear all filters
  clearFilters = (): void => {
    const { graphicsLayer, geocoderGraphicsLayer, proyectosLayer } = this.state;
    
    // Clear graphics
    graphicsLayer?.removeAll();
    geocoderGraphicsLayer?.removeAll();

    // Clear definition expression to show all features
    if (proyectosLayer) {
      proyectosLayer.definitionExpression = '';
      console.log('Cleared all filters');
    }

    this.setState({
      selectedPDD: [],
      selectedEstados: [],
      selectedLocalidad: '',
      projectCode: '',
      contractNumber: '',
      searchText: '',
      searchResults: [],
      showSearchResults: false,
      geocoderSuggestions: [],
      showGeocoderSuggestions: false,
      filteredFeatures: [],
      showPDDDescription: false,
      currentPDDDescription: null,
      projectCodeError: false,
      contractNumberError: false
    });
  };

  // Handle project row click - zoom and trigger ficha widget
  handleProjectClick = (feature: ProjectFeature): void => {
    const { jimuMapView } = this.state;
    if (!jimuMapView || !feature.geometry) {
      console.warn('[SIGI Search] Cannot handle click - missing jimuMapView or geometry');
      return;
    }

    let point = feature.geometry as Point;
    
    // Convert to Web Mercator if needed
    if (feature.geometry.spatialReference?.wkid === 4686) {
      point = webMercatorUtils.geographicToWebMercator(feature.geometry) as Point;
    }

    console.log('[SIGI Search] Zooming to project:', feature.attributes.COD_PROYEC);

    // Zoom to point first
    jimuMapView.view.goTo({
      target: point,
      zoom: 17
    }).then(() => {
      // Enviar evento personalizado para que sigi-ficha-proyecto lo reciba
      console.log('[SIGI Search] Publishing show-project message for:', feature.attributes.COD_PROYEC);
      console.log('[SIGI Search] Project data:', feature.attributes);
      
      // Usar evento personalizado de window
      const event = new CustomEvent('sigi-show-project', {
        detail: {
          projectData: feature.attributes,
          geometry: point
        },
        bubbles: true
      });
      window.dispatchEvent(event);
      console.log('[SIGI Search] Messages sent successfully');
    }).catch((error) => {
      console.error('[SIGI Search] Error during goTo:', error);
      
      // Intentar enviar el mensaje de todos modos
      const event = new CustomEvent('sigi-show-project', {
        detail: {
          projectData: feature.attributes,
          geometry: point
        },
        bubbles: true
      });
      window.dispatchEvent(event);
    });
  };

  // Export to Excel (simplified version)
  handleExportExcel = (): void => {
    const { filteredFeatures } = this.state;
    if (filteredFeatures.length === 0) return;

    // Detectar nombres de campos
    const codeFieldNames = ['COD_PROYEC', 'CODIGO_PROYECTO', 'COD_PROYECTO', 'CODIGO'];
    const nameFieldNames = ['NOM_PROYEC', 'NOMBRE_PROYECTO', 'NOM_PROYECTO', 'NOMBRE'];
    const estadoFieldNames = ['ESTADO', 'EST_PROYEC', 'ESTADO_PROYECTO'];
    const pddFieldNames = ['PDD', 'PLAN_DESARROLLO', 'PLAN_DES'];
    const localidadFieldNames = ['LOCALIDAD', 'LOC_NOMBRE', 'NOMBRE_LOCALIDAD', 'NOM_LOC'];

    // Create CSV content
    const headers = ['CÓDIGO', 'NOMBRE', 'ESTADO', 'PDD', 'LOCALIDAD'];
    const rows = filteredFeatures.map(f => [
      this.getFieldValue(f, codeFieldNames) || '',
      this.getFieldValue(f, nameFieldNames) || '',
      this.getFieldValue(f, estadoFieldNames) || '',
      this.getFieldValue(f, pddFieldNames) || '',
      this.getFieldValue(f, localidadFieldNames) || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    console.log('[SIGI Search] Exporting', filteredFeatures.length, 'features to CSV');

    // Download CSV
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Proyectos_SIGI_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  render(): React.ReactElement {
    const { config, useMapWidgetIds } = this.props;
    const {
      isLoading,
      expandedSection,
      selectedPDD,
      selectedEstados,
      selectedLocalidad,
      projectCode,
      contractNumber,
      filteredFeatures,
      localidades,
      showPDDDescription,
      currentPDDDescription,
      projectCodeError,
      contractNumberError,
      searchText,
      geocoderSuggestions,
      showGeocoderSuggestions
    } = this.state;

    return (
      <div css={widgetStyles}>
        <div className="sigi-search-panel">
          {/* Map View Component */}
          {useMapWidgetIds && useMapWidgetIds.length > 0 && (
            <JimuMapViewComponent
              useMapWidgetId={useMapWidgetIds[0]}
              onActiveViewChange={this.onActiveViewChange}
            />
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="spinner-overlay">
              <Loading type="SECONDARY" />
            </div>
          )}

          {/* Search Sections */}
          <div className="search-section">
            {/* Búsqueda General */}
            <div className="accordion-header active" style={{ cursor: 'default' }}>
              BÚSQUEDA GENERAL
            </div>
            <div className="accordion-content">
              <span className="description-text">
                Digite el nombre del sector, localidad o barrio que desea consultar
              </span>
              <div className="search-with-icon" ref={this.searchContainerRef}>
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => this.handleSearchTextChange(e.target.value)}
                  onFocus={() => {
                    if (geocoderSuggestions.length > 0) {
                      this.setState({ showGeocoderSuggestions: true });
                    }
                  }}
                  placeholder=""
                />
                <span className="dropdown-arrow">▼</span>
                {showGeocoderSuggestions && geocoderSuggestions.length > 0 && (
                  <div className="search-results-dropdown">
                    {geocoderSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => this.handleGeocoderSelect(suggestion)}
                      >
                        {suggestion.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="description-text" style={{ marginTop: '16px' }}>
                Seleccione la Localidad
              </span>
              <select
                className="localidad-native-select"
                value={selectedLocalidad}
                onChange={(e) => this.handleLocalidadChange(e.target.value)}
              >
                <option value="">-- Seleccione --</option>
                {localidades.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Búsqueda Específica */}
            <button 
              className={`accordion-header ${expandedSection === 'specific' ? 'active' : ''}`}
              onClick={() => this.toggleSection('specific')}
            >
              BÚSQUEDA ESPECÍFICA
            </button>
            <Collapse isOpen={expandedSection === 'specific'}>
              <div className="accordion-content">
                <span className="description-text">
                  Seleccione o digite los parámetros de búsqueda
                </span>
                
                <div className="filter-row">
                  {/* PDD Filter */}
                  <div className="filter-col">
                    <label className="search-box-title">PDD</label>
                    <div className="filter-box">
                      <div className="checkbox-group">
                        {config.pddOptions?.map(pdd => (
                          <label key={pdd.value} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedPDD.includes(pdd.value)}
                              onChange={(e) => this.handlePDDChange(pdd.value, e.target.checked)}
                            />
                            {pdd.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    {showPDDDescription && currentPDDDescription && (
                      <div className="pdd-description-box">
                        <div className="pdd-description-text">{currentPDDDescription.description}</div>
                        <div className="pdd-date-text">{currentPDDDescription.dateRange}</div>
                      </div>
                    )}
                  </div>

                  {/* Estado Filter */}
                  <div className="filter-col">
                    <label className="search-box-title">ESTADO</label>
                    <div className="filter-box">
                      <div className="checkbox-group">
                        {config.estadoOptions?.map(estado => (
                          <label key={estado.value} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedEstados.includes(estado.value)}
                              onChange={(e) => this.handleEstadoChange(estado.value, e.target.checked)}
                            />
                            {estado.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>

            {/* Búsqueda por Proyecto */}
            <button 
              className={`accordion-header ${expandedSection === 'project' ? 'active' : ''}`}
              onClick={() => this.toggleSection('project')}
            >
              BÚSQUEDA POR PROYECTO
            </button>
            <Collapse isOpen={expandedSection === 'project'}>
              <div className="accordion-content">
                <label className="search-box-title">CÓDIGO DE PROYECTO</label>
                <input
                  className="search-input"
                  type="text"
                  placeholder="AA-0000-000"
                  value={projectCode}
                  onChange={(e) => this.handleProjectCodeChange(e.target.value)}
                  disabled={contractNumber !== ''}
                />
                {projectCodeError && (
                  <span className="error-text">
                    El código no se encuentra. Verifique los dígitos
                  </span>
                )}

                <label className="search-box-title" style={{ marginTop: '12px' }}>NÚMERO DE CONTRATO</label>
                <input
                  className="search-input"
                  type="text"
                  placeholder="0-00-00000-0000-0000"
                  value={contractNumber}
                  onChange={(e) => this.handleContractNumberChange(e.target.value)}
                  disabled={projectCode !== ''}
                />
                {contractNumberError && (
                  <span className="error-text">
                    El número de contrato no se encuentra. Verifique los dígitos
                  </span>
                )}
              </div>
            </Collapse>
          </div>

          {/* Clear Filters Button */}
          <div className="clear-button-container">
            <button className="clear-button" onClick={this.clearFilters}>
              Limpiar BÚSQUEDA
            </button>
          </div>

          {/* Results Section */}
          {filteredFeatures.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <span>Proyectos seleccionados: <span className="results-count">{filteredFeatures.length}</span></span>
                <button 
                  className="download-button" 
                  title="Descargar Excel"
                  onClick={this.handleExportExcel}
                />
              </div>
              <div className="projects-table-container">
                <table className="projects-table">
                  <tbody>
                    {filteredFeatures.map(feature => {
                      const codeFieldNames = ['COD_PROYEC', 'CODIGO_PROYECTO', 'COD_PROYECTO', 'CODIGO'];
                      const nameFieldNames = ['NOM_PROYEC', 'NOMBRE_PROYECTO', 'NOM_PROYECTO', 'NOMBRE'];
                      
                      const projectCode = this.getFieldValue(feature, codeFieldNames) || 'Sin código';
                      const projectName = this.getFieldValue(feature, nameFieldNames) || 'Sin nombre';
                      
                      return (
                        <tr 
                          key={feature.attributes.OBJECTID}
                          onClick={() => this.handleProjectClick(feature)}
                        >
                          <td>{projectCode}</td>
                          <td>{projectName}</td>
                          <td>
                            <button 
                              className="view-button"
                              title="Ver ficha del proyecto"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleProjectClick(feature);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
