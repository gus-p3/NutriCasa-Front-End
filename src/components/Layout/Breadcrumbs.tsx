import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // No mostrar en la Home
  if (location.pathname === '/' || location.pathname === '/home') return null;

  const breadcrumbNameMap: { [key: string]: string } = {
    inicio: 'Dashboard',
    recipes: 'Recetas',
    inventory: 'Mi Alacena',
    history: 'Historial',
    'my-recipes': 'Mis Recetas',
    'create-recipe': 'Nueva Receta',
    'edit-recipe': 'Editar Receta',
    profile: 'Perfil',
    'ai-dashboard': 'Asistente IA',
    'forgot-password': 'Recuperar Contraseña',
    'reset-password': 'Cambiar Contraseña',
    sitemap: 'Mapa del Sitio',
    register: 'Registro',
    login: 'Acceso'
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-3 mb-6 shadow-sm overflow-x-auto whitespace-nowrap">
      <div className="container mx-auto px-4 flex items-center text-sm font-medium text-gray-500">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
        >
          <Home size={15} />
          <span>Home</span>
        </Link>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Intentar obtener el nombre amigable, si no usar el valor del path (capitalizado)
          const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <div key={to} className="flex items-center">
              <ChevronRight size={14} className="mx-2 text-gray-300" />
              {last ? (
                <span className="text-green-700 font-bold">{name}</span>
              ) : (
                <Link 
                  to={to} 
                  className="hover:text-green-600 transition-colors"
                >
                  {name}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
