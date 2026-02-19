/** @jsx jsx */
/**
 * Widget SIGI Header Bar
 * Barra superior con búsqueda y botones de navegación
 * Migrado desde Web AppBuilder - widgets Search, ZoomIn, ZoomOut, HomeButton, MyLocation
 */

import { React, jsx, css, type AllWidgetProps } from 'jimu-core';
import { useState, useRef, useEffect } from 'react';
import { type IMConfig } from '../config';
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { TextInput, Button, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Tooltip } from 'jimu-ui';
import Locator from '@arcgis/core/rest/locator';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';

const headerStyles = css`
  .header-bar {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
  }

  /* Dropdown selector de fuente */
  .source-selector {
    width: 32px;
    height: 32px;
  }

  .source-selector .dropdown-button {
    background-color: #0083DB;
    border: none;
    color: white;
    width: 100%;
    height: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Barra de búsqueda */
  .search-container {
    display: flex;
    align-items: center;
    flex: 1;
    max-width: 274px;
  }

  .search-input {
    flex: 1;
    height: 32px;
    border: 3px solid #0083DB !important;
    border-right: none !important;
    border-radius: 0;
  }

  .search-input input {
    font-size: 12px;
  }

  .search-button {
    width: 32px;
    height: 32px;
    background-color: #0083DB;
    border: 3px solid #0083DB;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .search-button:hover {
    background-color: #8cbcfc !important;
  }

  .search-button svg {
    width: 16px;
    height: 16px;
    fill: white;
  }

  /* Botones de navegación */
  .nav-button {
    width: 32px;
    height: 32px;
    background-color: #0083DB;
    border: none;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 0;
  }

  .nav-button:hover {
    background-color: #139BF5 !important;
  }

  .nav-button svg {
    width: 20px;
    height: 20px;
    fill: white;
  }

  /* Resultados de búsqueda */
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
  }

  .search-result-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    font-size: 12px;
  }

  .search-result-item:hover {
    background-color: #f0f8ff;
  }

  /* Responsive */
  @media (max-width: 600px), (max-height: 600px) {
    .search-container {
      max-width: 211px;
    }

    .search-input {
      height: 32px;
    }

    .nav-button {
      width: 30px;
      height: 30px;
    }

    .nav-button svg {
      width: 15px;
      height: 15px;
    }
  }
`;

// Iconos SVG
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const ZoomInIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const ZoomOutIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>
);

const DownArrowIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10l5 5 5-5z" fill="white"/>
  </svg>
);

interface HeaderProps extends AllWidgetProps<IMConfig> {}

const Widget = (props: HeaderProps) => {
  const { config, useMapWidgetIds } = props;
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSource, setSelectedSource] = useState('SGO');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // URLs de geocodificadores
  const geocoderUrls = {
    SGO: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    EAAB: config?.eaabGeocoderUrl || ''
  };

  // Handler para cuando el mapa está listo
  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv);
    }
  };

  // Buscar direcciones
  const handleSearch = async () => {
    if (!searchText.trim() || !jimuMapView) return;

    const geocoderUrl = geocoderUrls[selectedSource] || geocoderUrls.SGO;

    try {
      const results = await Locator.addressToLocations(geocoderUrl, {
        address: { SingleLine: searchText },
        countryCode: 'COL',
        maxLocations: 5,
        outFields: ['*']
      });

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    }
  };

  // Seleccionar resultado
  const selectResult = (result: any) => {
    if (!jimuMapView) return;

    const point = new Point({
      x: result.location.x,
      y: result.location.y,
      spatialReference: { wkid: 4326 }
    });

    // Zoom al punto
    jimuMapView.view.goTo({
      target: point,
      zoom: 17
    });

    // Agregar marcador
    const graphic = new Graphic({
      geometry: point,
      symbol: {
        type: 'simple-marker',
        color: '#0083DB',
        size: '12px',
        outline: { color: 'white', width: 2 }
      } as any
    });

    jimuMapView.view.graphics.removeAll();
    jimuMapView.view.graphics.add(graphic);

    setSearchText(result.address);
    setShowResults(false);
  };

  // Zoom In
  const handleZoomIn = () => {
    if (jimuMapView?.view) {
      jimuMapView.view.zoom += 1;
    }
  };

  // Zoom Out
  const handleZoomOut = () => {
    if (jimuMapView?.view) {
      jimuMapView.view.zoom -= 1;
    }
  };

  // Home (extent inicial)
  const handleHome = () => {
    if (jimuMapView?.view) {
      // Extent de Bogotá/Cundinamarca
      jimuMapView.view.goTo({
        center: [-74.1, 4.6],
        zoom: 10
      });
    }
  };

  // Mi ubicación
  const handleMyLocation = () => {
    if (!jimuMapView?.view) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = new Point({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          });

          jimuMapView.view.goTo({
            target: point,
            zoom: 17
          });

          // Marcador de ubicación
          const graphic = new Graphic({
            geometry: point,
            symbol: {
              type: 'simple-marker',
              color: '#00ff00',
              size: '14px',
              outline: { color: 'white', width: 2 }
            } as any
          });

          jimuMapView.view.graphics.add(graphic);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    }
  };

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div css={headerStyles} className="jimu-widget sigi-header-widget">
      {/* Conexión con el mapa */}
      {useMapWidgetIds && useMapWidgetIds.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={onActiveViewChange}
        />
      )}

      <div className="header-bar">
        {/* Selector de fuente de búsqueda */}
        <Dropdown className="source-selector">
          <DropdownButton className="dropdown-button">
            <DownArrowIcon />
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem onClick={() => setSelectedSource('SGO')}>
              SGO World Geocoder
            </DropdownItem>
            <DropdownItem onClick={() => setSelectedSource('EAAB')}>
              Localizador EAAB
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Barra de búsqueda */}
        <div className="search-container" ref={searchContainerRef} style={{ position: 'relative' }}>
          <TextInput
            className="search-input"
            placeholder="Buscar dirección o lugar"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <SearchIcon />
          </button>

          {/* Resultados */}
          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => selectResult(result)}
                >
                  {result.address}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <Tooltip title="Acercar" placement="bottom">
          <Button className="nav-button" onClick={handleZoomIn}>
            <ZoomInIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Alejar" placement="bottom">
          <Button className="nav-button" onClick={handleZoomOut}>
            <ZoomOutIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Vista inicial" placement="bottom">
          <Button className="nav-button" onClick={handleHome}>
            <HomeIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Mi ubicación" placement="bottom">
          <Button className="nav-button" onClick={handleMyLocation}>
            <LocationIcon />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Widget;
