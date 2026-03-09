// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Componente para rutas protegidas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

// Componente para redirigir si ya está autenticado
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
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
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