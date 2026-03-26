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
import History from './pages/History/History';
import AiDashboard from './pages/AiDashboard';
import Inventory from './pages/Inventory/Inventory';

// 🔐 Rutas privadas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
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

          {/* Privadas */}
          <Route path="/inicio" element={
            <PrivateRoute>
              <Inicio />
            </PrivateRoute>
          } />

          <Route path="/recipes" element={
            <PrivateRoute>
              <Recipes />
            </PrivateRoute>
          } />

          <Route path="/recipes/:id" element={
            <PrivateRoute>
              <RecipeDetail />
            </PrivateRoute>
          } />

          <Route path="/recipes/:id/cook" element={
            <PrivateRoute>
              <RecipeCook />
            </PrivateRoute>
          } />

          <Route path="/ai-dashboard" element={
            <PrivateRoute>
              <AiDashboard />
            </PrivateRoute>
          } />

          <Route path="/inventory" element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          } />

          <Route path="/history" element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } />

          {/* Ruta por defecto si no encuentra la página */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>

      <Footer />
    </div>
  );
};

// 🚀 App principal
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;