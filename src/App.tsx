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
import Inventory from './pages/Inventory/Inventory';


function App() {
// Componente para rutas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

// Componente para redirigir si ya está autenticado
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Redirige a /inicio cuando ya está autenticado
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/inicio" />;
};

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Ruta pública principal */}
          <Route path="/" element={<Home />} />

          {/* Login / Register */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Pantalla de inicio luego de autenticarse */}
          <Route path="/inicio" element={
            <PrivateRoute>
              <Inicio />
            </PrivateRoute>
          } />

          {/* Rutas privadas adicionales */}
          <Route path="/setup" element={
            <PrivateRoute>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">Configura tu perfil</h1>
                <p className="text-gray-600 mt-4">
                  Aquí irá el asistente de configuración de 6 pasos
                </p>
              </div>
            </PrivateRoute>
          } />

          <Route path="/recipes" element={
            <PrivateRoute><Recipes /></PrivateRoute>
          } />
          <Route path="/recipes/:id" element={
            <PrivateRoute><RecipeDetail /></PrivateRoute>
          } />
          <Route path="/recipes/:id/cook" element={
            <PrivateRoute><RecipeCook /></PrivateRoute>
          } />

          {/* Ruta por defecto si no encuentra la página */}
          <Route path="*" element={<Navigate to="/" />} />
          {/* Nuevas rutas de recetas */}
          <Route 
            path="/recipes" 
            element={
              <PrivateRoute>
                <Recipes />
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
                    <Route 
            path="/inventory" 
            element={
              <PrivateRoute>
                <Inventory />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

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
