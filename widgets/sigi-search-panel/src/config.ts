import { type ImmutableObject } from 'seamless-immutable';

export interface Config {
  /**
   * URL del Feature Layer de proyectos SIGI
   */
  proyectosLayerUrl: string;
  
  /**
   * URL del Feature Layer de localidades
   */
  localidadesLayerUrl: string;
  
  /**
   * ID del WebMap que contiene las capas
   */
  webMapId: string;
  
  /**
   * Planes de Desarrollo disponibles
   */
  pddOptions: PDDOption[];
  
  /**
   * Estados de proyecto disponibles
   */
  estadoOptions: EstadoOption[];
  
  /**
   * Radio de buffer para búsqueda geográfica (en kilómetros)
   */
  bufferRadiusKm: number;
  
  /**
   * Color primario
   */
  primaryColor: string;
  
  /**
   * Color de hover
   */
  hoverColor: string;
}

export interface PDDOption {
  value: string;
  label: string;
  description: string;
  dateRange: string;
}

export interface EstadoOption {
  value: string;
  label: string;
}

export type IMConfig = ImmutableObject<Config>;
