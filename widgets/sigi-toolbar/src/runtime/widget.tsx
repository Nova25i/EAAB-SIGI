/** @jsx jsx */
/**
 * Widget SIGI Toolbar
 * Barra de herramientas lateral izquierda
 * Migrado desde Web AppBuilder - AcueductoTheme
 */

import { React, jsx, css, type AllWidgetProps, type IMState } from 'jimu-core';
import { useState, useEffect, useRef } from 'react';
import { type IMConfig } from '../config';
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { Button, Tooltip, Collapse } from 'jimu-ui';
import DistanceMeasurement2D from 'esri/widgets/DistanceMeasurement2D';
import AreaMeasurement2D from 'esri/widgets/AreaMeasurement2D';
import BasemapGallery from 'esri/widgets/BasemapGallery';
import LayerList from 'esri/widgets/LayerList';
import Sketch from 'esri/widgets/Sketch';
import GraphicsLayer from 'esri/layers/GraphicsLayer';

// Estilos CSS fieles al diseño original de WAB
const toolbarStyles = css`
  .sigi-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  .toolbar-button {
    width: 40px;
    height: 40px;
    background-color: #0083DB;
    border: none;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
    padding: 0;
  }

  .toolbar-button:hover {
    background-color: #139BF5 !important;
  }

  .toolbar-button:active {
    background-color: #139BF5 !important;
  }

  .toolbar-button.active {
    background-color: #139BF5;
  }

  .toolbar-button img {
    width: 20px;
    height: 20px;
    filter: brightness(0) invert(1); /* Hace los iconos blancos */
  }

  .toolbar-button svg {
    width: 20px;
    height: 20px;
    fill: white;
  }

  /* Panel desplegable */
  .tool-panel {
    position: absolute;
    left: 50px;
    top: 0;
    background: white;
    border: 1px solid #0083DB;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    padding: 10px;
    min-width: 250px;
    max-width: 350px;
    max-height: 450px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 100;
  }

  .tool-panel-header {
    color: #0083DB;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: -10px;
    background: white;
    z-index: 1;
  }

  /* Estilos para el scrollbar */
  .tool-panel::-webkit-scrollbar {
    width: 8px;
  }

  .tool-panel::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .tool-panel::-webkit-scrollbar-thumb {
    background: #0083DB;
    border-radius: 4px;
  }

  .tool-panel::-webkit-scrollbar-thumb:hover {
    background: #139BF5;
  }

  /* Responsive */
  @media (max-width: 600px), (max-height: 600px) {
    .toolbar-button {
      width: 30px;
      height: 30px;
    }

    .toolbar-button img,
    .toolbar-button svg {
      width: 15px;
      height: 15px;
    }
  }
`;

// Iconos SVG inline para los botones
const MeasureIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.39 18.36l3.54-3.54 1.41 1.41-3.54 3.54-1.41-1.41zm2.12-4.24l1.41 1.41 10.61-10.61-1.41-1.41-10.61 10.61zm11.31-7.78l1.41-1.41 1.41 1.41-1.41 1.41-1.41-1.41zm-2.83 2.83l1.41-1.41 1.41 1.41-1.41 1.41-1.41-1.41zm5.66 5.66l1.41-1.41 1.41 1.41-1.41 1.41-1.41-1.41zm2.83-2.83l1.41-1.41 1.41 1.41-1.41 1.41-1.41-1.41zM20.49 19.08l-1.41-1.41-3.54 3.54 1.41 1.41 3.54-3.54z"/>
  </svg>
);

const BasemapIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h8v8h-8v-8zm2 2v4h4v-4h-4z"/>
  </svg>
);

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const DrawIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
  </svg>
);

interface ToolbarProps extends AllWidgetProps<IMConfig> {}

const Widget = (props: ToolbarProps) => {
  const { useMapWidgetIds, config } = props;
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [measureType, setMeasureType] = useState<'distance' | 'area'>('distance');
  
  // Referencias para los widgets de ArcGIS
  const distanceMeasurementRef = useRef<DistanceMeasurement2D>(null);
  const areaMeasurementRef = useRef<AreaMeasurement2D>(null);
  const basemapGalleryRef = useRef<BasemapGallery>(null);
  const layerListRef = useRef<LayerList>(null);
  const sketchRef = useRef<Sketch>(null);
  const graphicsLayerRef = useRef<GraphicsLayer>(null);
  
  // Contenedores para los paneles
  const measureContainerRef = useRef<HTMLDivElement>(null);
  const basemapContainerRef = useRef<HTMLDivElement>(null);
  const layersContainerRef = useRef<HTMLDivElement>(null);
  const drawContainerRef = useRef<HTMLDivElement>(null);

  // Handler para cuando el mapa está listo
  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
      
      // Limpiar widgets previos
      cleanupWidgets();
      
      // Inicializar capa de gráficos para dibujo si no existe
      if (!graphicsLayerRef.current) {
        graphicsLayerRef.current = new GraphicsLayer({
          title: 'SIGI Drawings',
          id: 'sigi-drawings-layer'
        });
        jmv.view.map.add(graphicsLayerRef.current);
      }
    }
  };

  // Limpiar todos los widgets cuando se desmonta o cambia el mapa
  const cleanupWidgets = () => {
    if (distanceMeasurementRef.current) {
      distanceMeasurementRef.current.destroy();
      distanceMeasurementRef.current = null;
    }
    if (areaMeasurementRef.current) {
      areaMeasurementRef.current.destroy();
      areaMeasurementRef.current = null;
    }
    if (basemapGalleryRef.current) {
      basemapGalleryRef.current.destroy();
      basemapGalleryRef.current = null;
    }
    if (layerListRef.current) {
      layerListRef.current.destroy();
      layerListRef.current = null;
    }
    if (sketchRef.current) {
      sketchRef.current.destroy();
      sketchRef.current = null;
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cleanupWidgets();
    };
  }, []);

  // Activar herramienta de medición
  const activateMeasureTool = (type: 'distance' | 'area') => {
    if (!jimuMapView) return;
    
    setMeasureType(type);
    
    // Limpiar mediciones previas
    if (distanceMeasurementRef.current) {
      distanceMeasurementRef.current.destroy();
      distanceMeasurementRef.current = null;
    }
    if (areaMeasurementRef.current) {
      areaMeasurementRef.current.destroy();
      areaMeasurementRef.current = null;
    }

    if (type === 'distance' && measureContainerRef.current) {
      distanceMeasurementRef.current = new DistanceMeasurement2D({
        view: jimuMapView.view as any,
        container: measureContainerRef.current
      });
    } else if (type === 'area' && measureContainerRef.current) {
      areaMeasurementRef.current = new AreaMeasurement2D({
        view: jimuMapView.view as any,
        container: measureContainerRef.current
      });
    }
  };

  // Toggle de herramienta activa
  const toggleTool = (toolName: string) => {
    if (activeTool === toolName) {
      setActiveTool(null);
      cleanupWidgets();
    } else {
      setActiveTool(toolName);
      
      // Inicializar el widget correspondiente
      if (jimuMapView) {
        setTimeout(() => {
          switch (toolName) {
            case 'measure':
              activateMeasureTool('distance');
              break;
            case 'basemap':
              if (basemapContainerRef.current && !basemapGalleryRef.current) {
                basemapGalleryRef.current = new BasemapGallery({
                  view: jimuMapView.view as any,
                  container: basemapContainerRef.current
                });
              }
              break;
            case 'layers':
              if (layersContainerRef.current && !layerListRef.current) {
                layerListRef.current = new LayerList({
                  view: jimuMapView.view as any,
                  container: layersContainerRef.current,
                  listItemCreatedFunction: (event) => {
                    const item = event.item;
                    item.panel = {
                      content: 'legend',
                      open: false
                    };
                  }
                });
              }
              break;
            case 'draw':
              if (drawContainerRef.current && !sketchRef.current && graphicsLayerRef.current) {
                sketchRef.current = new Sketch({
                  view: jimuMapView.view as any,
                  layer: graphicsLayerRef.current,
                  container: drawContainerRef.current,
                  creationMode: 'update'
                });
              }
              break;
            case 'share':
              // Funcionalidad de compartir: copiar URL actual
              const url = window.location.href;
              navigator.clipboard.writeText(url).then(() => {
                alert('URL copiada al portapapeles');
              }).catch(() => {
                alert('No se pudo copiar la URL');
              });
              setActiveTool(null);
              break;
          }
        }, 50);
      }
    }
  };

  // Filtrar botones según configuración
  const getVisibleButtons = () => {
    const allButtons = [
      { 
        id: 'measure', 
        icon: <MeasureIcon />, 
        tooltip: 'Medir', 
        action: () => toggleTool('measure'),
        visible: config?.showMeasure !== false
      },
      { 
        id: 'basemap', 
        icon: <BasemapIcon />, 
        tooltip: 'Mapas Base', 
        action: () => toggleTool('basemap'),
        visible: config?.showBasemap !== false
      },
      { 
        id: 'layers', 
        icon: <LayersIcon />, 
        tooltip: 'Capas', 
        action: () => toggleTool('layers'),
        visible: config?.showLayers !== false
      },
      { 
        id: 'draw', 
        icon: <DrawIcon />, 
        tooltip: 'Dibujar', 
        action: () => toggleTool('draw'),
        visible: config?.showDraw !== false
      },
      { 
        id: 'share', 
        icon: <ShareIcon />, 
        tooltip: 'Compartir', 
        action: () => toggleTool('share'),
        visible: config?.showShare !== false
      },
    ];
    
    return allButtons.filter(btn => btn.visible);
  };

  const toolbarButtons = getVisibleButtons();

  // Generar estilos dinámicos con los colores de configuración
  const dynamicStyles = css`
    .toolbar-button:hover {
      background-color: ${config?.hoverColor || '#139BF5'} !important;
    }

    .toolbar-button:active {
      background-color: ${config?.hoverColor || '#139BF5'} !important;
    }

    .toolbar-button.active {
      background-color: ${config?.hoverColor || '#139BF5'};
    }
  `;

  return (
    <div css={[toolbarStyles, dynamicStyles]} className="jimu-widget sigi-toolbar-widget">
      {/* Conexión con el mapa */}
      {useMapWidgetIds && useMapWidgetIds.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={onActiveViewChange}
        />
      )}

      <div className="sigi-toolbar">
        {toolbarButtons.map((btn) => (
          <Tooltip key={btn.id} title={btn.tooltip} placement="right">
            <Button
              className={`toolbar-button ${activeTool === btn.id ? 'active' : ''}`}
              onClick={btn.action}
              aria-label={btn.tooltip}
              style={{
                backgroundColor: config?.buttonColor || '#0083DB'
              }}
            >
              {btn.icon}
            </Button>
          </Tooltip>
        ))}
      </div>

      {/* Panel de Medición */}
      {activeTool === 'measure' && (
        <div className="tool-panel" style={{ top: '0px' }}>
          <div className="tool-panel-header">Herramienta de Medición</div>
          <div style={{ marginBottom: '10px' }}>
            <Button
              size="sm"
              type={measureType === 'distance' ? 'primary' : 'secondary'}
              onClick={() => activateMeasureTool('distance')}
              style={{ marginRight: '5px' }}
            >
              Distancia
            </Button>
            <Button
              size="sm"
              type={measureType === 'area' ? 'primary' : 'secondary'}
              onClick={() => activateMeasureTool('area')}
            >
              Área
            </Button>
          </div>
          <div ref={measureContainerRef} />
        </div>
      )}

      {/* Panel de Mapas Base */}
      {activeTool === 'basemap' && (
        <div className="tool-panel" style={{ top: '48px' }}>
          <div className="tool-panel-header">Galería de Mapas Base</div>
          <div ref={basemapContainerRef} />
        </div>
      )}

      {/* Panel de Capas */}
      {activeTool === 'layers' && (
        <div className="tool-panel" style={{ top: '96px' }}>
          <div className="tool-panel-header">Capas del Mapa</div>
          <div ref={layersContainerRef} />
        </div>
      )}

      {/* Panel de Dibujo */}
      {activeTool === 'draw' && (
        <div className="tool-panel" style={{ top: '144px' }}>
          <div className="tool-panel-header">Herramientas de Dibujo</div>
          <div ref={drawContainerRef} />
        </div>
      )}
    </div>
  );
};

export default Widget;
