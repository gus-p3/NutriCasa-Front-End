// src/components/Layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, LogOut, Package, BookOpen, LayoutDashboard, Menu, X, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navLinks = [
    { to: '/inicio',    label: 'Dashboard',  icon: <LayoutDashboard size={17} /> },
    { to: '/recipes',   label: 'Recetas',    icon: <BookOpen size={17} /> },
    { to: '/inventory', label: 'Mi Alacena', icon: <Package size={17} /> },
    { to: '/history',   label: 'Historial',  icon: <HistoryIcon size={17} /> },
  ];

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(to + '/');

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <UtensilsCrossed className="text-green-600" size={26} />
            <span className="text-xl font-bold text-green-600">NutriCasa</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated() && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated() ? (
              <>
                <span className="text-gray-600 hidden md:block">
                  Hola, {user?.name}
                </span>

                {/* User badge */}
                <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
                  <div className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  <LogOut size={17} />
                  <span className="hidden md:inline">Salir</span>
                </button>

                {/* Mobile ham */}
                <button
                  className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
                  onClick={() => setMobileOpen(v => !v)}
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-green-600 transition font-medium">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="bg-green-600 text-white px-4 py-2 text-sm rounded-xl hover:bg-green-700 transition font-semibold">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {isAuthenticated() && mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;