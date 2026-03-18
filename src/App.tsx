// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

import Recipes from './pages/recipes/Recipes';
import RecipeDetail from './pages/recipes/RecipeDetail';
import RecipeCook from './pages/recipes/RecipeCook';
import History from './pages/profile/History';

function App() {

  // Rutas protegidas
  const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
  };

  // Rutas públicas
  const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" />;
  };

  const AppContent: React.FC = () => {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>

            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Rutas privadas */}

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600 mt-4">
                      ¡Bienvenido a tu espacio personal!
                    </p>
                  </div>
                </PrivateRoute>
              }
            />

            <Route
              path="/setup"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Configura tu perfil</h1>
                    <p className="text-gray-600 mt-4">
                      Aquí irá el asistente de configuración de 6 pasos
                    </p>
                  </div>
                </PrivateRoute>
              }
            />

            {/* Rutas de recetas */}

            <Route
              path="/recipes"
              element={
                <PrivateRoute>
                  <Recipes />
                </PrivateRoute>
              }
            />

            <Route
  path="/history"
  element={
    <PrivateRoute>
      <History />
    </PrivateRoute>
  }
/>

            <Route
              path="/recipes/:id"
              element={
                <PrivateRoute>
                  <RecipeDetail />
                </PrivateRoute>
              }
            />

            <Route
              path="/recipes/:id/cook"
              element={
                <PrivateRoute>
                  <RecipeCook />
                </PrivateRoute>
              }
            />

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