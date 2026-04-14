import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecipe, updateRecipe, getUserRecipes } from '../../api/recipes.service';
import api from '../../api/api';
import type { Recipe } from '../../api/recipes.service';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Flame,
  Camera,
  X,
  Circle
} from 'lucide-react';

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Omit<Recipe, '_id'>>({
    title: '',
    description: '',
    category: 'comida',
    dietTypes: ['normal'],
    ingredients: [{ name: '', quantity: 0, unit: 'g' }],
    steps: [{ stepNumber: 1, description: '', timerSeconds: 0 }],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    prepTimeMinutes: 30,
    estimatedCost: 50,
    difficulty: 'media',
    imageUrl: ''
  });

  useEffect(() => {
    if (isEditMode) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const recipes = await getUserRecipes();
      const recipe = recipes.find(r => r._id === id);
      if (recipe) {
        const { _id, ...recipeData } = recipe;
        setForm(recipeData);
      } else {
        alert('Receta no encontrada');
        navigate('/my-recipes');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'prepTimeMinutes' || name === 'estimatedCost' ? Math.max(0, Number(value)) : value
    }));
  };

  const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [name]: Math.max(0, Number(value))
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        // Obtenemos la URL relativa (ej: /uploads/abc.jpg)
        // La guardamos tal cual, el frontend se encargará de resolverla con la URL base de la API si es necesario
        setForm(prev => ({ ...prev, imageUrl: response.data.url }));
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error al subir imagen: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  const getFullImageUrl = (url: string | undefined) => {
    if (!url) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000';
    if (url.startsWith('http')) return url;
    // Asumimos que la API corre en el mismo host que VITE_API_URL pero sin el /api
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  // --- Ingredients Logic ---
  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 0, unit: 'g' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newIngredients = [...form.ingredients];
    newIngredients[index] = { 
      ...newIngredients[index], 
      [name]: name === 'quantity' ? Number(value) : value 
    };
    setForm(prev => ({ ...prev, ingredients: newIngredients }));
  };

  // --- Steps Logic ---
  const addStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, { stepNumber: prev.steps.length + 1, description: '', timerSeconds: 0 }]
    }));
  };

  const removeStep = (index: number) => {
    const newSteps = form.steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setForm(prev => ({ ...prev, steps: newSteps }));
  };

  const handleStepChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSteps = [...form.steps];
    newSteps[index] = { 
      ...newSteps[index], 
      [name]: name === 'timerSeconds' ? Number(value) : value 
    };
    setForm(prev => ({ ...prev, steps: newSteps }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && id) {
        await updateRecipe(id, form);
        alert('Receta actualizada con éxito');
      } else {
        await createRecipe(form);
        alert('Receta creada con éxito');
      }
      navigate('/my-recipes');
    } catch (error: any) {
      console.error(error);
      alert('Error: ' + (error.response?.data?.message || 'Algo salió mal'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Image with Upload Overlay */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-200">
        <img
          src={getFullImageUrl(form.imageUrl)}
          alt={form.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
          <div className="bg-white/90 p-4 rounded-full shadow-lg flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            ) : (
              <>
                <Camera size={32} className="text-green-600" />
                <span className="text-xs font-bold text-gray-700 uppercase">Cambiar Imagen</span>
              </>
            )}
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        
        <button 
          onClick={() => navigate('/my-recipes')}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl relative z-10 p-6 md:p-8 space-y-8">
          
          {/* Header Card (Title & Basic Info) */}
          <div className="space-y-4">
            <input
              required
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Título de la receta..."
              className="text-3xl md:text-4xl font-bold text-gray-900 w-full border-none focus:ring-0 placeholder:text-gray-300 p-0"
            />
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Badges as inputs */}
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                <Clock size={16} />
                <input 
                  type="number" 
                  name="prepTimeMinutes" 
                  value={form.prepTimeMinutes} 
                  onChange={handleChange} 
                  className="bg-transparent border-none p-0 w-8 focus:ring-0 text-center font-bold"
                /> min
              </div>
              
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                <DollarSign size={16} /> $
                <input 
                  type="number" 
                  name="estimatedCost" 
                  value={form.estimatedCost} 
                  onChange={handleChange} 
                  className="bg-transparent border-none p-0 w-10 focus:ring-0 text-center font-bold"
                />
              </div>

              <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium border border-orange-100">
                <Flame size={16} />
                <input 
                  type="number" 
                  name="calories" 
                  value={form.nutrition.calories} 
                  onChange={handleNutritionChange} 
                  className="bg-transparent border-none p-0 w-12 focus:ring-0 text-center font-bold"
                /> kcal
              </div>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="capitalize bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border-none focus:ring-0 outline-none h-8 font-medium"
              >
                <option value="fácil">Fácil</option>
                <option value="media">Media</option>
                <option value="difícil">Difícil</option>
              </select>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="capitalize bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-100 focus:ring-0 outline-none h-8 font-medium"
              >
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="cena">Cena</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <textarea
              required
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Escribe una breve descripción de tu receta..."
              className="text-gray-700 text-lg w-full border-none focus:ring-0 resize-none p-0 placeholder:text-gray-300"
            />
          </div>

          <hr className="border-gray-100" />

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Ingredientes</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm bg-green-50 text-green-600 px-4 py-2 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-2 font-bold"
              >
                <Plus size={18} /> Agregar Ingrediente
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 flex-grow">
                    <Circle size={12} fill="#22c55e" className="text-green-500" />
                    <input
                      required
                      placeholder="Nombre..."
                      name="name"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(idx, e)}
                      className="bg-transparent border-none p-0 w-full focus:ring-0 font-medium placeholder:text-gray-300"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      required
                      type="number"
                      name="quantity"
                      value={ing.quantity}
                      onChange={(e) => handleIngredientChange(idx, e)}
                      className="bg-white border rounded tracking-tight p-1 w-14 focus:ring-green-500 text-center font-bold text-sm"
                    />
                    <select
                      name="unit"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, e)}
                      className="bg-white border rounded p-1 w-16 focus:ring-green-500 text-xs font-bold"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="pza">pza</option>
                      <option value="cda">cda</option>
                      <option value="cdta">cdta</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Preparation Steps Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Preparación</h2>
              <button
                type="button"
                onClick={addStep}
                className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-bold"
              >
                <Plus size={18} /> Agregar Paso
              </button>
            </div>
            
            <div className="space-y-6">
              {form.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      {step.stepNumber}
                    </div>
                    {idx !== form.steps.length - 1 && (
                      <div className="w-0.5 flex-grow bg-gray-100 my-2"></div>
                    )}
                  </div>
                  <div className="flex-grow pb-6">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                         Temporizador: 
                         <input 
                           type="number" 
                           name="timerSeconds" 
                           value={step.timerSeconds || 0} 
                           onChange={(e) => handleStepChange(idx, e)}
                           className="w-12 bg-gray-100 border-none p-1 rounded focus:ring-0 text-center"
                         /> seg
                       </div>
                       <button
                         type="button"
                         onClick={() => removeStep(idx)}
                         className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                    <textarea
                      required
                      name="description"
                      value={step.description}
                      onChange={(e) => handleStepChange(idx, e)}
                      placeholder="Describe este paso..."
                      className="w-full text-lg text-gray-700 border-none focus:ring-0 bg-transparent resize-none p-0 placeholder:text-gray-200"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Submit Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-green-600 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-green-700 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={28} />
                  {isEditMode ? 'Actualizar Receta' : 'Crear Receta Premium'}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;