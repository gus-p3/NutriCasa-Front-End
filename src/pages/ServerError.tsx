import React from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

const ServerError: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-50 transform scale-150"></div>
            <div className="relative bg-white p-6 rounded-full shadow-sm border border-orange-50">
              <AlertTriangle size={80} className="text-orange-500" />
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-4">500</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Error en el servidor</h2>
        <p className="text-gray-600 mb-10 leading-relaxed">
          Lo sentimos, hemos tenido un problema inesperado en nuestra cocina central. 
          Estamos trabajando para arreglarlo lo antes posible.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            <RefreshCw size={18} /> Reintentar
          </button>
          
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all"
          >
            <Home size={18} /> Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
