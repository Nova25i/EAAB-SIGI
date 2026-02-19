import { type ImmutableObject } from 'seamless-immutable';

export interface Config {
  /**
   * URL del geocodificador de EAAB (opcional)
   */
  eaabGeocoderUrl: string;
  
  /**
   * Color de los botones
   */
  buttonColor: string;
  
  /**
   * Color de hover
   */
  hoverColor: string;
  
  /**
   * Placeholder del buscador
   */
  searchPlaceholder: string;
}

export type IMConfig = ImmutableObject<Config>;
