import { type ImmutableObject } from 'seamless-immutable';

export interface Config {
  /**
   * URL de la imagen del logo (estado normal)
   */
  logoUrl: string;
  
  /**
   * URL de la imagen del logo (estado hover)
   */
  logoHoverUrl: string;
  
  /**
   * URL de enlace al hacer clic
   */
  linkUrl: string;
  
  /**
   * Texto alternativo para accesibilidad
   */
  altText: string;
}

export type IMConfig = ImmutableObject<Config>;
