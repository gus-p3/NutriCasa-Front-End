// src/pages/Home.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, Target, Activity, X, CheckCircle, Plus, 
  TrendingUp, Flame, Droplets, UtensilsCrossed, 
  Beef, Wheat, Calendar, DollarSign,
  Zap, Award, ArrowRight, Settings, Sparkles,
  Sun, Moon, Sunrise, Clock
} from 'lucide-react';
import { getSuggestedRecipes } from "../../services/recipes";
import { getDashboard } from "../../services/dashboard";
import { setupProfile, getProfile, updateProfile } from "../../services/auth";

interface SetupData {
  age: string;
  weight: string;
  height: string;
  activityLevel: 'low' | 'medium' | 'high';
  goal: 'lose' | 'maintain' | 'gain';
  dietType: 'normal' | 'vegetarian' | 'vegan' | 'custom';
  allergies: string[];
  initialIngredients: string[];
  weeklyBudget: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [setupData, setSetupData] = useState<SetupData>({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'medium',
    goal: 'maintain',
    dietType: 'normal',
    allergies: [],
    initialIngredients: [],
    weeklyBudget: ''
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [error, setError] = useState('');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);

  const progress = (currentStep / 5) * 100;
  const effectRan = useRef(false);
useEffect(() => {


  if (effectRan.current) return;
  effectRan.current = true;

  const init = async () => {
    try {

      // 1️⃣ Obtener perfil del usuario
      const profileData = await getProfile();

      if (profileData?.user?.profile?.age) {

        const p = profileData.user.profile;

        setSetupData({
          age: p.age?.toString() || "",
          weight: p.weight?.toString() || "",
          height: p.height?.toString() || "",
          activityLevel: p.activityLevel || "medium",
          goal: p.goal || "maintain",
          dietType: p.dietType || "normal",
          allergies: p.allergies || [],
          initialIngredients: [],
          weeklyBudget: profileData.user.weeklyBudget?.toString() || ""
        });

        // si ya tiene perfil NO mostrar configuración
        setShowSetupModal(false);

      } else {

        // si no tiene perfil mostrar configuración inicial
        setShowSetupModal(true);

      }

      // 2️⃣ Cargar dashboard
      const dashboardData = await getDashboard();
      setDashboard(dashboardData);

      // 3️⃣ Cargar recetas sugeridas
      await loadSuggestedRecipes();

    } catch (err) {

      console.error("Error cargando datos", err);
      setShowSetupModal(true);

    } finally {
      setIsLoadingProfile(false);
    }
  };

  init(); // 👈 MUY IMPORTANTE

}, []);

 // Círculo de calorías mejorado
const CalorieCircle = ({ consumed, goal }: { consumed: number; goal: number }) => {

  const safeConsumed = Number(consumed) || 0;
  const safeGoal = Number(goal) || 1;

  const percentage =
    safeGoal > 0
      ? Math.min((safeConsumed / safeGoal) * 100, 100)
      : 0;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

    // Determinar color basado en el porcentaje
    const getColor = () => {
      if (percentage < 30) return '#22c55e'; // Verde
      if (percentage < 70) return '#eab308'; // Amarillo
      if (percentage <= 100) return '#ef4444'; // Rojo
      return '#f97316'; // Naranja 
    };

    const color = getColor();

    return (
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Círculo de fondo */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Círculo de progreso */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-gray-800">{consumed}</span>
          <span className="text-sm text-gray-500">de {goal} kcal</span>
          <span className="text-xs font-medium mt-1 px-2 py-1 rounded-full" 
                style={{ backgroundColor: color + '20', color: color }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  const validateStep = () => {
    switch(currentStep) {
      case 1:
        if (!setupData.age || !setupData.weight || !setupData.height) { 
          setError('Completa todos los campos'); 
          return false; 
        }
        break;
      case 2:
        if (!setupData.activityLevel) { 
          setError('Selecciona tu nivel de actividad'); 
          return false; 
        }
        break;
      case 3:
        if (!setupData.goal) { 
          setError('Selecciona tu objetivo'); 
          return false; 
        }
        break;
      case 5:
        if (!setupData.weeklyBudget) { 
          setError('Ingresa tu presupuesto semanal'); 
          return false; 
        }
        break;
    }
    setError('');
    return true;
  };
const handleNextStep = async () => {

  if (isSaving) return;

  if (!validateStep()) return;

  if (currentStep < 5) {
    setCurrentStep(currentStep + 1);
    return;
  }

  try {

    setIsSaving(true);

    // 👇 GUARDAR PERFIL
    if (showSetupModal) {

      await setupProfile({
        age: Number(setupData.age),
        weight: Number(setupData.weight),
        height: Number(setupData.height),
        activityLevel: setupData.activityLevel,
        goal: setupData.goal,
        dietType: setupData.dietType,
        allergies: setupData.allergies,
        weeklyBudget: Number(setupData.weeklyBudget)
      });

    } else {

      await updateProfile({
        weeklyBudget: Number(setupData.weeklyBudget),
        profile: {
          age: Number(setupData.age),
          weight: Number(setupData.weight),
          height: Number(setupData.height),
          activityLevel: setupData.activityLevel,
          goal: setupData.goal,
          dietType: setupData.dietType,
          allergies: setupData.allergies
        }
      });

    }

    // 👇 cerrar configuración
    setShowSetupModal(false);
    setCurrentStep(1);

    // 👇 recargar datos
    const dashboardData = await getDashboard();
    setDashboard(dashboardData);

    await loadSuggestedRecipes();

  } catch (error) {

    console.error("Error guardando perfil", error);
    setError("No se pudo guardar tu configuración");

  } finally {

    setIsSaving(false);

  }
};


  const handlePrevStep = () => {
    if (currentStep > 1) { 
      setCurrentStep(currentStep - 1); 
      setError(''); 
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !setupData.allergies.includes(newAllergy.trim())) {
      setSetupData({...setupData, allergies: [...setupData.allergies, newAllergy.trim()]});
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setSetupData({...setupData, allergies: setupData.allergies.filter(a => a !== allergy)});
  };

  const getActivityIcon = (level: string) => {
    switch(level) {
      case 'low': return <Sunrise className="w-4 h-4" />;
      case 'medium': return <Sun className="w-4 h-4" />;
      case 'high': return <Moon className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getGoalIcon = (goal: string) => {
    switch(goal) {
      case 'lose': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'maintain': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'gain': return <Zap className="w-4 h-4 text-green-500" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">1</span>
              Datos básicos
            </h3>
            <div className="space-y-3">
              <input 
                type="number" 
                placeholder="Edad" 
                value={setupData.age} 
                onChange={e => setSetupData({...setupData, age: e.target.value})} 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
              />
              <input 
                type="number" 
                placeholder="Peso (kg)" 
                value={setupData.weight} 
                onChange={e => setSetupData({...setupData, weight: e.target.value})} 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
              />
              <input 
                type="number" 
                placeholder="Altura (cm)" 
                value={setupData.height} 
                onChange={e => setSetupData({...setupData, height: e.target.value})} 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">2</span>
              Nivel de actividad
            </h3>
            <div className="space-y-2">
              {[
                { value: 'low', label: 'Bajo', icon: '😴', desc: 'Poco o ningún ejercicio' },
                { value: 'medium', label: 'Medio', icon: '🚶', desc: 'Ejercicio 3-4 veces/semana' },
                { value: 'high', label: 'Alto', icon: '🏃', desc: 'Ejercicio intenso diario' }
              ].map(level => (
                <label key={level.value} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${setupData.activityLevel === level.value ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}>
                  <input 
                    type="radio" 
                    value={level.value} 
                    checked={setupData.activityLevel === level.value} 
                    onChange={e => setSetupData({...setupData, activityLevel: e.target.value as 'low'|'medium'|'high'})}
                    className="hidden"
                  />
                  <span className="text-2xl mr-3">{level.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium block">{level.label}</span>
                    <span className="text-sm text-gray-500">{level.desc}</span>
                  </div>
                  {setupData.activityLevel === level.value && <CheckCircle className="text-green-500 w-5 h-5" />}
                </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">3</span>
              Objetivo
            </h3>
            <div className="space-y-2">
              {[
                { value: 'lose', label: 'Perder peso', icon: '📉', color: 'red' },
                { value: 'maintain', label: 'Mantener peso', icon: '⚖️', color: 'yellow' },
                { value: 'gain', label: 'Ganar masa', icon: '📈', color: 'green' }
              ].map(goal => (
                <label key={goal.value} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition ${setupData.goal === goal.value ? `border-${goal.color}-500 bg-${goal.color}-50` : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    value={goal.value} 
                    checked={setupData.goal === goal.value} 
                    onChange={e => setSetupData({...setupData, goal: e.target.value as 'lose'|'maintain'|'gain'})}
                    className="hidden"
                  />
                  <span className="text-2xl mr-3">{goal.icon}</span>
                  <span className="flex-1 font-medium">{goal.label}</span>
                  {setupData.goal === goal.value && <CheckCircle className={`text-${goal.color}-500 w-5 h-5`} />}
                </label>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">4</span>
              Preferencias
            </h3>
            <select 
              value={setupData.dietType} 
              onChange={e => setSetupData({...setupData, dietType: e.target.value as any})} 
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
            >
              <option value="normal">🍽️ Normal</option>
              <option value="vegetarian">🥬 Vegetariana</option>
              <option value="vegan">🌱 Vegana</option>
              <option value="custom">✨ Personalizada</option>
            </select>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alergias</label>
              <div className="flex gap-2">
                <input 
                  value={newAllergy} 
                  onChange={e => setNewAllergy(e.target.value)} 
                  placeholder="Ej: gluten, lactosa..." 
                  className="flex-1 border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                />
                <button 
                  onClick={addAllergy} 
                  className="bg-green-600 text-white px-4 rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {setupData.allergies.map(a => (
                  <span key={a} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {a}
                    <X size={14} className="cursor-pointer hover:text-red-900" onClick={() => removeAllergy(a)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">5</span>
              Presupuesto semanal
            </h3>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={setupData.weeklyBudget} 
                onChange={e => setSetupData({...setupData, weeklyBudget: e.target.value})} 
                className="w-full border-2 border-gray-200 p-3 pl-10 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              💡 Este presupuesto nos ayudará a sugerirte recetas que se ajusten a tu bolsillo
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

 const loadSuggestedRecipes = async () => {
  try {

   const data = await getSuggestedRecipes();
    setRecipes(data);

  } catch (err) {
    console.error('Error cargando recetas sugeridas', err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      
      {/* Modal Setup Mejorado */}
      {showSetupModal && !isLoadingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh] relative animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-t-3xl"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">¡Bienvenido! 👋</h2>
                <p className="text-gray-600 mt-1">Configura tu perfil para comenzar</p>
              </div>
              <button 
                onClick={() => setShowSetupModal(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra de progreso mejorada */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Paso {currentStep} de 5</span>
                <span className="text-sm font-medium text-green-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Contenido paso */}
            {renderStep()}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <X size={16} />
                {error}
              </div>
            )}

            {/* Navegación mejorada */}
            <div className="flex justify-between mt-8">
              <button 
                onClick={handlePrevStep} 
                disabled={currentStep === 1} 
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition font-medium"
              >
                Anterior
              </button>
              <button 
                onClick={handleNextStep} 
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition font-medium shadow-lg shadow-green-200"
              >
                {currentStep === 5 ? '✨ Finalizar' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero section mejorado */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4 mb-8">
          {!showSetupModal && (
            <button
              onClick={() => { setShowSetupModal(true); setCurrentStep(1); }}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition text-gray-600 hover:text-green-600"
            >
              <Settings size={20} />
              <span>Editar perfil</span>
            </button>
          )}
        </div>

        {/* Hero Card mejorada */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl font-bold">Tu viaje saludable comienza aquí</h2>
            </div>
            <p className="text-xl mb-6 opacity-90">Descubre recetas personalizadas y alcanza tus objetivos con nuestra ayuda</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => { navigate('/recipes'); loadSuggestedRecipes(); }} 
                className="group bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-lg flex items-center gap-2"
              >
                Explorar recetas
                <ArrowRight className="group-hover:translate-x-1 transition" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* DASHBOARD MEJORADO CON CÍRCULO DE CALORÍAS */}
        {dashboard && (
          <>
            {/* Sección de calorías destacada */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Flame className="text-orange-500" />
                Resumen del día
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Círculo de calorías */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Flame className="text-orange-500 w-4 h-4" />
                    </div>
                    Progreso de calorías
                  </h3>
                  <div className="flex justify-center">
                    <CalorieCircle 
                      consumed={dashboard.today.caloriesConsumed} 
                      goal={dashboard.today.caloriesGoal} 
                    />

                  </div>
                </div>

                {/* Macros en cards */}
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Activity className="text-blue-500 w-4 h-4" />
                    </div>
                    Macros del día
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <Beef className="text-red-500 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600">Proteínas</span>
                          <span className="text-sm font-bold text-gray-800">{dashboard.today.macros.goal.protein}g</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: `${Math.min(100, (dashboard.today.macros.consumed.protein / dashboard.today.macros.goal.protein) * 100)}%`}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Wheat className="text-yellow-500 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600">Carbohidratos</span>
                          <span className="text-sm font-bold text-gray-800">{dashboard.today.macros.goal.carbs}g</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${Math.min(100, (dashboard.today.macros.consumed.carbs / dashboard.today.macros.goal.carbs) * 100)}%`}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Droplets className="text-green-500 w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600">Grasas</span>
                          <span className="text-sm font-bold text-gray-800">{dashboard.today.macros.goal.fat}g</span>

                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: `${Math.min(100, (dashboard.today.macros.consumed.fat / dashboard.today.macros.goal.fat) * 100)}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segunda fila de dashboard */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Presupuesto */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign size={20} />
                    Presupuesto restante
                  </h3>
                  <span className="text-3xl font-bold">${dashboard.budget?.remaining ?? 0}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm opacity-90">
                    <span>Presupuesto semanal</span>
                    <span>${dashboard.budget?.weeklyLimit || setupData.weeklyBudget}</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 h-2 rounded-full">
                    <div 
                      className="bg-white h-2 rounded-full" 
                      style={{width: `${dashboard.budget?.spentPct ?? 0}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Progreso semanal */}
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Calendar className="text-purple-500" />
                  Progreso semanal
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => {
                    // Mapear el día de la semana (Lunes=1, ..., Domingo=0)
                    // El backend devuelve daysLogged y days[]
                    // Intentamos encontrar el registro para este día específico
                    const dayData = dashboard.week.days.find((d: any) => {
                      const date = new Date(d.date);
                      let dayNum = date.getDay();
                      if (dayNum === 0) dayNum = 7; // Domingo -> 7
                      return dayNum === (i + 1);
                    });

                    return (
                      <div key={i} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{day}</div>
                        <div 
                          className={`h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium
                            ${dayData?.goalMet 
                              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-md' 
                              : 'bg-gray-200 text-gray-500'}`}
                        >
                          {i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resumen de perfil mejorado */}
        {!showSetupModal && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ChefHat className="text-green-600 w-4 h-4" />
              </div>
              Tu perfil nutricional
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Edad</span>
                <p className="font-semibold text-gray-800">{setupData.age} años</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Peso/Altura</span>
                <p className="font-semibold text-gray-800">{setupData.weight}kg / {setupData.height}cm</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Actividad</span>
                <p className="font-semibold text-gray-800 capitalize flex items-center gap-1">
                  {getActivityIcon(setupData.activityLevel)}
                  {setupData.activityLevel}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-xs text-gray-500">Objetivo</span>
                <p className="font-semibold text-gray-800 capitalize flex items-center gap-1">
                  {getGoalIcon(setupData.goal)}
                  {setupData.goal}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Dieta:</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {setupData.dietType}
                </span>
              </div>
              
              {setupData.allergies.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Alergias:</span>
                  <div className="flex gap-1">
                    {setupData.allergies.map(a => (
                      <span key={a} className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recetas sugeridas mejoradas */}
        {recipes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              Recetas sugeridas para ti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recipes.map((r) => (
                <div 
                  key={r._id} 
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                  onClick={() => navigate(`/recipes/${r._id}`)}
                >
                  {r.imageUrl || r.image ? (
                    <img src={getFullImageUrl(r.imageUrl || r.image)} alt={r.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <UtensilsCrossed className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{r.description}</p>
                    
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Flame size={14} className="text-orange-500" />
                        {r.calories} kcal
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-blue-500" />
                        {r.time} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;