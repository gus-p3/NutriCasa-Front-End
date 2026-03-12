// src/pages/RecipeCook.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react';
import api from '../../api/api';


interface Step {
  stepNumber: number;
  description: string;
  timerSeconds?: number;
  detailedNote?: string;
}

interface RecipeCook {
  _id: string;
  title: string;
  steps: Step[];
}

const RecipeCook: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeCook | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.data.data);
      } catch (error) {
        console.error('Error al cargar receta:', error);
      }
    };
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerActive) {
      setTimerActive(false);
      // Opcional: reproducir sonido o alerta
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSecondsLeft]);

  const startTimer = (seconds: number) => {
    setTimerSecondsLeft(seconds);
    setTimerActive(true);
  };

  const pauseTimer = () => setTimerActive(false);
  const resetTimer = () => {
    setTimerActive(false);
    setTimerSecondsLeft(timer || 0);
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
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimerActive(false);
      setTimerSecondsLeft(0);
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
              disabled={currentStep === recipe.steps.length - 1}
              className={`px-6 py-3 rounded-xl font-medium ${
                currentStep === recipe.steps.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Siguiente
            </button>
          </div>

          {currentStep === recipe.steps.length - 1 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/recipes')}
                className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-all"
              >
                ¡Terminado! Ver más recetas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCook;