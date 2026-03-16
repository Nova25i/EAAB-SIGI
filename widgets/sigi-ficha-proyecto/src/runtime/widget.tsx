/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis';
import { type IMConfig } from '../config';

// ArcGIS imports
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';
import RelationshipQuery from '@arcgis/core/rest/support/RelationshipQuery';

interface ProjectData {
  OBJECTID: number;
  COD_PROYEC: string;
  NOM_PROYEC: string;
  ALC_PROYEC: string;
  VALOR_TOTAL: number;
  FECHA_INICIO: number;
  FECHA_FIN: number;
  FECHA_LIQ_PRY: number;
  FECHA_POS_FIN_PRY: number;
  ESTADO: string;
  PDD: string;
  MACROPROY: string;
  LOCALIDAD: string;
  FASE: string;
  OTROS_COSTOS: string | null;
  POB_BENEFIC: number;
  CREATIONDATE: number;
  [key: string]: any;
}

interface ContractData {
  NUMERO_CONTRATO: string;
  ACTIVIDAD: string;
  OBJETO_CONTRATO: string;
  OBJETO_CONT: string;
  VALOR_CONTRATO: number;
  FECHA_INI_CONT: number;
  FECHA_FIN_CONT: number;
  FECHA_LIQ_CONT: number;
  FECHA_POS_FIN_CONT: number;
  FECHA_INICIO: number;
  FECHA_FIN: number;
  FECHA_LIQ: number;
  FECHA_POS_FIN: number;
  ESTADO_CONTRATO: string;
  FASE_PEP: string;
  AVANCE_FISICO: number;
  AVANCE_FINANCIERO: number;
  [key: string]: any;
}

interface PopulationData {
  MUJERES: number;
  HOMBRES: number;
  INFANICA: number;
  ADOLESCENTES: number;
  JOVENES: number;
  ADULTOS: number;
  ADULTO_MAYOR: number;
  INDIGENA: number;
  GITANO: number;
  RAIZAL: number;
  PALENQUERO: number;
  NINGUN_GRUPO_ETNICO: number;
  NO_INFORMA: number;
  [key: string]: any;
}

interface WidgetState {
  jimuMapView: JimuMapView | null;
  proyectosLayer: FeatureLayer | null;
  isOpen: boolean;
  isLoading: boolean;
  activeTab: string;
  selectedFase: string;
  projectData: ProjectData | null;
  contractsData: ContractData[];
  populationData: PopulationData[];
  projectImageUrl: string;
}

// Helper functions
const formatMoney = (value: number | undefined | null): string => {
  if (!value && value !== 0) return '-';
  return '$' + new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatLongDate = (timestamp: number | undefined | null): string => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

const formatThousands = (value: number | undefined | null): string => {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('es-CO').format(value);
};

const formatDecimal = (value: number | undefined | null, min = 1, max = 1): string => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  return value.toFixed(max);
};

// Styles basados exactamente en el estilo del PopUpAcueducto original
const widgetStyles = css`
  .pop-up-acueducto {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    overflow-x: hidden;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 2147483647 !important;
    overflow-y: auto;
    padding: 10px;
    isolation: isolate;
    transform: translate3d(0, 0, 0);
    pointer-events: auto;
  }

  .modal-dialog {
    width: 900px;
    height: 720px;
    margin-top: 10px;
    margin-bottom: 10px;
    position: relative !important;
    z-index: 2147483647 !important;
    isolation: isolate;
    transform: translate3d(0, 0, 0);
    overflow: hidden;
  }

  .modal-content {
    background-color: #fff;
    border: 1px solid #0082DC;
    border-radius: 0px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 15px rgba(0,0,0,.5);
    overflow: hidden;
  }

  .modal-header {
    background-color: #0082DC;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: none;
  }

  .modal-title {
    color: #ffffff;
    font-size: 32px;
    font-weight: 900;
    margin: 0;
    line-height: 1.2;
    letter-spacing: 0.5px;
  }

  .close {
    font-size: 32px;
    color: #fff;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    font-weight: 300;
  }

  .close:hover, .close:focus {
    opacity: 1;
  }

  .modal-title-secondary {
    text-align: center;
    color: #0082DC;
    font-size: 14px;
    font-weight: bold;
    padding: 12px 20px;
    margin: 0;
    background-color: #fff;
    border-bottom: 1px solid #e5e5e5;
  }

  .modal-body {
    padding: 0px;
    padding-top: 0px;
    padding-bottom: 0px;
    height: calc(100% - 95px);
    overflow: hidden;
    width: 100%;
  }

  /* Tabs */
  .tabs-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  }

  .tab-headers {
    display: flex;
    border-bottom: none;
    background-color: #f5f5f5;
  }

  .tab-header {
    flex: 1;
    padding: 12px 20px;
    background-color: #ffffff;
    border: none;
    border-right: 1px solid #c0c0c0;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
    color: #0082DC;
    font-size: 12px;
    text-transform: uppercase;
    transition: none;
    position: relative;
  }

  .tab-header:last-child {
    border-right: none;
  }

  .tab-header.active {
    background-color: #DCDCDCDC;
    color: #0082DC;
    border-bottom: 2px solid #0082DC;
  }

  .tab-header.active:hover {
    background-color: #e9e9e9;
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
  }

  .detail-tab-container {
    padding: 15px;
    background-color: #F2F2F2;
    min-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* Text styles */
  .text-primary {
    text-transform: uppercase;
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.4;
    padding: 0px;
    color: #0082DC;
    font-size: 12px;
  }

  .text-primary-minus {
    font-weight: bold;
    line-height: 1.4;
    padding: 0px;
    color: #0082DC;
    font-size: 12px;
  }

  .text-value {
    line-height: 1.4;
    padding: 2px;
    color: #0082DC;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .text-info {
    color: #0082DC;
  }

  .text-note {
    color: #818181;
    font-size: 10px;
    line-height: 1.3;
    font-family: Arial, Helvetica, sans-serif;
  }

  .text-danger {
    color: #dc3545;
  }

  .centered {
    text-align: center;
  }

  .cell {
    text-transform: uppercase;
    line-height: 1.4;
  }

  /* Descripción Tab */
  .descripcion {
    display: flex;
    height: 100%;
    gap: 15px;
    overflow-x: hidden;
  }

  .descripcion .col-left {
    flex: 0 0 40%;
    padding-right: 10px;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .descripcion .col-right {
    flex: 1;
    padding-left: 10px;
    overflow-x: hidden;
    max-width: 60%;
  }

  .descripcion .objetivo-container {
    overflow-y: visible;
    overflow-x: hidden;
    margin-bottom: 15px;
    padding: 2px;
    word-wrap: break-word;
  }

  .descripcion .objetivo-container b {
    display: block;
    margin-bottom: 10px;
    color: #000000;
    font-weight: bold;
    font-size: 13px;
  }

  .descripcion .objetivo-container div {
    text-align: justify;
    color: #000000;
    font-size: 12px;
    line-height: 1.5;
  }

  .descripcion .info-table {
    padding-left: 0px;
    margin-bottom: 6px;
  }

  .descripcion .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    padding: 0;
    font-size: 12px;
  }

  .card-results {
    background-color: white;
    padding: 12px;
    margin: 0px;
    margin-top: 0px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    max-width: 100%;
    overflow: hidden;
  }

  .inversion-descripcion-icon {
    padding: 0px;
    display: flex;
    flex-wrap: wrap;
    vertical-align: middle;
    align-content: center;
    justify-content: center;
    overflow: hidden;
  }

  .inversion-descripcion-icon img {
    margin: auto;
    padding: 0px;
    vertical-align: middle;
  }

  .project-image-container {
    margin-top: 12px;
    text-align: center;
    height: 245px;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 100%;
  }

  .project-image-container img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  /* Project Progress / Detalle Tab */
  .project-progress {
    text-align: left;
    font-weight: normal;
    color: #818181;
    height: 100%;
  }

  .project-progress .container-progress {
    background-color: #d3d3d3;
    border: 1px solid #999999;
    padding: 0px;
    width: 100%;
    height: 18px;
    border-radius: 2px;
  }

  .project-progress .percent {
    padding: 0px;
    text-align: right;
    height: 100%;
    border-radius: 2px;
  }

  .detalle-layout {
    display: flex;
    height: 100%;
    gap: 15px;
    overflow-x: hidden;
    width: 100%;
  }

  .detalle-sidebar {
    flex: 0 0 22%;
    height: 433px;
    overflow: hidden;
  }

  .detalle-content {
    flex: 1;
    padding-left: 0px;
    overflow: hidden;
    max-width: 78%;
  }

  .detalle-content-scroll {
    height: 410px;
    width: calc(100% - 5px);
    overflow-y: auto;
    padding-right: 5px;
    margin-bottom: 8px;
  }

  .inversion-detalle-icon {
    padding-top: 8px;
    padding-bottom: 8px;
    position: relative;
  }

  .fase-button-container {
    display: flex;
    margin-bottom: 8px;
    align-items: center;
  }

  .fase-icon-column {
    flex: 0 0 75%;
    cursor: pointer;
  }

  .fase-indicador-column {
    flex: 0 0 25%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .inversion-detalle-img {
    position: relative;
    left: 50%;
    transform: translate(-50%, 0%);
    display: block;
  }

  .inversion-detalle-indicador-img {
    position: relative;
    left: 50%;
    top: 0px;
    transform: translate(-50%, 0%);
    display: block;
  }

  .card-pep {
    background-color: #FFF;
    padding: 15px;
    padding-left: 12px;
    padding-right: 12px;
    margin-bottom: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    overflow: hidden;
    word-wrap: break-word;
  }

  .card-pep:first-child {
    margin-top: 0px;
  }

  .card-pep table {
    width: 100%;
    border-spacing: 0;
    table-layout: fixed;
  }

  .card-pep table tr {
    margin-bottom: 8px;
  }

  .card-pep table td {
    padding: 3px 0;
  }

  .card-pep .contract-layout {
    display: flex;
    gap: 25px;
    margin-top: 12px;
    overflow: hidden;
  }

  .contract-info {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .contract-progress-section {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }

  .progress-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
  }

  .progress-label-col {
    flex: 0 0 20%;
    text-align: right;
    padding-right: 5px;
  }

  .progress-bar-col {
    flex: 1;
    padding-left: 0px;
  }

  .no-padding {
    padding: 0px;
  }

  .text-right-aligned {
    text-align: right;
  }

  /* Población Tab */
  .population-container {
    display: inline-block;
    text-align: right;
    padding: 15px;
    padding-top: 10px;
    width: 75%;
    background-color: white;
    font-size: 12px;
  }

  .population-table {
    padding: 1em;
  }

  .poblacion-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 485px;
    overflow-x: hidden;
    width: 100%;
  }

  .poblacion-card-outer {
    display: flex;
    justify-content: center;
    width: 100%;
    overflow-x: hidden;
  }

  .poblacion-card-inner {
    flex: 0 0 66%;
    overflow-x: hidden;
    max-width: 66%;
  }

  .poblacion-main-card {
    background-color: #FFF;
    padding: 30px 15px 15px;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  }

  .poblacion-note-container {
    text-align: justify;
    padding: 8px;
    font-size: 11px;
    color: #818181;
    line-height: 1.4;
    word-wrap: break-word;
    overflow: hidden;
  }

  h3 {
    line-height: 1.4;
    font-weight: 100;
    font-size: 15px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .font-large {
    font-size: 14px;
  }

  .small.text-muted {
    font-size: 11px;
    color: #999;
  }

  /* Loading */
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 14px;
    color: #666;
  }
`;

// Importar imágenes locales usando require
const imgFase1On = require('../../images/Fase1On.png');
const imgFase1Off = require('../../images/Fase1Off.png');
const imgFase2On = require('../../images/Fase2On.png');
const imgFase2Off = require('../../images/Fase2Off.png');
const imgFase3On = require('../../images/Fase3On.png');
const imgFase3Off = require('../../images/Fase3Off.png');
const imgIndicadorOn = require('../../images/IndicadorOn.png');
const imgIndicadorOff = require('../../images/IndicadorOff.png');
const imgOtrosCostosOn = require('../../images/OtrosCostosOn.png');
const imgOtrosCostosOff = require('../../images/OtrosCostosOff.png');
const imgOtrosCostos1On = require('../../images/OtrosCostos1On.png');
const imgOtrosCostos1Off = require('../../images/OtrosCostos1Off.png');

export default class SigiFichaProyecto extends React.PureComponent<AllWidgetProps<IMConfig>, WidgetState> {
  private clickHandler: __esri.Handle | null = null;
  private eventHandler: ((event: CustomEvent) => void) | null = null;

  constructor(props: AllWidgetProps<IMConfig>) {
    super(props);
    console.log('🔷 SIGI FICHA - CONSTRUCTOR CALLED - Widget ID:', props.id);
    this.state = {
      jimuMapView: null,
      proyectosLayer: null,
      isOpen: false,
      isLoading: false,
      activeTab: 'descripcion',
      selectedFase: '',
      projectData: null,
      contractsData: [],
      populationData: [],
      projectImageUrl: ''
    };
    console.log('🔷 SIGI FICHA - STATE INITIALIZED');
  }

  // Helper method to get image references
  getImageUrl = (imageName: string): string => {
    const imageMap: { [key: string]: string } = {
      'Fase1On.png': imgFase1On,
      'Fase1Off.png': imgFase1Off,
      'Fase2On.png': imgFase2On,
      'Fase2Off.png': imgFase2Off,
      'Fase3On.png': imgFase3On,
      'Fase3Off.png': imgFase3Off,
      'IndicadorOn.png': imgIndicadorOn,
      'IndicadorOff.png': imgIndicadorOff,
      'OtrosCostosOn.png': imgOtrosCostosOn,
      'OtrosCostosOff.png': imgOtrosCostosOff,
      'OtrosCostos1On.png': imgOtrosCostos1On,
      'OtrosCostos1Off.png': imgOtrosCostos1Off
    };
    return imageMap[imageName] || '';
  };

  componentDidMount(): void {
    console.log('🔷🔷🔷 SIGI FICHA PROYECTO - COMPONENT DID MOUNT 🔷🔷🔷');
    console.log('🔷 Widget ID:', this.props.id);
    console.log('🔷 Setting up event listeners...');

    // Listen for custom events from other widgets (sigi-search-panel)
    this.eventHandler = this.handleShowProjectEvent.bind(this);
    window.addEventListener('sigi-show-project', this.eventHandler as EventListener);
    console.log('🔷 Event listener registered for sigi-show-project');
    console.log('🔷🔷🔷 SIGI FICHA - INITIALIZATION COMPLETE 🔷🔷🔷');
  }

  componentWillUnmount(): void {
    if (this.clickHandler) {
      this.clickHandler.remove();
    }
    // Remove event listener
    if (this.eventHandler) {
      window.removeEventListener('sigi-show-project', this.eventHandler as EventListener);
    }
  }

  // Handle project show event from external widget (sigi-search-panel)
  handleShowProjectEvent = (event: CustomEvent): void => {
    console.log('🔷🔷🔷 CUSTOM EVENT RECEIVED (sigi-show-project) 🔷🔷🔷');
    console.log('🔷 Event detail:', event.detail);
    if (event.detail && event.detail.projectData) {
      this.handleExternalProjectRequest(event.detail.projectData);
    }
  };

  // Handle project request from external widget (sigi-search-panel)
  handleExternalProjectRequest = async (projectData: any): Promise<void> => {
    let { proyectosLayer, jimuMapView } = this.state;

    console.log('🔷🔷🔷 OPENING POPUP FOR PROJECT:', projectData.COD_PROYEC, '🔷🔷🔷');
    console.log('🔷 Current state - Layer:', proyectosLayer ? 'YES' : 'NO', 'MapView:', jimuMapView ? 'YES' : 'NO');

    // Si no tenemos la capa cargada aún, intentar cargarla ahora
    if (!proyectosLayer && jimuMapView) {
      const layer = jimuMapView.view.map.layers.find(
        (l: any) => l.title?.toLowerCase().includes('proyecto') ||
          l.title?.toLowerCase().includes('sigi')
      ) as FeatureLayer;

      if (layer) {
        proyectosLayer = layer;
        this.setState({ proyectosLayer: layer });
      }
    }

    // Always open the popup, even without full data
    console.log('🔷 SETTING STATE - isOpen: true');

    // If we have a layer, load the full project data
    if (proyectosLayer) {
      console.log('🔷 Loading full project data from layer...');
      await this.loadProjects(proyectosLayer, projectData);
    } else {
      // If no layer, just display what we have
      console.log('🔷 No layer found - displaying basic data');
      this.setState({
        isOpen: true,
        isLoading: false,
        projectData: projectData,
        activeTab: 'descripcion',
        selectedFase: projectData.FASE || 'FASE 1'
      });
      console.log('🔷🔷🔷 POPUP STATE SET - isOpen: true 🔷🔷🔷');
    }
  };

  // Map view handler
  onActiveViewChange = (jimuMapView: JimuMapView): void => {
    if (jimuMapView) {
      this.setState({ jimuMapView }, () => {
        this.setupClickHandler();
      });
    }
  };

  // Setup click handler on feature layer
  setupClickHandler = async (): Promise<void> => {
    const { jimuMapView } = this.state;
    const { config } = this.props;

    if (!jimuMapView) return;

    // Remove previous handler
    if (this.clickHandler) {
      this.clickHandler.remove();
    }

    // Get the layer from the map
    let layer: FeatureLayer = null;

    if (config?.CapaDeProyectos) {
      layer = jimuMapView.view.map.layers.find(
        (l: any) => l.id === config.CapaDeProyectos
      ) as FeatureLayer;
    }

    // Si no se encuentra por configuración, buscar por nombre o tipo
    if (!layer) {
      console.log('[SIGI Ficha] Buscando capa de proyectos en el mapa...');
      layer = jimuMapView.view.map.layers.find(
        (l: any) => l.title?.toLowerCase().includes('proyecto') ||
          l.title?.toLowerCase().includes('sigi')
      ) as FeatureLayer;
    }

    if (layer) {
      console.log('[SIGI Ficha] Capa de proyectos encontrada:', layer.title);
      this.setState({ proyectosLayer: layer });
    } else {
      console.warn('[SIGI Ficha] Capa de proyectos no encontrada');
    }

    // Listen for clicks on the map (only if layer was found)
    if (layer && config?.CapaDeProyectos) {
      this.clickHandler = jimuMapView.view.on('click', async (event: __esri.ViewClickEvent) => {
        const hitResult = await jimuMapView.view.hitTest(event);

        if (hitResult.results.length > 0) {
          for (const result of hitResult.results) {
            if ((result as any).graphic?.layer?.id === config.CapaDeProyectos) {
              const attributes = (result as any).graphic.attributes;
              await this.loadProjects(layer, attributes);
              break;
            }
          }
        }
      });
    }
  };

  // Load project data with related records
  loadProjects = async (layer: FeatureLayer, attributes: any): Promise<void> => {
    const { config } = this.props;

    console.log('loadProjects - attributes:', attributes);

    this.setState({
      isOpen: true,
      isLoading: true,
      projectData: attributes,
      activeTab: 'descripcion',
      selectedFase: attributes.FASE || 'FASE 1'
    });

    try {
      // Generate image URL
      const imageCode = attributes[config.CampoImagenElementoPep] || attributes.COD_PROYEC;
      const projectImageUrl = config.TemplateImagen.replace('{0}', imageCode);

      // Query PEP and Contratos data directly from tables using COD_PROYEC
      let pepFeatures: any[] = [];
      let contratosFeatures: any[] = [];

      // Build table URLs from map layer or config
      let pepTableUrl = '';
      let contratosTableUrl = '';
      
      if (this.state.jimuMapView) {
        const allLayers = this.state.jimuMapView.view.map.allLayers;
        for (let i = 0; i < allLayers.length; i++) {
          const layerItem = allLayers.getItemAt(i);
          if ((layerItem as any).url) {
            const layerUrl = (layerItem as any).url;
            if (layerUrl.includes('proyecto') || layerUrl.includes('SIGI')) {
              const lastSlashIndex = layerUrl.lastIndexOf('/');
              let baseUrl = layerUrl.substring(0, lastSlashIndex);
              if (!baseUrl.includes('MapServer') && !baseUrl.includes('FeatureServer')) {
                baseUrl = `${baseUrl}/MapServer`;
              }
              // Based on testing: contratos=4, we'll try multiple indices for pep
              pepTableUrl = `${baseUrl}/5`;
              contratosTableUrl = `${baseUrl}/4`; // Confirmed index 4 works
              console.log('🔷 Constructed table URLs from layer URL');
              console.log('🔷 Base URL:', baseUrl);
              break;
            }
          }
        }
      }
      
      // Fallback to config if URLs couldn't be constructed
      if (!pepTableUrl && config.TablaElementosPEP) {
        pepTableUrl = config.TablaElementosPEP;
        console.log('🔷 Using PEP table URL from config:', pepTableUrl);
      }

      // Query PEP table - try multiple indices if needed
      if (pepTableUrl) {
        const indicesToTry = [5, 1, 7, 8]; // Try different common indices for PEP table
        
        for (const index of indicesToTry) {
          const currentPepUrl = pepTableUrl.replace(/\/\d+$/, `/${index}`);
          try {
            console.log(`🔷 Querying PEP table (index ${index}):`, currentPepUrl);
            console.log('🔷 For project COD_PROYEC:', attributes.COD_PROYEC);

            // Try with exact match first
            let pepQuery = new Query({
              where: `COD_PROYEC='${attributes.COD_PROYEC}'`,
              outFields: ['*'],
              returnGeometry: false
            });

            let pepResult = await query.executeQueryJSON(currentPepUrl, pepQuery);
            console.log(`🔷 PEP query result (index ${index}):`, pepResult);

            if (pepResult.features && pepResult.features.length > 0) {
              pepFeatures = pepResult.features;
              console.log(`✅ Found PEP features at index ${index}:`, pepFeatures.length);
              console.log('🔷 First PEP feature sample:', pepFeatures[0]?.attributes);
              break; // Success! Stop trying other indices
            } else {
              // Try with trimmed value in case there are spaces
              console.log(`🔷 No exact match, trying with TRIM at index ${index}...`);
              pepQuery = new Query({
                where: `TRIM(COD_PROYEC)='${attributes.COD_PROYEC.trim()}'`,
                outFields: ['*'],
                returnGeometry: false
              });
              
              try {
                pepResult = await query.executeQueryJSON(currentPepUrl, pepQuery);
                if (pepResult.features && pepResult.features.length > 0) {
                  pepFeatures = pepResult.features;
                  console.log(`✅ Found PEP features with TRIM at index ${index}:`, pepFeatures.length);
                  break;
                }
              } catch (trimError) {
                console.log(`🔷 TRIM query failed at index ${index}, trying next...`);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Error querying PEP table at index ${index}:`, error);
            // Continue to next index
          }
        }
        
        if (pepFeatures.length === 0) {
          console.error('❌ No PEP features found in any tried index');
          console.log('💡 TIP: Check if the PEP table exists and has data for this project');
        }
      } else {
        console.warn('⚠️ No PEP table URL available');
      }

      // Query Contratos table
      if (contratosTableUrl) {
        try {
          console.log('🔷 Querying Contratos table:', contratosTableUrl);
          
          const contratosQuery = new Query({
            where: `COD_PROYEC='${attributes.COD_PROYEC}'`,
            outFields: ['*'],
            returnGeometry: false
          });

          const contratosResult = await query.executeQueryJSON(contratosTableUrl, contratosQuery);
          console.log('🔷 Contratos query result:', contratosResult);

          if (contratosResult.features && contratosResult.features.length > 0) {
            contratosFeatures = contratosResult.features;
            console.log('🔷 Found Contratos features:', contratosFeatures.length);
            console.log('🔷 First Contrato feature sample:', contratosFeatures[0]?.attributes);
          } else {
            console.log('🔷 No Contratos features found');
          }
        } catch (error) {
          console.warn('⚠️ Error querying Contratos table:', error);
          // Try alternative index if first one fails
          const alternativeUrl = contratosTableUrl.replace('/3', '/4');
          if (alternativeUrl !== contratosTableUrl) {
            try {
              console.log('🔷 Trying alternative Contratos table URL:', alternativeUrl);
              const contratosQuery = new Query({
                where: `COD_PROYEC='${attributes.COD_PROYEC}'`,
                outFields: ['*'],
                returnGeometry: false
              });
              const contratosResult = await query.executeQueryJSON(alternativeUrl, contratosQuery);
              if (contratosResult.features && contratosResult.features.length > 0) {
                contratosFeatures = contratosResult.features;
                console.log('🔷 Found Contratos features at alternative index:', contratosFeatures.length);
              }
            } catch (altError) {
              console.warn('⚠️ Alternative Contratos query also failed:', altError);
            }
          }
        }
      }

      // Merge PEP features with Contratos features (like the original app does)
      console.log('🔷 Merging PEP and Contratos features...');
      console.log('🔷 PEP features count:', pepFeatures.length);
      console.log('🔷 Contratos features count:', contratosFeatures.length);
      
      let mergedContracts: any[] = [];
      
      if (pepFeatures.length > 0) {
        // If we have PEP features, use them as base and merge with Contratos
        mergedContracts = pepFeatures.map((pepFeature: any) => {
          const pepAttrs = pepFeature.attributes || pepFeature;
          
          // Try to find matching contract by NUMERO_CONTRATO or NUM_CONTRATO fields
          const contratoFeature = contratosFeatures.find((contrato: any) => {
            const contratoAttrs = contrato.attributes || contrato;
            // Try both possible field names for contract number
            return contratoAttrs.NUM_CONTRATO === pepAttrs.NUMERO_CONTRATO || 
                   contratoAttrs.NUMERO_CONTRATO === pepAttrs.NUMERO_CONTRATO ||
                   contratoAttrs.NUM_CONTRATO === pepAttrs.NUM_CONTRATO;
          });

          if (contratoFeature) {
            const contratoAttrs = contratoFeature.attributes || contratoFeature;
            console.log('🔷 Merging contract:', pepAttrs.NUMERO_CONTRATO, 'with contract table data');
            // Use contract data if available (contract table has more complete data)
            return {
              ...pepAttrs,
              OBJETO_CONT: contratoAttrs.OBJETO_CONTRATO || contratoAttrs.OBJETO_CONT || pepAttrs.OBJETO_CONTRATO || pepAttrs.OBJETO_CONT,
              FECHA_FIN_CONT: contratoAttrs.FECHA_FIN_CONT || contratoAttrs.FECHA_FIN || pepAttrs.FECHA_FIN,
              FECHA_INI_CONT: contratoAttrs.FECHA_INI_CONT || contratoAttrs.FECHA_INICIO || pepAttrs.FECHA_INICIO,
              FECHA_LIQ_CONT: contratoAttrs.FECHA_LIQ_CONT || contratoAttrs.FECHA_LIQ || pepAttrs.FECHA_LIQ,
              FECHA_POS_FIN_CONT: contratoAttrs.FECHA_POS_FIN_CONT || contratoAttrs.FECHA_POS_FIN || pepAttrs.FECHA_POS_FIN
            };
          } else {
            console.log('🔷 Using PEP data only for contract:', pepAttrs.NUMERO_CONTRATO);
            // Fallback to PEP data only
            return {
              ...pepAttrs,
              OBJETO_CONT: pepAttrs.OBJETO_CONTRATO || pepAttrs.OBJETO_CONT,
              FECHA_FIN_CONT: pepAttrs.FECHA_FIN,
              FECHA_INI_CONT: pepAttrs.FECHA_INICIO,
              FECHA_LIQ_CONT: pepAttrs.FECHA_LIQ,
              FECHA_POS_FIN_CONT: pepAttrs.FECHA_POS_FIN
            };
          }
        });
      } else if (contratosFeatures.length > 0) {
        // If no PEP features but we have Contratos, use Contratos directly
        console.log('💡 No PEP features found, using Contratos data directly');
        mergedContracts = contratosFeatures.map((contratoFeature: any) => {
          const contratoAttrs = contratoFeature.attributes || contratoFeature;
          return {
            ...contratoAttrs,
            // Map contract fields to expected field names
            NUMERO_CONTRATO: contratoAttrs.NUM_CONTRATO || contratoAttrs.NUMERO_CONTRATO,
            OBJETO_CONT: contratoAttrs.OBJETO_CONTRATO || contratoAttrs.OBJETO_CONT,
            FECHA_INI_CONT: contratoAttrs.FECHA_INI_CONT || contratoAttrs.FECHA_INICIO,
            FECHA_FIN_CONT: contratoAttrs.FECHA_FIN_CONT || contratoAttrs.FECHA_FIN,
            FECHA_LIQ_CONT: contratoAttrs.FECHA_LIQ_CONT || contratoAttrs.FECHA_LIQ,
            FECHA_POS_FIN_CONT: contratoAttrs.FECHA_POS_FIN_CONT || contratoAttrs.FECHA_POS_FIN
          };
        });
      } else {
        console.log('⚠️ No PEP or Contratos features found');
      }

      console.log('🔷 Total merged contracts:', mergedContracts.length);
      if (mergedContracts.length > 0) {
        console.log('🔷 First merged contract sample:', mergedContracts[0]);
        console.log('🔷 Sample contract fields:');
        console.log('  - NUMERO_CONTRATO:', mergedContracts[0].NUMERO_CONTRATO);
        console.log('  - OBJETO_CONT:', mergedContracts[0].OBJETO_CONT);
        console.log('  - FECHA_INI_CONT:', mergedContracts[0].FECHA_INI_CONT);
        console.log('  - AVANCE_FISICO:', mergedContracts[0].AVANCE_FISICO);
        console.log('  - FASE_PEP:', mergedContracts[0].FASE_PEP);
      }

      // Query population data from table
      let populationData: any[] = [];
      
      // Build population table URL from map layer or config
      let populationTableUrl = '';
      if (this.state.jimuMapView) {
        const allLayers = this.state.jimuMapView.view.map.allLayers;
        for (let i = 0; i < allLayers.length; i++) {
          const layer = allLayers.getItemAt(i);
          if ((layer as any).url) {
            const layerUrl = (layer as any).url;
            if (layerUrl.includes('proyecto') || layerUrl.includes('SIGI')) {
              const lastSlashIndex = layerUrl.lastIndexOf('/');
              let baseUrl = layerUrl.substring(0, lastSlashIndex);
              if (!baseUrl.includes('MapServer') && !baseUrl.includes('FeatureServer')) {
                baseUrl = `${baseUrl}/MapServer`;
              }
              // Try index 6 first (common pattern: projects=2, pep=5, population=6)
              populationTableUrl = `${baseUrl}/6`;
              console.log('🔷 Constructed population table URL:', populationTableUrl);
              break;
            }
          }
        }
      }
      
      // Fallback to config if URL couldn't be constructed
      if (!populationTableUrl && config.TablaPoblacional) {
        populationTableUrl = config.TablaPoblacional;
        console.log('🔷 Using population table URL from config:', populationTableUrl);
      }

      if (populationTableUrl && this.state.jimuMapView) {
        try {
          const qPopulation = new Query({
            where: `COD_PROYEC='${attributes.COD_PROYEC}'`,
            outFields: ['*'],
            returnGeometry: false
          });

          const populationResult = await query.executeQueryJSON(populationTableUrl, qPopulation);
          console.log('🔷 Population query result:', populationResult);
          
          if (populationResult.features && populationResult.features.length > 0) {
            populationData = populationResult.features.map((f: any) => f.attributes);
            console.log('🔷 Found population features:', populationData.length);
          } else {
            console.log('🔷 No population features found');
          }
        } catch (error) {
          console.warn('⚠️ Error querying population data:', error);
          console.log('💡 Tip: If this table index is wrong, check your MapServer layers and update the index in widget.tsx');
        }
      }

      this.setState({
        projectImageUrl,
        contractsData: mergedContracts,
        populationData,
        isLoading: false
      });

    } catch (error) {
      console.error('Error loading project data:', error);
      this.setState({ isLoading: false });
    }
  };

  // Close modal
  closeModal = (): void => {
    this.setState({
      isOpen: false,
      projectData: null,
      contractsData: [],
      populationData: [],
      selectedFase: '',
      activeTab: 'descripcion'
    });
  };

  // Change active tab
  setActiveTab = (tab: string): void => {
    this.setState({ activeTab: tab });
  };

  // Change selected fase
  setSelectedFase = (fase: string): void => {
    this.setState({
      selectedFase: fase,
      activeTab: 'detalle'
    });
  };

  // Get unique contracts by composite key
  uniqueByCompositeKey = (array: ContractData[], keys: string[]): ContractData[] => {
    const map = new Map();
    array.forEach(item => {
      const compositeKey = keys.map(key => item[key]).join('|');
      if (!map.has(compositeKey)) {
        map.set(compositeKey, item);
      }
    });
    return Array.from(map.values());
  };

  // Sort by custom order
  sortByCustomOrder = (array: ContractData[], order: string[], key: string): ContractData[] => {
    const orderMap = new Map(order.map((item, index) => [item, index]));
    return array.sort((a, b) => {
      const aOrder = orderMap.get(a[key]) ?? 999;
      const bOrder = orderMap.get(b[key]) ?? 999;
      return aOrder - bOrder;
    });
  };

  // Get filtered and sorted contracts for selected fase
  getFilteredContracts = (): ContractData[] => {
    const { contractsData, selectedFase } = this.state;

    const estadoOrder = ['En Ejecución', 'Suspendido', 'Suscrito Legalizado', 'Terminado', 'Liquidado', 'Proceso Jurídico', 'N/A'];
    const uniqueContracts = this.uniqueByCompositeKey(contractsData, ['NUMERO_CONTRATO', 'ESTADO_CONTRATO', 'FASE_PEP', 'OBJETO_CONTRATO', 'VALOR_CONTRATO']);
    const sortedContracts = this.sortByCustomOrder(uniqueContracts, estadoOrder, 'ESTADO_CONTRATO');

    if (!selectedFase) return sortedContracts;

    if (selectedFase.toUpperCase() === 'OTROS COSTOS') {
      return sortedContracts.filter(c =>
        c.FASE_PEP &&
        c.FASE_PEP.toUpperCase() !== 'FASE 1' &&
        c.FASE_PEP.toUpperCase() !== 'FASE 2' &&
        c.FASE_PEP.toUpperCase() !== 'FASE 3'
      );
    }

    return sortedContracts.filter(c => c.FASE_PEP?.toUpperCase() === selectedFase.toUpperCase());
  };

  // Check if fase has contracts
  hasFaseContracts = (fase: string): boolean => {
    const { contractsData } = this.state;
    if (fase === 'OTROS COSTOS') {
      return contractsData.some((c: ContractData) =>
        c.FASE_PEP &&
        c.FASE_PEP.toUpperCase() !== 'FASE 1' &&
        c.FASE_PEP.toUpperCase() !== 'FASE 2' &&
        c.FASE_PEP.toUpperCase() !== 'FASE 3'
      );
    }
    return contractsData.some((c: ContractData) => c.FASE_PEP?.toUpperCase() === fase.toUpperCase());
  };

  // Get end date info based on project state
  getEndDateInfo = (): { label: string; value: string } => {
    const { projectData } = this.state;
    if (!projectData) return { label: 'Fecha Fin', value: '-' };

    if (projectData.ESTADO === 'Liquidado') {
      return {
        label: 'Fecha de Liquidación',
        value: formatLongDate(projectData.FECHA_LIQ_PRY)
      };
    } else if (projectData.ESTADO === 'Terminado') {
      return {
        label: 'Fecha de Terminación',
        value: formatLongDate(projectData.FECHA_FIN)
      };
    } else {
      return {
        label: 'Fecha Fin Estimada',
        value: formatLongDate(projectData.FECHA_POS_FIN_PRY)
      };
    }
  };

  // Render progress bar
  renderProgressBar = (percentProgress: number | undefined | null, style: string = ''): React.ReactElement => {
    if (percentProgress === undefined || percentProgress === null || isNaN(percentProgress)) {
      return <div style={{ width: '100%' }}>Sin dato registrado</div>;
    }

    const backgroundColor = '#0083DB';
    const percentProgressLabel = formatDecimal(percentProgress, 1, 1);

    return (
      <div className="progress-row">
        <div className="progress-label-col">
          <span className="text-value">{percentProgressLabel}%</span>
        </div>
        <div className="progress-bar-col" style={{ position: 'relative' }}>
          <div className="container-progress" style={{ width: '100%', ...((style && { width: style }) || {}) }}>
            <div
              className="percent"
              style={{
                width: `${Math.min(percentProgress, 100)}%`,
                backgroundColor
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render contract card
  renderContractCard = (contract: ContractData): React.ReactElement => {
    let fechaFin: string;
    let labelFechaFin: string;

    if (contract.ESTADO_CONTRATO === 'Liquidado') {
      fechaFin = formatLongDate(contract.FECHA_LIQ_CONT);
      labelFechaFin = 'Fecha de Liquidación';
    } else if (contract.ESTADO_CONTRATO === 'Terminado') {
      fechaFin = formatLongDate(contract.FECHA_FIN_CONT);
      labelFechaFin = 'Fecha de Terminación';
    } else {
      fechaFin = formatLongDate(contract.FECHA_POS_FIN_CONT);
      labelFechaFin = 'Fecha Fin Estimada';
    }

    const physicalProgress = this.renderProgressBar(contract.AVANCE_FISICO, '100%');
    const financialProgress = this.renderProgressBar(contract.AVANCE_FINANCIERO, '100%');

    return (
      <div className="card-pep" key={contract.NUMERO_CONTRATO}>
        <div>
          <label className="cell text-primary" style={{ fontWeight: 'bold', fontSize: '13px' }}>
            Contrato de {contract.ACTIVIDAD} No. {contract.NUMERO_CONTRATO}
          </label>
          <p className="text-value" style={{ color: '#666666', margin: '8px 0', fontSize: '12px', lineHeight: '1.4' }}>
            {contract.OBJETO_CONT}
          </p>
          <div className="contract-layout">
            <div className="contract-info">
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td className="text-primary" style={{ width: '50%' }}>Inversión</td>
                    <td className="text-primary" style={{ textAlign: 'left' }}>{formatMoney(contract.VALOR_CONTRATO)}</td>
                  </tr>
                  <tr>
                    <td className="text-value" style={{ width: '50%' }}>Fecha de Inicio</td>
                    <td className="text-value" style={{ textAlign: 'left' }}>{formatLongDate(contract.FECHA_INI_CONT)}</td>
                  </tr>
                  <tr>
                    <td className="text-value" style={{ width: '50%' }}>{labelFechaFin}</td>
                    <td className="text-value" style={{ textAlign: 'left' }}>{fechaFin}</td>
                  </tr>
                  <tr>
                    <td className="text-value" style={{ width: '50%' }}>Estado</td>
                    <td className="text-value" style={{ textAlign: 'left' }}>{contract.ESTADO_CONTRATO}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="contract-progress-section">
              <div style={{ marginBottom: '10px' }}>
                <div className="text-right-aligned">
                  <span className="cell text-value" style={{ fontWeight: 'bold' }}>AVANCE FÍSICO</span>
                </div>
                {physicalProgress}
              </div>
              <div style={{ marginTop: '10px' }}>
                <div className="text-right-aligned">
                  <span className="cell text-value" style={{ fontWeight: 'bold' }}>AVANCE FINANCIERO</span>
                </div>
                {financialProgress}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Descripción tab content
  renderDescripcionTab = (): React.ReactElement => {
    const { projectData, projectImageUrl } = this.state;
    if (!projectData) return <div>Sin datos</div>;

    const endDateInfo = this.getEndDateInfo();
    const fechaCorte = formatLongDate(projectData.CREATIONDATE);

    const fase = projectData.FASE || 'FASE';
    const isFase1 = fase.toUpperCase() === 'FASE 1';
    const isFase2 = fase.toUpperCase() === 'FASE 2';
    const isFase3 = fase.toUpperCase() === 'FASE 3';
    const hasOtrosCostos = !!projectData.OTROS_COSTOS;

    const imgFase1 = isFase1 ? this.getImageUrl('Fase1On.png') : this.getImageUrl('Fase1Off.png');
    const imgFase2 = isFase2 ? this.getImageUrl('Fase2On.png') : this.getImageUrl('Fase2Off.png');
    const imgFase3 = isFase3 ? this.getImageUrl('Fase3On.png') : this.getImageUrl('Fase3Off.png');
    const imgOtrosCostos = hasOtrosCostos ? this.getImageUrl('OtrosCostosOn.png') : this.getImageUrl('OtrosCostosOff.png');

    return (
      <div className="detail-tab-container descripcion">
        <div className="col-left">
          <div className="objetivo-container">
            <b>OBJETIVO</b>
            <div style={{ paddingTop: '5px' }}>
              {projectData.ALC_PROYEC || 'Sin descripción disponible'}
            </div>
          </div>

          <div>
            <div className="info-table">
              <div className="info-row">
                <div className="text-primary" style={{ fontWeight: 'bold' }}>INVERSIÓN</div>
                <div className="text-primary" style={{ fontWeight: 'bold' }}>{formatMoney(projectData.VALOR_TOTAL)}</div>
              </div>
              <div className="info-row">
                <div className="text-value">Fecha de Inicio</div>
                <div className="text-value">{formatLongDate(projectData.FECHA_INICIO)}</div>
              </div>
              <div className="info-row">
                <div className="text-value">{endDateInfo.label}</div>
                <div className="text-value">{endDateInfo.value}</div>
              </div>
              <div className="info-row">
                <div className="text-value">Plan de Desarrollo</div>
                <div className="text-value">{projectData.PDD || '-'}</div>
              </div>
              <div className="info-row">
                <div className="text-value">Macroproyecto</div>
                <div className="text-value">{projectData.MACROPROY || '-'}</div>
              </div>
              <div className="info-row">
                <div className="text-value">Localidad</div>
                <div className="text-value">{projectData.LOCALIDAD || '-'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '3px', marginTop: '3px' }}>
              <span className="text-note">NOTA: El valor de inversión está determinado en Peso Colombiano (COP).</span>
            </div>
          </div>
        </div>

        <div className="col-right">
          <div className="card-results">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span className="text-value" style={{ fontWeight: 'bold', fontSize: '12px' }}>ESTADO AVANCE DE INVERSIÓN</span>
              <span className="text-value" style={{ fontWeight: 'bold', fontSize: '13px' }}>{fase}</span>
            </div>

            <div style={{ padding: '8px 0 5px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3px' }}>
                <div
                  className="inversion-descripcion-icon"
                  style={{ width: '22%', cursor: 'pointer', maxWidth: '22%' }}
                  onClick={() => this.setSelectedFase('FASE 1')}
                >
                  <img src={imgFase1} height="65px" alt="Fase 1" style={{ maxWidth: '100%', height: 'auto', maxHeight: '65px' }} />
                </div>
                <div className="inversion-descripcion-icon" style={{ width: '8%', maxWidth: '8%' }}>
                  <img src={this.getImageUrl('IndicadorOff.png')} height="12px" style={{ marginTop: '0px', maxWidth: '100%' }} alt="" />
                </div>
                <div
                  className="inversion-descripcion-icon"
                  style={{ width: '22%', cursor: 'pointer', maxWidth: '22%' }}
                  onClick={() => this.setSelectedFase('FASE 2')}
                >
                  <img src={imgFase2} height="65px" alt="Fase 2" style={{ maxWidth: '100%', height: 'auto', maxHeight: '65px' }} />
                </div>
                <div className="inversion-descripcion-icon" style={{ width: '8%', maxWidth: '8%' }}>
                  <img src={this.getImageUrl('IndicadorOff.png')} height="12px" style={{ marginTop: '0px', maxWidth: '100%' }} alt="" />
                </div>
                <div
                  className="inversion-descripcion-icon"
                  style={{ width: '22%', cursor: 'pointer', maxWidth: '22%' }}
                  onClick={() => this.setSelectedFase('FASE 3')}
                >
                  <img src={imgFase3} height="65px" alt="Fase 3" style={{ maxWidth: '100%', height: 'auto', maxHeight: '65px' }} />
                </div>
              </div>
            </div>

            <div style={{ padding: '3px 0 5px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div
                  className="inversion-descripcion-icon"
                  style={{
                    width: '35%',
                    cursor: hasOtrosCostos ? 'pointer' : 'default',
                    opacity: hasOtrosCostos ? 1 : 0.4,
                    maxWidth: '35%'
                  }}
                  onClick={() => hasOtrosCostos && this.setSelectedFase('OTROS COSTOS')}
                >
                  <img src={imgOtrosCostos} height="48px" alt="Otros Costos" style={{ maxWidth: '100%', height: 'auto', maxHeight: '48px' }} />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span className="text-note">
                NOTA. El estado de avance corresponde a lo ejecutado a la fecha de corte: {fechaCorte}.
              </span>
            </div>
          </div>

          <div className="project-image-container">
            {projectImageUrl ? (
              <img
                src={projectImageUrl}
                alt={projectData.NOM_PROYEC}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  // Render Detalle tab content
  renderDetalleTab = (): React.ReactElement => {
    const { projectData, selectedFase } = this.state;
    if (!projectData) return <div>Sin datos</div>;

    const fechaCorte = formatLongDate(projectData.CREATIONDATE);
    const filteredContracts = this.getFilteredContracts();

    const hasFase1 = this.hasFaseContracts('FASE 1');
    const hasFase2 = this.hasFaseContracts('FASE 2');
    const hasFase3 = this.hasFaseContracts('FASE 3');
    const hasOtros = projectData.OTROS_COSTOS !== null || this.hasFaseContracts('OTROS COSTOS');

    const imgFase1 = hasFase1 ? this.getImageUrl('Fase1On.png') : this.getImageUrl('Fase1Off.png');
    const imgFase2 = hasFase2 ? this.getImageUrl('Fase2On.png') : this.getImageUrl('Fase2Off.png');
    const imgFase3 = hasFase3 ? this.getImageUrl('Fase3On.png') : this.getImageUrl('Fase3Off.png');
    const imgOtros = hasOtros ? this.getImageUrl('OtrosCostos1On.png') : this.getImageUrl('OtrosCostos1Off.png');

    const imgIndc1 = selectedFase?.toUpperCase() === 'FASE 1' ? this.getImageUrl('IndicadorOn.png') : this.getImageUrl('IndicadorOff.png');
    const imgIndc2 = selectedFase?.toUpperCase() === 'FASE 2' ? this.getImageUrl('IndicadorOn.png') : this.getImageUrl('IndicadorOff.png');
    const imgIndc3 = selectedFase?.toUpperCase() === 'FASE 3' ? this.getImageUrl('IndicadorOn.png') : this.getImageUrl('IndicadorOff.png');
    const imgIndcO = selectedFase?.toUpperCase() === 'OTROS COSTOS' ? this.getImageUrl('IndicadorOn.png') : this.getImageUrl('IndicadorOff.png');

    return (
      <div className="detail-tab-container project-progress">
        <div className="detalle-layout">
          <div className="detalle-sidebar">
            <div className="fase-button-container">
              <div
                className="fase-icon-column inversion-detalle-icon"
                onClick={() => this.setSelectedFase('FASE 1')}
                style={{ cursor: 'pointer' }}
              >
                <img className="inversion-detalle-img" src={imgFase1} height="95px" alt="Fase 1" />
              </div>
              <div className="fase-indicador-column inversion-detalle-icon">
                <img className="inversion-detalle-indicador-img" src={imgIndc1} height="50px" alt="" />
              </div>
            </div>

            <div className="fase-button-container">
              <div
                className="fase-icon-column inversion-detalle-icon"
                onClick={() => this.setSelectedFase('FASE 2')}
                style={{ cursor: 'pointer' }}
              >
                <img className="inversion-detalle-img" src={imgFase2} height="95px" alt="Fase 2" />
              </div>
              <div className="fase-indicador-column inversion-detalle-icon">
                <img className="inversion-detalle-indicador-img" src={imgIndc2} height="50px" alt="" />
              </div>
            </div>

            <div className="fase-button-container">
              <div
                className="fase-icon-column inversion-detalle-icon"
                onClick={() => this.setSelectedFase('FASE 3')}
                style={{ cursor: 'pointer' }}
              >
                <img className="inversion-detalle-img" src={imgFase3} height="95px" alt="Fase 3" />
              </div>
              <div className="fase-indicador-column inversion-detalle-icon">
                <img className="inversion-detalle-indicador-img" src={imgIndc3} height="50px" alt="" />
              </div>
            </div>

            <div className="fase-button-container">
              <div
                className="fase-icon-column inversion-detalle-icon"
                onClick={() => hasOtros && this.setSelectedFase('OTROS COSTOS')}
                style={{ cursor: hasOtros ? 'pointer' : 'default', opacity: hasOtros ? 1 : 0.4 }}
              >
                <img className="inversion-detalle-img" src={imgOtros} height="55px" alt="Otros Costos" />
              </div>
              <div className="fase-indicador-column inversion-detalle-icon">
                <img className="inversion-detalle-indicador-img" src={imgIndcO} height="50px" alt="" />
              </div>
            </div>
          </div>

          <div className="detalle-content">
            <div className="detalle-content-scroll">
              {filteredContracts.length > 0 ? (
                filteredContracts.map((contract, index) => (
                  <React.Fragment key={index}>
                    {this.renderContractCard(contract)}
                  </React.Fragment>
                ))
              ) : (
                <div style={{ textAlign: 'center', width: '100%', marginTop: '20px', color: '#666', fontSize: '12px', lineHeight: '1.5' }}>
                  Para el período comprendido entre junio de 2016 a la fecha de corte,
                  no se han ejecutado recursos por el concepto de Inversiones.
                </div>
              )}
            </div>

            <div style={{ paddingLeft: '0px', marginBottom: '8px', textAlign: 'right', paddingRight: '5px' }}>
              <div style={{ padding: '5px 0px' }}>
                <span className="text-note" style={{ lineHeight: '1.3' }}>
                  NOTA. El valor de inversión está determinado en peso colombiano (COP).
                  <br />
                  El estado de avance corresponde a lo ejecutado a la fecha de corte: {fechaCorte}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Población tab content
  renderPoblacionTab = (): React.ReactElement => {
    const { projectData, populationData } = this.state;
    if (!projectData) return <div>Sin datos</div>;

    const populationLabels: { [key: string]: string } = {
      MUJERES: 'MUJERES',
      HOMBRES: 'HOMBRES',
      INFANICA: 'INFANCIA',
      ADOLESCENTES: 'ADOLESCENTES',
      JOVENES: 'JÓVENES',
      ADULTOS: 'ADULTOS',
      ADULTO_MAYOR: 'ADULTO MAYOR',
      INDIGENA: 'INDÍGENA',
      GITANO: 'GITANO',
      RAIZAL: 'RAIZAL',
      PALENQUERO: 'PALENQUERO',
      NINGUN_GRUPO_ETNICO: 'NINGÚN GRUPO ÉTNICO',
      NO_INFORMA: 'NO INFORMA'
    };

    const popData = populationData[0] || null;

    return (
      <div className="detail-tab-container centered population-table poblacion-layout">
        <div className="poblacion-card-outer">
          <div style={{ width: '16.666%' }}></div>
          <div className="poblacion-card-inner">
            <div className="poblacion-main-card">
              <div className="centered" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingBottom: '18px', alignItems: 'center' }}>
                  <label className="cell text-primary font-large" style={{ fontWeight: 'bold', margin: 0 }}>Población Beneficiada:</label>
                  <span className="text-value font-large" style={{ fontWeight: 'normal' }}>{formatThousands(projectData.POB_BENEFIC)} Personas</span>
                </div>
              </div>

              <div className="centered">
                {popData ? (
                  <div className="population-container">
                    {Object.keys(populationLabels).map(key => {
                      const value = popData[key];
                      if (value && value > 0) {
                        return (
                          <div key={key} style={{ display: 'flex', marginBottom: '6px', alignItems: 'center' }}>
                            <div style={{ flex: '0 0 60%', textAlign: 'right', paddingRight: '8px' }} className="text-value">
                              {populationLabels[key]}&nbsp;:
                            </div>
                            <div style={{ flex: '1', textAlign: 'left', paddingLeft: '8px' }} className="text-value">
                              <span style={{ fontWeight: 'normal' }}>{formatThousands(value)}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                ) : (
                  <div className="text-value" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Datos poblacionales no disponibles
                  </div>
                )}
              </div>

              <div className="centered text-note" style={{ marginTop: '12px' }}>
                <p style={{ margin: '5px 0' }}>Base de Cálculo: Censo 2018 DANE</p>
              </div>
            </div>

            <div className="poblacion-note-container">
              <span>
                <strong>NOTA:</strong> Las inversiones de la EAAB ESP no se asocian a un enfoque poblacional,
                debido a que no implementan acciones afirmativas diferenciales para grupos poblacionales con
                condiciones o características étnicas, transcurrir vital, género, orientaciones sexuales e
                identidades de género, discapacidad o víctimas del conflicto armado, sino que, pretende que
                la cobertura, continuidad y calidad de los servicios de acueducto y alcantarillado sea universal
                para todos los habitantes de la ciudad. En este sentido, y entendiendo la naturaleza de los
                proyectos a cargo de la EAAB, sí desarrollan un enfoque territorial que reconoce las necesidades
                particulares de las zonas a intervenir, e implementa soluciones de rehabilitación, expansión,
                renovación o reposición con una ubicación geográfica definida y reportada trimestralmente al
                aplicativo SEGPLAN.
              </span>
            </div>
          </div>
          <div style={{ width: '16.666%' }}></div>
        </div>
      </div>
    );
  };

  render(): React.ReactElement {
    const { useMapWidgetIds } = this.props;
    const { isOpen, isLoading, activeTab, projectData } = this.state;

    // Debug log every render
    if (isOpen) {
      console.log('🔷🔷🔷 RENDER - POPUP IS OPEN 🔷🔷🔷');
      console.log('🔷 Project:', projectData?.COD_PROYEC, 'Tab:', activeTab);
    }

    return (
      <div css={widgetStyles} className="pop-up-acueducto" data-widget-id={this.props.id}>
        {/* Map View Component - Optional */}
        {useMapWidgetIds && useMapWidgetIds.length > 0 ? (
          <JimuMapViewComponent
            useMapWidgetId={useMapWidgetIds[0]}
            onActiveViewChange={this.onActiveViewChange}
          />
        ) : (
          <div style={{ display: 'none' }}>No map configured - Widget will work without map</div>
        )}

        {/* Project Modal - Always available */}
        {isOpen && (
          <div className="modal-overlay" onClick={this.closeModal}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title">{projectData?.COD_PROYEC || ''}</h1>
                  <button className="close" onClick={this.closeModal}>×</button>
                </div>

                <div className="modal-title-secondary">
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', lineHeight: '1.2' }}>{projectData?.NOM_PROYEC || ''}</h2>
                </div>

                <div className="modal-body">
                  <div className="tabs-container">
                    <div className="tab-headers">
                      <button
                        className={`tab-header ${activeTab === 'descripcion' ? 'active' : ''}`}
                        onClick={() => this.setActiveTab('descripcion')}
                      >
                        DESCRIPCIÓN INVERSIÓN
                      </button>
                      <button
                        className={`tab-header ${activeTab === 'detalle' ? 'active' : ''}`}
                        onClick={() => this.setActiveTab('detalle')}
                      >
                        DETALLE DE EJECUCIÓN
                      </button>
                      <button
                        className={`tab-header ${activeTab === 'poblacion' ? 'active' : ''}`}
                        onClick={() => this.setActiveTab('poblacion')}
                      >
                        POBLACIÓN BENEFICIADA
                      </button>
                    </div>

                    <div className="tab-content">
                      {isLoading ? (
                        <div className="loading-container">
                          <div>Cargando...</div>
                        </div>
                      ) : (
                        <>
                          {activeTab === 'descripcion' && this.renderDescripcionTab()}
                          {activeTab === 'detalle' && this.renderDetalleTab()}
                          {activeTab === 'poblacion' && this.renderPoblacionTab()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
