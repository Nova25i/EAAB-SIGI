/** @jsx jsx */
import { React, jsx, css } from 'jimu-core';
import { type AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components';
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { TextInput } from 'jimu-ui';
import { type IMConfig } from '../config';

export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const { id, useMapWidgetIds, onSettingChange } = props;

  // Handler para cambio de mapa seleccionado
  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({
      id,
      useMapWidgetIds
    });
  };

  // Handler para cambios de configuración
  const onConfigChange = (key: string, value: any) => {
    const config = {
      ...props.config,
      [key]: value
    };
    onSettingChange({
      id,
      config
    });
  };

  const style = css`
    .setting-section {
      padding: 16px;
    }
    .setting-row {
      margin-bottom: 12px;
    }
    .setting-label {
      font-weight: 500;
      margin-bottom: 4px;
    }
    .info-text {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
  `;

  return (
    <div css={style}>
      <SettingSection
        className="setting-section"
        title="Configuración del Mapa"
      >
        <SettingRow
          className="setting-row"
          flow="wrap"
          label="Seleccionar Widget de Mapa"
        >
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={useMapWidgetIds}
          />
        </SettingRow>
        <p className="info-text">
          Selecciona el widget de mapa para los botones de navegación (Zoom, Home, Mi Ubicación).
        </p>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Geocodificador"
      >
        <SettingRow className="setting-row" flow="wrap" label="URL del Geocodificador EAAB">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.eaabGeocoderUrl || ''}
            onChange={(e) => onConfigChange('eaabGeocoderUrl', e.target.value)}
            placeholder="https://servidor/arcgis/rest/services/Geocoder/GeocodeServer"
          />
        </SettingRow>
        
        <SettingRow className="setting-row" flow="wrap" label="Placeholder del Buscador">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.searchPlaceholder || 'Buscar dirección o lugar...'}
            onChange={(e) => onConfigChange('searchPlaceholder', e.target.value)}
            placeholder="Buscar dirección o lugar..."
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Apariencia"
      >
        <SettingRow className="setting-row" flow="wrap" label="Color de Botones">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.buttonColor || '#0083DB'}
            onChange={(e) => onConfigChange('buttonColor', e.target.value)}
            placeholder="#0083DB"
          />
        </SettingRow>
        
        <SettingRow className="setting-row" flow="wrap" label="Color Hover">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.hoverColor || '#139BF5'}
            onChange={(e) => onConfigChange('hoverColor', e.target.value)}
            placeholder="#139BF5"
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
}
