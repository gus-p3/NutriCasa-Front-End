import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Wand2, ChefHat, Clock, Flame, CheckCircle, Loader2, X, List, Utensils } from 'lucide-react';
import { generateRecipes, saveGeneratedRecipe } from '../api/ai.api';

const AiDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewRecipe, setPreviewRecipe] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Por favor cuéntanos qué te gustaría comer.');
      return;
    }
    
    try {
      setIsGenerating(true);
      setError('');
      setGeneratedRecipes([]);
      
      const response = await generateRecipes({ prompt, count });
      if (response && response.recipes) {
        setGeneratedRecipes(response.recipes);
      }
    } catch (err: any) {
      console.error('Error generando recetas:', err);
      setError(err.response?.data?.message || 'Hubo un error al generar las recetas. Inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndView = async (recipe: any) => {
    try {
      setIsSaving(true);
      setError('');
      
      const response = await saveGeneratedRecipe(recipe);
      if (response && response.recipe && response.recipe._id) {
        navigate(`/recipes/${response.recipe._id}`);
      }
    } catch (err: any) {
      console.error('Error guardando receta:', err);
      setError(err.response?.data?.message || 'No se pudo guardar la receta elegida.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-20">
      
      {/* Header Minimalista */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/recipes')}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Sparkles className="text-amber-500" /> Chef IA
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 mix-blend-overlay blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-16 -mb-16 mix-blend-overlay blur-lg"></div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full backdrop-blur-md mb-6 border border-white/30 shadow-lg animate-bounce">
              <ChefHat size={48} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Magia Culinaria</h2>
            <p className="text-lg md:text-xl opacity-90 mb-8 font-medium">Cuéntame tus antojos y créeré recetas únicas adaptadas perfectamente a tus objetivos y a los ingredientes que ya tienes en casa.</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 -mt-20 relative z-20 max-w-3xl mx-auto mb-16">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 ml-1 text-lg">¿Qué se te antoja hoy?</label>
              <textarea 
                placeholder="Ejemplo: Quiero una cena ligera pero muy alta en proteína, preferiblemente con pollo y vegetales..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                disabled={isGenerating || isSaving}
                className="w-full border-2 border-gray-200 bg-gray-50 p-4 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition resize-none text-gray-700 placeholder-gray-400 font-medium"
              ></textarea>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-2 ml-1">Opciones a generar</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => setCount(num)}
                      disabled={isGenerating || isSaving}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                        count === num 
                          ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                          : 'border-gray-200 hover:border-green-300 text-gray-500 bg-white'
                      }`}
                    >
                      {num} {num === 1 ? 'Receta' : 'Recetas'}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || isSaving || !prompt.trim()}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl hover:from-emerald-700 hover:to-green-600 transition-all font-bold shadow-xl shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-lg">Cocinando magia...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={24} />
                    <span className="text-lg">Generar Mágia</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium flex items-center gap-3 animate-pulse">
                <Flame size={20} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Estado de carga espectacular */}
        {isGenerating && (
          <div className="py-20 text-center animate-pulse">
            <div className="inline-flex p-6 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full mb-6">
              <Sparkles size={48} className="text-amber-500 animate-spin-slow" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">La IA está diseñando tu menú...</h3>
            <p className="text-gray-500 text-lg">Analizando tus macros y combinando sabores únicos.</p>
          </div>
        )}

        {/* Resultados */}
        {!isGenerating && generatedRecipes.length > 0 && (
          <div className="animate-fadeInUp">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                <CheckCircle className="text-green-500 w-8 h-8" />
                Opciones creadas para ti
              </h3>
              <p className="text-green-600 font-medium bg-green-50 px-4 py-1 rounded-full">{generatedRecipes.length} resultados</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedRecipes.map((recipe, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col relative group cursor-pointer" onClick={() => setPreviewRecipe(recipe)}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  
                  {/* Imagen de la receta */}
                  <div 
                    className="h-56 relative p-6 flex flex-col justify-end" 
                    style={{ backgroundImage: `url(${recipe.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 uppercase tracking-widest shadow-sm z-20">
                      {recipe.category}
                    </div>
                    <h4 className="text-xl font-bold text-white drop-shadow-lg leading-tight line-clamp-2 z-20 relative">
                      {recipe.title}
                    </h4>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col pointer-events-none">
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 italic relative before:content-[''] before:absolute before:-left-3 before:-top-1 before:w-1 before:h-full before:bg-green-400 before:rounded-full pl-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex flex-col items-center gap-1">
                        <Clock size={18} className="text-indigo-500" />
                        <span className="font-semibold text-gray-700">{recipe.prepTimeMinutes}m</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="flex flex-col items-center gap-1">
                        <Flame size={18} className="text-orange-500" />
                        <span className="font-semibold text-gray-700">{recipe.nutrition.calories} kcal</span>
                      </div>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="flex flex-col items-center gap-1">
                        <ChefHat size={18} className="text-pink-500" />
                        <span className="font-semibold text-gray-700 capitalize">{recipe.difficulty}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-indigo-50 text-indigo-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
                    >
                      <List size={20} />
                      Ver Detalles de Receta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Previsualización */}
        {previewRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-scaleUp relative">
              
              <button 
                onClick={() => setPreviewRecipe(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition z-20"
              >
                <X size={24} />
              </button>

              <div 
                className="h-64 sm:h-80 w-full relative shrink-0" 
                style={{ backgroundImage: `url(${previewRecipe.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white z-10">
                  <div className="inline-block px-3 py-1 bg-green-500/90 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
                    {previewRecipe.category}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight shadow-black drop-shadow-2xl">{previewRecipe.title}</h2>
                </div>
              </div>

              <div className="overflow-y-auto p-6 sm:p-8 flex-1 bg-white">
                <p className="text-lg text-gray-700 mb-8 font-medium italic border-l-4 border-green-500 pl-4 bg-green-50/50 py-3 pr-3 rounded-r-xl">
                  "{previewRecipe.description}"
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="flex items-center gap-2 text-pink-500 mb-1"><ChefHat size={20}/></span>
                    <span className="text-sm text-gray-500 mb-1">Dificultad</span>
                    <span className="font-bold text-gray-800 capitalize">{previewRecipe.difficulty}</span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="flex items-center gap-2 text-indigo-500 mb-1"><Clock size={20}/></span>
                    <span className="text-sm text-gray-500 mb-1">Tiempo</span>
                    <span className="font-bold text-gray-800">{previewRecipe.prepTimeMinutes} min</span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="flex items-center gap-2 text-orange-500 mb-1"><Flame size={20}/></span>
                    <span className="text-sm text-gray-500 mb-1">Calorías</span>
                    <span className="font-bold text-gray-800">{previewRecipe.nutrition?.calories} kcal</span>
                  </div>
                  <div className="flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="flex items-center gap-2 text-green-500 mb-1"><Utensils size={20}/></span>
                    <span className="text-sm text-gray-500 mb-1">Costo Aprox</span>
                    <span className="font-bold text-gray-800">${previewRecipe.estimatedCost}</span>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><List className="text-green-500" /> Ingredientes Requeridos</h3>
                    <ul className="space-y-3">
                      {previewRecipe.ingredients?.map((ing: any, i: number) => (
                        <li key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <CheckCircle size={20} className="text-green-500 shrink-0" />
                          <span className="text-gray-700"><span className="font-bold text-gray-900">{ing.quantity} {ing.unit}</span> de {ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><Flame className="text-orange-500" /> Detalle Nutricional</h3>
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-100 shadow-inner">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                            <span className="block text-xs text-blue-500 font-bold uppercase mb-1">Proteína</span>
                            <span className="font-black text-xl text-blue-700">{previewRecipe.nutrition?.protein}g</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-yellow-50">
                            <span className="block text-xs text-yellow-500 font-bold uppercase mb-1">Carbs</span>
                            <span className="font-black text-xl text-yellow-700">{previewRecipe.nutrition?.carbs}g</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl shadow-sm border border-red-50">
                            <span className="block text-xs text-red-500 font-bold uppercase mb-1">Grasa</span>
                            <span className="font-black text-xl text-red-700">{previewRecipe.nutrition?.fat}g</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                       <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><Wand2 className="text-purple-500" /> Pasos Rápidos</h3>
                       <div className="space-y-4">
                          {previewRecipe.steps?.map((step: any, idx: number) => (
                            <div key={idx} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">{step.stepNumber}</div>
                              <p className="text-gray-700 pt-1">{step.description}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-end shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-10">
                <button 
                  onClick={() => setPreviewRecipe(null)}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-bold disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleSaveAndView(previewRecipe)}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl hover:from-emerald-700 hover:to-green-600 transition-all font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar Magia y Cocinar
                      <ArrowLeft className="rotate-180" size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scaleUp {
          animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AiDashboard;
