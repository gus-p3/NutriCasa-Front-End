// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Register from './pages/Register';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

import Recipes from './pages/recipes/Recipes';
import RecipeDetail from './pages/recipes/RecipeDetail';
import RecipeCook from './pages/recipes/RecipeCook';
import History from './pages/profile/History';
import Inventory from './pages/Inventory/Inventory';

function App() {

  // 🔐 (DESACTIVADO TEMPORALMENTE)
  const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
  };

  // 🌐 Rutas públicas
  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated() ? <>{children}</> : <Navigate to="/inicio" />;
  };

  const AppContent: React.FC = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>

            {/* 🟢 RUTA FORZADA PARA PROBAR HISTORY */}
            <Route path="/history" element={<History />} />

            {/* Públicas */}
            <Route path="/" element={<Home />} />

            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />

            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Privadas (pero sin protección por ahora) */}
            <Route path="/inicio" element={<Inicio />} />

            <Route path="/recipes" element={<Recipes />} />

            <Route path="/recipes/:id" element={<RecipeDetail />} />

            <Route path="/recipes/:id/cook" element={<RecipeCook />} />

            <Route path="/inventory" element={<Inventory />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </main>

        <Footer />
      </div>
    );
  };

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;