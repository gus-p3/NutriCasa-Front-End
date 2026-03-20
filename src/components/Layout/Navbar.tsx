// src/components/Layout/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = (): void => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <UtensilsCrossed className="text-green-600" size={28} />
            <span className="text-xl font-bold text-green-600">NutriCasa</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                <span className="text-gray-600 hidden md:block">
                  Hola, {user?.name}
                </span>
                <Link 
                  to="/inicio"
                  className="px-4 py-2 text-gray-600 hover:text-green-600 transition"
                >
                  Dashboard
                </Link>
                <Link 
  to="/history" 
  className="px-4 py-2 text-gray-600 hover:text-green-600 transition"
>
  Historial
</Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-600 hover:text-green-600 transition"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;