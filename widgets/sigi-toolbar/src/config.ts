import { type ImmutableObject } from 'seamless-immutable';

export interface Config {
  /**
   * Mostrar herramienta de medición
   */
  showMeasure: boolean;
  
  /**
   * Mostrar galería de mapas base
   */
  showBasemap: boolean;
  
  /**
   * Mostrar lista de capas
   */
  showLayers: boolean;
  
  /**
   * Mostrar herramienta de dibujo
   */
  showDraw: boolean;
  
  /**
   * Mostrar herramienta de compartir
   */
  showShare: boolean;
  
  /**
   * Color de fondo de los botones
   */
  buttonColor: string;
  
  /**
   * Color de hover
   */
  hoverColor: string;
}

export type IMConfig = ImmutableObject<Config>;
