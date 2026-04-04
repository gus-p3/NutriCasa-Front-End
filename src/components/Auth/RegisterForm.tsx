// src/components/Auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { RegisterData } from '../../types';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyEmail, resendCode } = useAuth();
  
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    
    // Validación en tiempo real
    const newErrors = { ...validationErrors };
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        newErrors.email = 'Email no válido';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'password') {
      if (value && value.length < 6) {
        newErrors.password = 'Mínimo 6 caracteres';
      } else {
        delete newErrors.password;
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      const pass = name === 'password' ? value : formData.password;
      const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (confirm && pass !== confirm) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setValidationErrors(newErrors);
  };

  const validateForm = (): boolean => {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un email válido');
      return false;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Registro exitoso, procediendo a verificación:', response);
      setIsVerifying(true);
      setSuccessMsg('¡Código enviado! Revisa tu bandeja de entrada.');
    } catch (err: any) {
      console.error('Error registro:', err);
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };


  const handleVerify = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('El código debe ser de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(formData.email, verificationCode);
      console.log('Correo verificado exitosamente');
      navigate('/inicio');
    } catch (err: any) {
      console.error('Error verificación:', err);
      setError(err.message || 'Código incorrecto o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    setResendLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await resendCode(formData.email);
      setSuccessMsg('Nuevo código enviado correctamente');
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-green-600 mb-2">NutriCasa</h1>
          </Link>
          <p className="text-gray-600">Comienza tu viaje hacia una vida más saludable</p>
        </div>

        {/* Tarjeta de registro / verificación */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isVerifying ? 'Verifica tu cuenta' : 'Crear cuenta'}
          </h2>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-green-600">{successMsg}</p>
            </div>
          )}

          {isVerifying ? (
            /* Formulario de Verificación */
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <p className="text-gray-600 text-sm mb-4">
                  Hemos enviado un código de 6 dígitos a <strong>{formData.email}</strong>. Por favor, ingrésalo a continuación.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="123456"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-[0.5em] font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  'Verificar cuenta'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-sm text-green-600 font-semibold hover:underline disabled:opacity-50"
                >
                  {resendLoading ? 'Reenviando...' : 'Reenviar código'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                  Volver al registro
                </button>
              </div>
            </form>
          ) : (
            /* Formulario de Registro Original */
            <>
              {/* Beneficios */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg space-y-2">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  Planes personalizados según tus objetivos
                </p>
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  Cálculo automático de calorías y macros
                </p>
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  Adaptado a tu presupuesto y preferencias
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Juan Pérez"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                      className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.email 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                  {validationErrors.email && <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.password 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {validationErrors.password ? (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>}
                </div>

                {/* Botón de registro */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </form>

              {/* Enlace a login */}
              <p className="text-center mt-6 text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;