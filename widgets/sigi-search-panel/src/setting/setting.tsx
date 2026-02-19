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
      color: #333;
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
          Selecciona el widget de mapa que contiene las capas de proyectos SIGI.
        </p>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="URLs de Servicios"
      >
        <SettingRow className="setting-row" flow="wrap" label="URL Capa de Proyectos">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.proyectosLayerUrl || ''}
            onChange={(e) => onConfigChange('proyectosLayerUrl', e.target.value)}
            placeholder="https://servidor/rest/services/.../FeatureServer/0"
          />
        </SettingRow>
        
        <SettingRow className="setting-row" flow="wrap" label="URL Capa de Localidades">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.localidadesLayerUrl || ''}
            onChange={(e) => onConfigChange('localidadesLayerUrl', e.target.value)}
            placeholder="https://servidor/rest/services/.../FeatureServer/1"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="ID del WebMap">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.webMapId || ''}
            onChange={(e) => onConfigChange('webMapId', e.target.value)}
            placeholder="f4eccdc1647b438db6b64462a80ff2b3"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Apariencia"
      >
        <SettingRow className="setting-row" flow="wrap" label="Color Primario">
          <TextInput
            type="text"
            className="w-100"
            value={props.config?.primaryColor || '#0083DB'}
            onChange={(e) => onConfigChange('primaryColor', e.target.value)}
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
