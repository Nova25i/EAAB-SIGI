/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps } from 'jimu-core';
import { useState, useEffect, useRef } from 'react';
import { type IMConfig } from '../config';
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { Button, Tooltip } from 'jimu-ui';
import DistanceMeasurement2D from 'esri/widgets/DistanceMeasurement2D';
import AreaMeasurement2D from 'esri/widgets/AreaMeasurement2D';
import BasemapGallery from 'esri/widgets/BasemapGallery';
import LayerList from 'esri/widgets/LayerList';
import Sketch from 'esri/widgets/Sketch';
import GraphicsLayer from 'esri/layers/GraphicsLayer';

interface ToolbarProps extends AllWidgetProps<IMConfig> { }

const toolbarStyles = css`
  .sigi-toolbar {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }

  
  .toolbar-button {
    width: 38px;
    height: 38px;
    background-color: #0083DB;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: white;
    cursor: pointer;
  }

  .toolbar-button:hover,
  .toolbar-button.active {
    background-color: #139BF5 !important;
  }

  .toolbar-button svg {
    width: 50%;
    height: 50%;
    display: block;
    fill: white;
  }
  .tool-panel {
    position: fixed;
    background: white;
    border: 1px solid #0083DB;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    padding: 10px;
    min-width: 260px;
    max-height: 450px;
    overflow-y: auto;
    z-index: 99999;
  }

  .tool-panel-header {
    color: #0083DB;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const Widget = (props: ToolbarProps) => {
  const { useMapWidgetIds } = props;

  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  const graphicsLayerRef = useRef<GraphicsLayer>(null);
  const measureContainer = useRef<HTMLDivElement>(null);
  const basemapContainer = useRef<HTMLDivElement>(null);
  const layersContainer = useRef<HTMLDivElement>(null);
  const drawContainer = useRef<HTMLDivElement>(null);

  const cleanupWidgets = () => { };

  const onActiveViewChange = (jmv: JimuMapView) => {
    if (!jmv) return;
    setJimuMapView(jmv);

    if (!graphicsLayerRef.current) {
      graphicsLayerRef.current = new GraphicsLayer();
      jmv.view.map.add(graphicsLayerRef.current);
    }
  };

  const toggleTool = (tool: string) => {
    if (activeTool === tool) {
      setActiveTool(null);
      return;
    }

    const rect = buttonRefs.current[tool]?.getBoundingClientRect();

    if (rect) {
      setPanelPosition({
        top: rect.top,
        left: rect.right + 8
      });
    }

    setActiveTool(tool);

    setTimeout(() => {
      if (!jimuMapView) return;

      switch (tool) {

        case 'measure':
          if (measureContainer.current) {
            new DistanceMeasurement2D({
              view: jimuMapView.view as any,
              container: measureContainer.current
            });
          }
          break;

        case 'basemap':
          if (basemapContainer.current) {
            new BasemapGallery({
              view: jimuMapView.view as any,
              container: basemapContainer.current
            });
          }
          break;

        case 'layers':
          if (layersContainer.current) {
            new LayerList({
              view: jimuMapView.view as any,
              container: layersContainer.current
            });
          }
          break;

        case 'draw':
          if (drawContainer.current && graphicsLayerRef.current) {
            new Sketch({
              view: jimuMapView.view as any,
              layer: graphicsLayerRef.current,
              container: drawContainer.current
            });
          }
          break;

      }
    }, 50);
  };
  const buttons = [
    {
      id: 'measure',
      label: 'Medir',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="2,17 7,22 22,7 17,2" />
          <rect x="8.5" y="16.5" width="2" height="3" transform="rotate(45 8.5 16.5)" fill="white" />
          <rect x="12" y="13" width="2" height="3.5" transform="rotate(45 12 13)" fill="white" />
          <rect x="15.5" y="9.5" width="2" height="3" transform="rotate(45 15.5 9.5)" fill="white" />
        </svg>
      )
    },
    {
      id: 'basemap', label: 'Mapas Base', icon: (
        <svg viewBox="0 0 24 24">
          <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
        </svg>
      )
    },
    {
      id: 'layers', label: 'Capas', icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.96 1.5L2.5 6.25v1.5l9.46 4.75 9.5-4.75v-1.5l-9.5-4.75z" />
          <path d="M2.5 10.75v1.5l9.46 4.75 9.5-4.75v-1.5l-9.5 4.75z" />
          <path d="M2.5 15.75v1.5l9.46 4.75 9.5-4.75v-1.5l-9.5 4.75z" />
        </svg>
      )
    },
    {
      id: 'draw',
      label: 'Dibujar',
      icon: (
        <svg viewBox="0 0 24 24">
          <g transform="rotate(135 12 12)">

            {/* Cuerpo principal más grueso */}
            <rect
              x="4"
              y="9"
              width="14"
              height="6"
              rx="1.2"
              fill="currentColor"
            />

            {/* Punta madera */}
            <polygon
              points="18,9 22,12 18,15"
              fill="white"
            />

            {/* Mina */}
            <polygon
              points="20.5,11 22,12 20.5,13"
              fill="currentColor"
            />

            {/* Borrador */}
            <rect
              x="2"
              y="9"
              width="3"
              height="6"
              rx="0.8"
              fill="white"
            />

          </g>
        </svg>
      )
    }

  ];

  return (
    <div css={toolbarStyles} className="jimu-widget">
      {useMapWidgetIds?.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={onActiveViewChange}
        />
      )}

      <div className="sigi-toolbar">
        {buttons.map(btn => (
          <Tooltip key={btn.id} title={btn.label} placement="right">
            <Button
              ref={el => (buttonRefs.current[btn.id] = el)}
              className={`toolbar-button ${activeTool === btn.id ? 'active' : ''}`}
              onClick={() => toggleTool(btn.id)}
            >
              {btn.icon}
            </Button>
          </Tooltip>
        ))}
      </div>

      {activeTool && (
        <div
          ref={panelRef}
          className="tool-panel"
          style={{
            top: panelPosition.top,
            left: panelPosition.left
          }}
        >
          <div className="tool-panel-header">{activeTool}</div>

          {activeTool === 'measure' && <div ref={measureContainer} />}
          {activeTool === 'basemap' && <div ref={basemapContainer} />}
          {activeTool === 'layers' && <div ref={layersContainer} />}
          {activeTool === 'draw' && <div ref={drawContainer} />}
        </div>
      )}
    </div>
  );
};

export default Widget;