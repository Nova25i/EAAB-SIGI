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
    .input-full {
      width: 100%;
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
          Selecciona el widget de mapa para detectar clicks en proyectos y mostrar la ficha.
        </p>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Capas de Proyectos"
      >
        <SettingRow className="setting-row" flow="wrap" label="Capa de Proyectos (ID)">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.CapaDeProyectos || ''}
            onChange={(e: any) => onConfigChange('CapaDeProyectos', e.target.value)}
            placeholder="ID de la capa de proyectos"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Capa de Macroproyectos (ID)">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.CapaMacroProyectos || ''}
            onChange={(e: any) => onConfigChange('CapaMacroProyectos', e.target.value)}
            placeholder="ID de la capa de macroproyectos"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Capa de Proyectos por Localidad (ID)">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.CapaProyectosLocalidad || ''}
            onChange={(e: any) => onConfigChange('CapaProyectosLocalidad', e.target.value)}
            placeholder="ID de la capa de proyectos por localidad"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Tablas Relacionadas"
      >
        <SettingRow className="setting-row" flow="wrap" label="Tabla de Elementos PEP (URL completa)">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.TablaElementosPEP || ''}
            onChange={(e: any) => onConfigChange('TablaElementosPEP', e.target.value)}
            placeholder="https://servidor/rest/services/.../FeatureServer/1"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Tabla Poblacional (URL completa)">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.TablaPoblacional || ''}
            onChange={(e: any) => onConfigChange('TablaPoblacional', e.target.value)}
            placeholder="https://servidor/rest/services/.../FeatureServer/2"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Configuración de Imágenes"
      >
        <SettingRow className="setting-row" flow="wrap" label="Campo de Imagen del Elemento PEP">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.CampoImagenElementoPep || ''}
            onChange={(e: any) => onConfigChange('CampoImagenElementoPep', e.target.value)}
            placeholder="Nombre del campo (ej: COD_IMAGEN)"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Campo de Imagen de Macroproyecto">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.CampoImagenMacroproyecto || ''}
            onChange={(e: any) => onConfigChange('CampoImagenMacroproyecto', e.target.value)}
            placeholder="Nombre del campo"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Template URL de Imágenes de Proyectos">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.TemplateImagen || ''}
            onChange={(e: any) => onConfigChange('TemplateImagen', e.target.value)}
            placeholder="//www.servidor.com/imagenes/{0}.png"
          />
          <p className="info-text">
            Usa {'{0}'} como placeholder para el código del proyecto.
          </p>
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Template URL de Imágenes de Macroproyectos">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.TemplateImagenMacroproyecto || ''}
            onChange={(e: any) => onConfigChange('TemplateImagenMacroproyecto', e.target.value)}
            placeholder="//www.servidor.com/imagenes/MP/{0}.png"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Template URL de Imágenes de Localidades">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.TemplateImagenProyectosLocalidad || ''}
            onChange={(e: any) => onConfigChange('TemplateImagenProyectosLocalidad', e.target.value)}
            placeholder="//www.servidor.com/imagenes/LOC/{0}.png"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Logos"
      >
        <SettingRow className="setting-row" flow="wrap" label="Logo URL">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.logoUrl || ''}
            onChange={(e: any) => onConfigChange('logoUrl', e.target.value)}
            placeholder="images/SIGI_Logo.png"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Logo URL de Macroproyectos">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.LogoUrlMacroproyecto || ''}
            onChange={(e: any) => onConfigChange('LogoUrlMacroproyecto', e.target.value)}
            placeholder="URL del logo"
          />
        </SettingRow>

        <SettingRow className="setting-row" flow="wrap" label="Logo URL de Proyectos">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.LogoUrlProyectos || ''}
            onChange={(e: any) => onConfigChange('LogoUrlProyectos', e.target.value)}
            placeholder="URL del logo"
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        className="setting-section"
        title="Otros Campos"
      >
        <SettingRow className="setting-row" flow="wrap" label="Columna de Localidad">
          <TextInput
            type="text"
            className="input-full"
            value={props.config?.ColumnaLocalidad || ''}
            onChange={(e: any) => onConfigChange('ColumnaLocalidad', e.target.value)}
            placeholder="Nombre del campo de localidad"
          />
        </SettingRow>
      </SettingSection>
    </div>
  );
}
