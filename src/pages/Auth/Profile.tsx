import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, ShieldCheck, ShieldAlert, Key, Loader2, CheckCircle2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, toggle2FA } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleToggle2FA = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const isEnabled = !user?.twoFactorEnabled;
      await toggle2FA(isEnabled);
      setMessage({
        type: 'success',
        text: isEnabled ? 'Autenticación de dos factores activada con éxito.' : 'Autenticación de dos factores desactivada.'
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al cambiar la configuración de seguridad.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <User className="text-green-600" /> Mi Perfil
      </h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Sidebar info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4 border-4 border-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="mt-4 flex justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>

          <div className="bg-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200">
            <h3 className="font-bold mb-2">Consejo Nutricional</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Mantener tu perfil actualizado nos ayuda a proporcionarte mejores recomendaciones de recetas y ajustar tu presupuesto semanal.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Información General */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Mail size={20} className="text-green-600" /> Datos de la Cuenta
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Nombre Completo</span>
                <span className="font-medium text-gray-800">{user?.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Correo Electrónico</span>
                <span className="font-medium text-gray-800">{user?.email}</span>
              </div>
            </div>
          </section>

          {/* Seguridad (2FA) */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12 rounded-full opacity-10 ${user?.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-400'}`}></div>

            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-green-600" /> Seguridad (2FA)
            </h3>

            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${user?.twoFactorEnabled ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {user?.twoFactorEnabled ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">
                  Autenticación de dos factores (MFA)
                </h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Añade una capa extra de seguridad a tu cuenta. Al iniciar sesión, te enviaremos un código de verificación a tu correo electrónico.
                </p>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-sm font-bold text-gray-700 block">
                  Estado: {user?.twoFactorEnabled ? 'Activado' : 'Desactivado'}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.twoFactorEnabled ? 'Tu cuenta está protegida con seguridad adicional.' : 'Te recomendamos activar esta opción.'}
                </span>
              </div>
              <button
                onClick={handleToggle2FA}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${user?.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <span className="sr-only">Cambiar 2FA</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user?.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
                {loading && (
                  <Loader2 className="absolute -right-8 h-5 w-5 animate-spin text-green-600" />
                )}
              </button>
            </div>
          </section>

          {/* Opciones Adicionales */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
              <Key size={16} /> Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
