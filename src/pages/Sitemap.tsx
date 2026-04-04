import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ChevronRight, Home, LayoutDashboard, Utensils, User, Settings, Package, History as HistoryIcon, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sitemap: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const sections = [
    {
      title: 'Páginas Públicas',
      icon: <Map className="text-blue-500" size={24} />,
      links: [
        { to: '/', label: 'Página de Inicio', icon: <Home size={18} /> },
        { to: '/login', label: 'Iniciar Sesión', icon: <LogIn size={18} /> },
        { to: '/register', label: 'Registrarse', icon: <UserPlus size={18} /> },
        { to: '/forgot-password', label: 'Recuperar Contraseña', icon: <Settings size={18} /> },
      ]
    },
    {
      title: 'Espacio de Usuario',
      icon: <LayoutDashboard className="text-green-500" size={24} />,
      links: [
        { to: '/inicio', label: 'Dashboard Nutricional', icon: <LayoutDashboard size={18} /> },
        { to: '/recipes', label: 'Explorar Recetas', icon: <Utensils size={18} /> },
        { to: '/inventory', label: 'Mi Inventario / Alacena', icon: <Package size={18} /> },
        { to: '/history', label: 'Historial de Cocina', icon: <HistoryIcon size={18} /> },
        { to: '/my-recipes', label: 'Mis Recetas Propias', icon: <User size={18} /> },
        { to: '/create-recipe', label: 'Publicar Receta Nueva', icon: <Settings size={18} /> },
      ]
    },
    {
      title: 'Herramientas y Más',
      icon: <Settings className="text-gray-500" size={24} />,
      links: [
        { to: '/ai-dashboard', label: 'Asistente de IA (Sugerencias)', icon: <LayoutDashboard size={18} /> },
        { to: '/404', label: 'Página de Error (404)', icon: <Map size={18} /> },
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Map className="text-green-600" size={32} /> Mapa del Sitio
          </h1>
          <p className="text-lg text-gray-600">Encuentra rápidamente cualquier sección de NutriCasa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
              </div>
              
              <ul className="space-y-4">
                {section.links.map((link, lIdx) => {
                  const isPrivate = ['/inicio', '/recipes', '/inventory', '/history', '/my-recipes', '/create-recipe', '/ai-dashboard'].includes(link.to);
                  
                  return (
                    <li key={lIdx}>
                      <Link 
                        to={link.to} 
                        className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                          isPrivate && !isAuthenticated() 
                          ? 'opacity-50 grayscale cursor-not-allowed hover:bg-transparent' 
                          : 'hover:bg-green-50 text-gray-600 hover:text-green-700'
                        }`}
                        onClick={(e) => {
                          if (isPrivate && !isAuthenticated()) e.preventDefault();
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 group-hover:text-green-500 transition-colors">
                            {link.icon}
                          </span>
                          <span className="font-medium">{link.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-green-400" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-400 text-sm">
          © 2024 NutriCasa - Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
