/** @jsx jsx */
/**
 * Widget SIGI Header Bar
 * Barra superior con búsqueda y botones de navegación
 */

import { React, jsx, css, type AllWidgetProps } from 'jimu-core';
import { useState, useRef, useEffect } from 'react';
import { type IMConfig } from '../config';
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis';
import { Button, Tooltip } from 'jimu-ui';
import Locator from '@arcgis/core/rest/locator';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';

const headerStyles = css`
  .jimu-widget {
    overflow: visible !important;
  }

  .header-bar {
    overflow: visible !important;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px;
  }

  .icon-button {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    background-color: #0083DB !important;
    border: none !important;
    padding: 0 !important;

    display: flex;
    align-items: center;
    justify-content: center;

    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }

  .icon-button:hover {
    background-color: #139BF5 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .icon-button svg {
    width: 22px;
    height: 22px;
    fill: white;
  }

  .search-container {
    display: flex;
    align-items: center;
    flex: 1;
    max-width: 274px;
  }

  .search-input-native {
    flex: 1;
    height: 40px;
    border: 2px solid #0083DB;
    outline: none;
    padding: 0 10px;
    font-size: 16px;
    box-sizing: border-box;
  }

  .search-results {
    box-sizing: border-box;
    position: fixed;
    background: white;
    padding: 0;
    border: 1px solid #d0d0d0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    max-height: 250px;
    overflow-y: auto;
    z-index: 9999;
  }

  .search-result-item {
    margin: 0;
    padding: 10px 14px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    font-size: 12px;
  }

  .search-result-item:hover {
    background-color: #f0f8ff;
  }

  .sigi-header-widget {
    overflow: visible !important;
  }

  @media (max-width: 600px), (max-height: 600px) {
    .search-container {
      max-width: 211px;
    }
  }
`;

/* ICONOS */

const SearchIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M11 19a8 8 0 1 1 5.3-14.1A8 8 0 0 1 11 19zm0-14a6 6 0 1 0 4.24 10.24A6 6 0 0 0 11 5zm7.71 13.29 3 3-1.42 1.42-3-3z" />
  </svg>
);

const ZoomInIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 11l9-7 9 7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M5 10v10h14V10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 22s6-6 6-11a6 6 0 1 0-12 0c0 5 6 11 6 11z"
      stroke="white"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="12" cy="11" r="2" fill="white" />
  </svg>
);

const DownArrowIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

interface HeaderProps extends AllWidgetProps<IMConfig> { }

const Widget = (props: HeaderProps) => {

  const { config, useMapWidgetIds } = props;

  const [resultsPosition, setResultsPosition] = useState({ top: 0, left: 0, width: 0 });
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSource, setSelectedSource] = useState('SGO');
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const sourceButtonRef = useRef<HTMLButtonElement>(null);

  const geocoderUrls = {
    SGO: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
    EAAB: config?.eaabGeocoderUrl || ''
  };

  const onActiveViewChange = (jmv: JimuMapView) => {
    if (jmv) setJimuMapView(jmv);
  };

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

      if (searchContainerRef.current) {
        const rect = searchContainerRef.current.getBoundingClientRect();
        setResultsPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    }
  };

  const selectResult = (result: any) => {
    if (!jimuMapView) return;

    const point = new Point({
      x: result.location.x,
      y: result.location.y,
      spatialReference: { wkid: 4326 }
    });

    jimuMapView.view.goTo({ target: point, zoom: 17 });

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

  const handleZoomIn = () => jimuMapView?.view && (jimuMapView.view.zoom += 1);
  const handleZoomOut = () => jimuMapView?.view && (jimuMapView.view.zoom -= 1);

  const handleHome = () => {
    jimuMapView?.view?.goTo({
      center: [-74.1, 4.6],
      zoom: 10
    });
  };

  const handleMyLocation = () => {
    if (!jimuMapView?.view || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((position) => {
      const point = new Point({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude
      });

      jimuMapView.view.goTo({ target: point, zoom: 17 });

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
    });
  };

  return (
    <div css={headerStyles} className="jimu-widget sigi-header-widget">

      {useMapWidgetIds?.length > 0 && (
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds[0]}
          onActiveViewChange={onActiveViewChange}
        />
      )}

      <div className="header-bar">

        <Button
          ref={sourceButtonRef}
          className="icon-button"
          onClick={() => setShowSourceMenu(!showSourceMenu)}
        >
          <DownArrowIcon />
        </Button>
        <div style={{ position: "relative" }}>

          {showSourceMenu && (
            <div
              style={{
                position: "fixed",
                top: sourceButtonRef.current?.getBoundingClientRect().bottom || 0,
                left: sourceButtonRef.current?.getBoundingClientRect().left || 0,
                background: "white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                border: "1px solid #ddd",
                minWidth: "200px",
                zIndex: 9999
              }}
            >
              <div
                className="search-result-item"
                onClick={() => {
                  setSelectedSource('SGO');
                  setShowSourceMenu(false);
                }}
              >
                SGO World Geocoder
              </div>

              <div
                className="search-result-item"
                onClick={() => {
                  setSelectedSource('EAAB');
                  setShowSourceMenu(false);
                }}
              >
                Localizador EAAB
              </div>
            </div>
          )}
        </div>
        <div className="search-container" ref={searchContainerRef}>
          <input
            className="search-input-native"
            placeholder="Buscar dirección o lugar"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          <Button className="icon-button" onClick={handleSearch}>
            <SearchIcon />
          </Button>

          {showResults && searchResults.length > 0 && (
            <div
              className="search-results"
              style={{
                top: resultsPosition.top,
                left: resultsPosition.left,
                width: resultsPosition.width
              }}
            >
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

        <Tooltip title="Acercar" placement="bottom">
          <Button className="icon-button" onClick={handleZoomIn}>
            <ZoomInIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Alejar" placement="bottom">
          <Button className="icon-button" onClick={handleZoomOut}>
            <ZoomOutIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Vista inicial" placement="bottom">
          <Button className="icon-button" onClick={handleHome}>
            <HomeIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Mi ubicación" placement="bottom">
          <Button className="icon-button" onClick={handleMyLocation}>
            <LocationIcon />
          </Button>
        </Tooltip>

      </div>
    </div>
  );
};

export default Widget;