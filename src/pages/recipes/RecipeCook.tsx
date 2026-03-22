// src/pages/RecipeCook.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Play, Pause, RotateCcw, Save } from 'lucide-react';
import api from '../../api/api';

// Definir tipos correctamente
interface Step {
  stepNumber: number;
  description: string;
  timerSeconds?: number;
  detailedNote?: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
  leftover?: boolean;
}

interface RecipeCook {
  _id: string;
  title: string;
  steps: Step[];
  ingredients?: Ingredient[];
}

interface Feedback {
  recipeId: string;
  rating: number;
  mealTime: 'desayuno' | 'comida' | 'cena' | 'snack';
  ingredients: {
    name: string;
    quantity: string;
    leftover: boolean;
  }[];
  personalNote: string;
  completedAt: string;
}

const RecipeCook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeCook | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Estados para el feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [mealTime, setMealTime] = useState<'desayuno' | 'comida' | 'cena' | 'snack'>('comida');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ratingEmojis = ['😞', '😐', '😊', '😄', '🤩'];
  const ratingLabels = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        const recipeData = response.data.data;
        setRecipe(recipeData);
        
        // Inicializar ingredientes desde la receta
        if (recipeData.ingredients && recipeData.ingredients.length > 0) {
          setIngredients(recipeData.ingredients.map((ing: Ingredient) => ({
            name: ing.name || '',
            quantity: ing.quantity || '',
            unit: ing.unit || '',
            leftover: false
          })));
        } else {
          // Si no hay ingredientes, crear un array vacío
          setIngredients([]);
        }
      } catch (error) {
        console.error('Error al cargar receta:', error);
        setErrorMessage('Error al cargar la receta. Por favor intenta de nuevo.');
      }
    };
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    let interval: number | undefined;
    if (timerActive && timerSecondsLeft > 0) {
      interval = window.setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerActive) {
      setTimerActive(false);
      // Opcional: reproducir sonido o alerta
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [timerActive, timerSecondsLeft]);

  const startTimer = (seconds: number) => {
    setTimerSecondsLeft(seconds);
    setTimerActive(true);
  };

  const pauseTimer = () => setTimerActive(false);
  
  const resetTimer = () => {
    setTimerActive(false);
    if (step?.timerSeconds) {
      setTimerSecondsLeft(step.timerSeconds);
    } else {
      setTimerSecondsLeft(0);
    }
  };

  const markStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const nextStep = () => {
    if (recipe && currentStep < recipe.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setTimerActive(false);
      setTimerSecondsLeft(0);
    } else if (recipe && currentStep === recipe.steps.length - 1) {
      setShowFeedback(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimerActive(false);
      setTimerSecondsLeft(0);
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | boolean) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setIngredients(updatedIngredients);
  };

  const handleSubmitFeedback = async () => {
    setErrorMessage(null);
    
    if (rating === 0) {
      setErrorMessage('Por favor califica la receta');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Preparar los datos para enviar
      const feedbackData = {
        recipeId: id,
        rating: rating,
        mealTime: mealTime,
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          leftover: ing.leftover || false
        })),
        personalNote: personalNote.trim() || '',
        completedAt: new Date().toISOString()
      };

      console.log('Enviando feedback:', feedbackData); // Para depuración

      // Intentar con la ruta correcta
      const response = await api.post('/feedback', feedbackData);
      
      console.log('Respuesta del servidor:', response.data); // Para depuración
      
      setSubmitSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/recipes');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error detallado:', error);
      
      // Mostrar mensaje de error más específico
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('Respuesta del servidor:', error.response.data);
        console.error('Código de estado:', error.response.status);
        setErrorMessage(`Error ${error.response.status}: ${error.response.data.message || 'Error al guardar el feedback'}`);
      } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        console.error('No se recibió respuesta:', error.request);
        setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        // Error al configurar la petición
        console.error('Error:', error.message);
        setErrorMessage('Error al enviar el feedback. Por favor intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const step = recipe.steps[currentStep];
  const hasTimer = step?.timerSeconds && step.timerSeconds > 0;
  const isCompleted = completedSteps.includes(step?.stepNumber);

  // Si ya se completó el feedback exitosamente
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-md text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20"></div>
          <div className="relative">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">¡Gracias por tu feedback!</h2>
            <p className="text-gray-600 mb-4">Tu opinión nos ayuda a mejorar</p>
            <div className="w-16 h-16 mx-auto border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400 mt-4">Redirigiendo a recetas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de feedback mejorada
  if (showFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 py-8">
        {/* Elementos decorativos flotantes */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[5%] text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🍽️</div>
          <div className="absolute top-40 right-[8%] text-5xl animate-ping" style={{ animationDuration: '4s' }}>⭐</div>
          <div className="absolute bottom-32 left-[10%] text-6xl animate-pulse" style={{ animationDuration: '2.5s' }}>👨‍🍳</div>
          <div className="absolute bottom-40 right-[12%] text-5xl animate-bounce" style={{ animationDuration: '3.5s' }}>🎉</div>
          <div className="absolute top-60 left-[20%] text-4xl animate-spin-slow" style={{ animationDuration: '8s' }}>✨</div>
          <div className="absolute bottom-20 right-[20%] text-5xl animate-float" style={{ animationDuration: '6s' }}>🌟</div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl relative z-10">
          {/* Tarjeta principal con efecto glassmorphism */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50 relative overflow-hidden">
            {/* Degradados decorativos de fondo */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-green-300 to-emerald-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-orange-300 to-amber-200 rounded-full opacity-20 blur-3xl"></div>
            
            {/* Contenido */}
            <div className="relative">
              {/* Header con icono animado */}
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4 animate-pulse">
                  <span className="text-6xl filter drop-shadow-lg">🎊</span>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent mb-2">
                  ¡Felicidades!
                </h2>
                <p className="text-xl text-gray-600">Has completado la receta</p>
                <div className="mt-3 inline-block px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                  <p className="text-green-700 font-medium">✨ Cuéntanos tu experiencia ✨</p>
                </div>
              </div>

              {/* Mensaje de error */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 animate-shake">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Calificación con emojis - Diseño mejorado */}
              <div className="mb-10 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-inner">
                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                  ¿Qué te pareció la receta? <span className="text-green-600">*</span>
                </label>
                <div className="flex flex-col items-center">
                  <div className="flex justify-center gap-3 md:gap-5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="group relative focus:outline-none"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full blur-xl transition-opacity duration-300 ${
                          star <= (hoveredRating || rating) ? 'opacity-50' : 'opacity-0'
                        }`}></div>
                        <span className={`
                          text-5xl md:text-6xl transform transition-all duration-300 block
                          ${star <= (hoveredRating || rating) 
                            ? 'scale-125 rotate-6 filter drop-shadow-xl' 
                            : 'scale-100 hover:scale-110'
                          }
                        `}>
                          {ratingEmojis[star - 1]}
                        </span>
                        {star <= (hoveredRating || rating) && (
                          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-600 whitespace-nowrap animate-fade-in">
                            {ratingLabels[star - 1]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-500 mt-4">
                    {rating > 0 ? (
                      <span className="text-green-600 bg-green-50 px-4 py-2 rounded-full">
                        {ratingLabels[rating - 1]} {ratingEmojis[rating - 1]}
                      </span>
                    ) : (
                      'Toca un emoji para calificar'
                    )}
                  </p>
                </div>
              </div>

              {/* Meal Time - Diseño con tarjetas mejoradas */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  ¿En qué momento disfrutaste esta receta?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'desayuno', label: 'Desayuno', emoji: '☀️', color: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50' },
                    { value: 'comida', label: 'Comida', emoji: '🌞', color: 'from-orange-400 to-red-400', bg: 'bg-orange-50' },
                    { value: 'cena', label: 'Cena', emoji: '🌙', color: 'from-indigo-400 to-purple-400', bg: 'bg-indigo-50' },
                    { value: 'snack', label: 'Snack', emoji: '🍪', color: 'from-amber-400 to-yellow-400', bg: 'bg-amber-50' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMealTime(option.value as 'desayuno' | 'comida' | 'cena' | 'snack')}
                      className={`
                        relative p-4 rounded-xl transition-all duration-300 overflow-hidden group
                        ${mealTime === option.value 
                          ? 'ring-2 ring-green-500 ring-offset-2 scale-105' 
                          : 'hover:scale-105'
                        }
                      `}
                    >
                      <div className={`
                        absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity
                        ${mealTime === option.value ? 'opacity-20' : ''}
                      `}></div>
                      <div className="relative flex flex-col items-center gap-2">
                        <span className="text-3xl filter drop-shadow-lg">{option.emoji}</span>
                        <span className={`font-medium text-sm ${
                          mealTime === option.value ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      {mealTime === option.value && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredientes - Diseño mejorado */}
              {ingredients.length > 0 && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    🥕 Ingredientes utilizados
                  </label>
                  <div className="space-y-3">
                    {ingredients.map((ing, index) => (
                      <div 
                        key={index} 
                        className={`
                          group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300
                          ${ing.leftover 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                            : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-green-200'
                          }
                        `}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-emerald-400 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <input
                          type="checkbox"
                          checked={ing.leftover || false}
                          onChange={(e) => handleIngredientChange(index, 'leftover', e.target.checked)}
                          className="h-5 w-5 text-green-600 rounded-lg focus:ring-green-500 transition-transform hover:scale-110"
                        />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              placeholder="Ingrediente"
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={ing.quantity}
                              onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                              className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              placeholder="Cantidad"
                            />
                          </div>
                        </div>
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium transition-all
                          ${ing.leftover 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {ing.leftover ? 'Sobró 🎉' : 'Usado ✓'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    ✨ Marca los ingredientes que sobraron para mejorar futuras recomendaciones
                  </p>
                </div>
              )}

              {/* Nota personal - Diseño mejorado */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  📝 Nota personal
                </label>
                <div className="relative">
                  <textarea
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value.slice(0, 200))}
                    placeholder="¿Qué te pareció la receta? ¿Hiciste algún cambio? ¡Cuéntanos!"
                    className="w-full px-4 py-4 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                    maxLength={200}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs">
                    <span className={personalNote.length >= 180 ? 'text-orange-500' : 'text-gray-400'}>
                      {personalNote.length}
                    </span>
                    <span className="text-gray-400">/200</span>
                  </div>
                </div>
              </div>

              {/* Botones - Diseño mejorado */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-semibold hover:from-gray-300 hover:to-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>←</span> Volver a pasos
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting || rating === 0}
                  className={`
                    flex-1 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                    ${isSubmitting || rating === 0
                      ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-100 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Guardar feedback</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mensaje motivacional */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>🌟 Tu opinión nos ayuda a crear mejores experiencias culinarias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de cocción
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <button
          onClick={() => navigate(`/recipes/${id}`)}
          className="flex items-center text-green-600 mb-6 hover:underline"
        >
          <ArrowLeft size={20} className="mr-1" /> Volver a la receta
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
          <p className="text-gray-600 mb-6">Paso a paso</p>

          {/* Progreso */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Paso {currentStep + 1} de {recipe.steps.length}</span>
              <span>{completedSteps.length} completados</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / recipe.steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Paso actual */}
          <div className="border rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Paso {step.stepNumber}</h2>
              {isCompleted && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <CheckCircle size={16} /> Completado
                </span>
              )}
            </div>
            <p className="text-gray-800 text-lg mb-6">{step.description}</p>

            {step.detailedNote && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-blue-800">
                <p className="text-sm">{step.detailedNote}</p>
              </div>
            )}

            {hasTimer && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={20} />
                    <span className="font-medium">Temporizador</span>
                  </div>
                  <div className="text-2xl font-mono">
                    {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!timerActive && timerSecondsLeft === 0 && (
                    <button
                      onClick={() => startTimer(step.timerSeconds!)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Play size={18} /> Iniciar
                    </button>
                  )}
                  {timerActive && (
                    <button
                      onClick={pauseTimer}
                      className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
                    >
                      <Pause size={18} /> Pausar
                    </button>
                  )}
                  {timerSecondsLeft > 0 && !timerActive && (
                    <button
                      onClick={() => setTimerActive(true)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Play size={18} /> Reanudar
                    </button>
                  )}
                  {timerSecondsLeft > 0 && (
                    <button
                      onClick={resetTimer}
                      className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => markStepComplete(step.stepNumber)}
                disabled={isCompleted}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isCompleted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <CheckCircle size={18} /> Marcar completado
              </button>
            </div>
          </div>

          {/* Navegación entre pasos */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl font-medium ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={nextStep}
              className={`px-6 py-3 rounded-xl font-medium ${
                currentStep === recipe.steps.length - 1
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {currentStep === recipe.steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>

      {/* Estilos CSS para animaciones personalizadas */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.8s ease-in-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecipeCook;