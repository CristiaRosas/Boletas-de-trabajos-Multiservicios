// src/components/LogoMultis.jsx
import React from 'react';
import LogoImage from '../assets/logo-multis.jpg';

const LogoMultis = () => {
  return (
    <div className="flex items-center">
      <img 
        src={LogoImage} 
        alt="MULTISERVICIOS" 
        className="h-12 mr-3"
        onError={(e) => {
          // Fallback si la imagen no carga
          e.target.style.display = 'none';
        }}
      />
      <div className="text-center">
        <div className="font-bold text-xs">MULTISERVICIOS</div>
        <div className="text-xs">S15</div>
        <div className="text-xs">SISTEMAS TÉCNICOS DE SEGURIDAD</div>
      </div>
    </div>
  );
};

export default LogoMultis;