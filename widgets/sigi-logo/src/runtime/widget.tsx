/** @jsx jsx */
/**
 * Widget Logo EAAB
 * Logo circular en esquina superior izquierda
 * Migrado desde widgets/LogoAcueducto de Web AppBuilder
 */

import { React, jsx, css, type AllWidgetProps } from 'jimu-core';
import { useState } from 'react';
import { type IMConfig } from '../config';

// Importar imágenes locales
const logoDefault = require('../../logo.png');
const logoHoverDefault = require('../../logoover.png');

const logoStyles = css`
  .logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .logo-container:hover {
    transform: scale(1.02);
  }

  .logo-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

interface LogoProps extends AllWidgetProps<IMConfig> {}

const Widget = (props: LogoProps) => {
  const { config } = props;
  const [isHovered, setIsHovered] = useState(false);

  // URLs de las imágenes (usar imágenes locales por defecto)
  const logoUrl = config?.logoUrl && config.logoUrl.startsWith('http') 
    ? config.logoUrl 
    : logoDefault;
  const logoHoverUrl = config?.logoHoverUrl && config.logoHoverUrl.startsWith('http') 
    ? config.logoHoverUrl 
    : logoHoverDefault;
  const linkUrl = config?.linkUrl || 'https://www.acueducto.com.co';

  const handleClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  return (
    <div 
      css={logoStyles} 
      className="jimu-widget sigi-logo-widget"
    >
      <div 
        className="logo-container"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Empresa de Acueducto y Alcantarillado de Bogotá"
      >
        <img
          className="logo-image"
          src={isHovered ? logoHoverUrl : logoUrl}
          alt="Logo EAAB - Acueducto"
        />
      </div>
    </div>
  );
};

export default Widget;
