// src/components/Layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <UtensilsCrossed className="text-green-600" size={24} />
            <span className="text-lg font-semibold text-green-600">NutriCasa</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600 transition">Inicio</Link>
            <Link to="/login" className="hover:text-green-600 transition">Login</Link>
            <Link to="/register" className="hover:text-green-600 transition">Registro</Link>
            <Link to="/sitemap" className="hover:text-green-600 transition">Mapa del Sitio</Link>
          </div>
          
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-4 md:mt-0">
            Hecho con <Heart size={16} className="text-red-500 fill-current" /> para tu salud
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;