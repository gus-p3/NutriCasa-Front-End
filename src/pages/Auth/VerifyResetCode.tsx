// src/pages/Auth/VerifyResetCode.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VerifyResetCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { forgotPassword } = useAuth();

  // El email viene del state de ForgotPassword
  const email: string = (location.state as any)?.email || '';

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Si no hay email, redirigir a forgot-password
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Countdown para reenvío
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    // Solo dígitos
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];

    // Pegar múltiples dígitos
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newDigits[index + i] = pasted[i];
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Por favor ingresa los 6 dígitos del código');
      return;
    }
    // Pasar a la pantalla de nueva contraseña
    navigate('/reset-password', { state: { email, code } });
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setResendMsg('');
    setError('');
    try {
      await forgotPassword(email);
      setResendMsg('Código reenviado. Revisa tu correo.');
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('No se pudo reenviar el código. Intenta de nuevo.');
    } finally {
      setResending(false);
    }
  };

  const code = digits.join('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl font-bold text-green-600">
            NutriCasa
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-green-600 flex items-center gap-1">
              <ArrowLeft size={16} /> Cambiar correo
            </Link>
          </div>

          {/* Ícono */}
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
              <ShieldCheck className="text-green-600" size={30} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Ingresa tu código</h2>
          <p className="text-gray-500 text-sm mb-1 text-center">
            Enviamos un código de 6 dígitos a:
          </p>
          <p className="text-green-700 font-semibold text-sm mb-6 text-center">{email}</p>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {resendMsg && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-sm text-green-700">{resendMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inputs OTP */}
            <div className="flex justify-center gap-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                    ${digit
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-800'
                    }
                    focus:border-green-600 focus:ring-2 focus:ring-green-200`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <p className="text-center text-xs text-gray-400">
              El código expira en 15 minutos
            </p>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando...</span>
                </>
              ) : (
                'Continuar'
              )}
            </button>
          </form>

          {/* Reenviar código */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">¿No recibiste el código?</p>
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="mt-1 text-sm font-semibold text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
            >
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar código'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
