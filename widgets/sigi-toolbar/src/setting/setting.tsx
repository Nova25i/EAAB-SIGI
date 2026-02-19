/** @jsx jsx */
import { React, jsx, css } from 'jimu-core';
import { type AllWidgetSettingProps } from 'jimu-for-builder';
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components';
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components';
import { Switch, TextInput } from 'jimu-ui';
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
    .switch-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
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
          Selecciona el widget de mapa para las herramientas.
        </p>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Herramientas Visibles"
      >
        <div className="switch-row">
          <span>Herramienta de Medición</span>
          <Switch
            checked={props.config?.showMeasure !== false}
            onChange={(e) => onConfigChange('showMeasure', e.target.checked)}
          />
        </div>
        
        <div className="switch-row">
          <span>Galería de Mapas Base</span>
          <Switch
            checked={props.config?.showBasemap !== false}
            onChange={(e) => onConfigChange('showBasemap', e.target.checked)}
          />
        </div>
        
        <div className="switch-row">
          <span>Lista de Capas</span>
          <Switch
            checked={props.config?.showLayers !== false}
            onChange={(e) => onConfigChange('showLayers', e.target.checked)}
          />
        </div>
        
        <div className="switch-row">
          <span>Herramienta de Dibujo</span>
          <Switch
            checked={props.config?.showDraw !== false}
            onChange={(e) => onConfigChange('showDraw', e.target.checked)}
          />
        </div>
        
        <div className="switch-row">
          <span>Compartir</span>
          <Switch
            checked={props.config?.showShare !== false}
            onChange={(e) => onConfigChange('showShare', e.target.checked)}
          />
        </div>
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
