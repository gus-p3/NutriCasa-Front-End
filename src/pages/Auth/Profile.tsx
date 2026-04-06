import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi } from '../../api/users.api';
import ConfirmModal from '../../components/UI/ConfirmModal';
import { 
  User as UserIcon, Mail, Shield, ShieldCheck, ShieldAlert, 
  Key, Loader2, CheckCircle2, Activity, Settings, Save, AlertCircle
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, toggle2FA } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'password'>('info');

  // Loading States
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Message State
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Formularios State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.profile?.age || '',
    weight: user?.profile?.weight || '',
    height: user?.profile?.height || '',
    activityLevel: user?.profile?.activityLevel || 'medium',
    goal: user?.profile?.goal || 'maintain',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validaciones en tiempo real de password
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
    } else if (passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
    } else {
      setPasswordError('');
    }
  }, [passwordData]);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    onConfirm: () => {}
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // Handlers - 2FA
  const handleToggle2FA = () => {
    const isEnabled = !user?.twoFactorEnabled;
    
    if (!isEnabled) {
      // Pedir confirmación para desactivar
      setModalConfig({
        isOpen: true,
        title: 'Desactivar Autenticación de Dos Factores',
        message: '¿Estás seguro de que deseas desactivar la autenticación de dos factores? Tu cuenta será menos segura ante ataques maliciosos.',
        isDestructive: true,
        onConfirm: async () => {
          closeModal();
          await executeToggle2FA(false);
        }
      });
    } else {
      executeToggle2FA(true);
    }
  };

  const executeToggle2FA = async (enable: boolean) => {
    setLoading(true);
    setMessage(null);
    try {
      await toggle2FA(enable);
      setMessage({
        type: 'success',
        text: enable ? 'Autenticación de dos factores activada con éxito.' : 'Autenticación de dos factores desactivada.'
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al cambiar la configuración de seguridad.' });
    } finally {
      setLoading(false);
    }
  };

  // Handlers - Profile Form
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.email !== user?.email) {
      setModalConfig({
        isOpen: true,
        title: 'Cambiar Correo Electrónico',
        message: 'Estás a punto de cambiar tu correo electrónico. Asegúrate de tener acceso a él para futuros inicios de sesión.',
        isDestructive: false,
        onConfirm: async () => {
          closeModal();
          await executeProfileUpdate();
        }
      });
    } else {
      await executeProfileUpdate();
    }
  };

  const executeProfileUpdate = async () => {
    setSaveLoading(true);
    setMessage(null);
    try {
      await usersApi.updateProfile({
        name: profileData.name,
        email: profileData.email,
        profile: {
          age: Number(profileData.age),
          weight: Number(profileData.weight),
          height: Number(profileData.height),
          activityLevel: profileData.activityLevel as any,
          goal: profileData.goal as any,
        }
      });
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente. Calorías recalculadas.' });
      // Reload is simplified: state is localized via context/app logic or a simple refresh
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil.' });
    } finally {
      setSaveLoading(false);
    }
  };

  // Handlers - Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordError) return;
    setSaveLoading(true);
    setMessage(null);
    try {
      await usersApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar la contraseña.' });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <Settings className="text-green-600" /> Mi Cuenta
      </h1>

      <div className="grid gap-8 md:grid-cols-4">
        
        {/* Sidebar Info & Navigation */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4 border-4 border-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm truncate" title={user?.email}>{user?.email}</p>
            <div className="mt-4 flex justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => { setActiveTab('info'); setMessage(null); }}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
            >
              <UserIcon size={18} /> Información Personal
            </button>
            <button 
              onClick={() => { setActiveTab('security'); setMessage(null); }}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${activeTab === 'security' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
            >
              <Shield size={18} /> Seguridad (2FA)
            </button>
            <button 
              onClick={() => { setActiveTab('password'); setMessage(null); }}
              className={`text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${activeTab === 'password' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
            >
              <Key size={18} /> Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* TAB: Información Personal */}
          {activeTab === 'info' && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <UserIcon className="text-green-600" /> Información Personal
              </h3>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" name="name" required value={profileData.name} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" name="email" required value={profileData.email} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-gray-50">
                  <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-green-600"/> Datos Biométricos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años)</label>
                      <input type="number" name="age" min="1" value={profileData.age} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                      <input type="number" name="weight" min="1" step="0.1" value={profileData.weight} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                      <input type="number" name="height" min="1" step="0.1" value={profileData.height} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Actividad</label>
                    <select name="activityLevel" value={profileData.activityLevel} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white">
                      <option value="low">Sedentario / Baja</option>
                      <option value="medium">Ligera o Activa</option>
                      <option value="high">Altamente Activa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Nutricional</label>
                    <select name="goal" value={profileData.goal} onChange={handleProfileChange} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white">
                      <option value="lose">Perder Peso</option>
                      <option value="maintain">Mantener Peso</option>
                      <option value="gain">Ganar Masa Muscular</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={saveLoading} className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-70">
                    {saveLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB: Seguridad (2FA) */}
          {activeTab === 'security' && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16 rounded-full opacity-10 ${user?.twoFactorEnabled ? 'bg-green-600' : 'bg-orange-600'}`}></div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Shield className="text-green-600" /> Verificación en Dos Pasos (2FA)
              </h3>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-full ${user?.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {user?.twoFactorEnabled ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                       Estado de Seguridad
                       <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${user?.twoFactorEnabled ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
                         {user?.twoFactorEnabled ? 'Activado' : 'Desactivado'}
                       </span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 max-w-md">
                      Añade una capa extra de seguridad a tu cuenta. Al iniciar sesión, siempre te solicitaremos un código de confirmación enviado a tu correo electrónico.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 w-full md:w-auto">
                  <button
                    onClick={handleToggle2FA}
                    disabled={loading}
                    className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all ${user?.twoFactorEnabled ? 'bg-red-500 hover:bg-red-600 shadow-red-200 shadow-lg' : 'bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg'}`}
                  >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    {user?.twoFactorEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* TAB: Cambiar Contraseña */}
          {activeTab === 'password' && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Key className="text-green-600" /> Restablecer Contraseña
              </h3>

              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual *</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña *</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                    className={`w-full p-3 border rounded-xl focus:ring-2 outline-none transition ${passwordError && passwordData.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'}`} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña *</label>
                  <input 
                    type="password" 
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                    className={`w-full p-3 border rounded-xl focus:ring-2 outline-none transition ${passwordError && passwordData.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'}`} 
                  />
                </div>

                {passwordError && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {passwordError}
                  </p>
                )}

                <div className="pt-4">
                  <button type="submit" disabled={saveLoading || !!passwordError} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50">
                    {saveLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </section>
          )}

        </div>
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        isDestructive={modalConfig.isDestructive}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default Profile;
