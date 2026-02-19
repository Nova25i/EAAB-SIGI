import { type ImmutableObject } from 'seamless-immutable';

export interface Config {
  /**
   * Logo URL
   */
  logoUrl: string;
  
  /**
   * Capa de proyectos
   */
  CapaDeProyectos: string;
  
  /**
   * Capa de macroproyectos
   */
  CapaMacroProyectos: string;
  
  /**
   * Capa de proyectos por localidad
   */
  CapaProyectosLocalidad: string;
  
  /**
   * Campo de imagen del elemento PEP
   */
  CampoImagenElementoPep: string;
  
  /**
   * Campo de imagen de macroproyecto
   */
  CampoImagenMacroproyecto: string;
  
  /**
   * Template para URL de imágenes de proyectos
   */
  TemplateImagen: string;
  
  /**
   * Template para URL de imágenes de macroproyectos
   */
  TemplateImagenMacroproyecto: string;
  
  /**
   * Template para URL de imágenes de proyectos por localidad
   */
  TemplateImagenProyectosLocalidad: string;
  
  /**
   * Tabla de elementos PEP
   */
  TablaElementosPEP: string;
  
  /**
   * Tabla poblacional
   */
  TablaPoblacional: string;
  
  /**
   * Columna de localidad
   */
  ColumnaLocalidad: string;
  
  /**
   * Logo URL de macroproyectos
   */
  LogoUrlMacroproyecto: string;
  
  /**
   * Logo URL de proyectos
   */
  LogoUrlProyectos: string;
}

export interface ProjectData {
  OBJECTID: number;
  COD_PROYEC: string;
  NOM_PROYEC: string;
  ALC_PROYEC?: string;
  ESTADO?: string;
  PDD?: string;
  MACROPROY?: string;
  LOCALIDAD?: string;
  FASE?: string;
  OTROS_COSTOS?: string;
  VALOR_TOTAL?: number;
  POB_BENEFIC?: number;
  FECHA_INICIO?: number;
  FECHA_FIN?: number;
  FECHA_POS_FIN_PRY?: number;
  FECHA_LIQ_PRY?: number;
  CREATIONDATE?: number;
  [key: string]: any;
}

export interface ContractData {
  NUMERO_CONTRATO: string;
  ACTIVIDAD: string;
  OBJETO_CONTRATO?: string;
  VALOR_CONTRATO?: number;
  AVANCE_FISICO?: number;
  AVANCE_FINANCIERO?: number;
  ESTADO_CONTRATO?: string;
  FASE_PEP?: string;
  FECHA_INI_CONT?: number;
  FECHA_FIN_CONT?: number;
  FECHA_POS_FIN_CONT?: number;
  FECHA_LIQ_CONT?: number;
  [key: string]: any;
}

export interface PopulationData {
  MUJERES?: number;
  HOMBRES?: number;
  INFANICA?: number;
  ADOLESCENTES?: number;
  JOVENES?: number;
  ADULTOS?: number;
  ADULTO_MAYOR?: number;
  INDIGENA?: number;
  GITANO?: number;
  RAIZAL?: number;
  PALENQUERO?: number;
  NINGUN_GRUPO_ETNICO?: number;
  NO_INFORMA?: number;
  TOTAL_PERSONAS?: number;
  [key: string]: any;
}

export type IMConfig = ImmutableObject<Config>;
