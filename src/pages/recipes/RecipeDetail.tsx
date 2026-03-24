// src/pages/RecipeDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, DollarSign, Flame, Star, ChefHat, ArrowLeft, Circle } from 'lucide-react';
import api from '../../api/api';


interface IngredientStatus {
  name: string;
  requiredQuantity: number;
  unit: string;
  status: 'green' | 'yellow' | 'red';
  availableQuantity?: number;
  alternativeUsed?: string;
}


interface RecipeDetail {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  dietTypes: string[];
  allergens: string[];
  ingredients: IngredientStatus[];
  nutrition: { calories: number; protein: number; carbs: number; fat: number };
  prepTimeMinutes: number;
  estimatedCost: number;
  difficulty: string;
  ratings: { average: number; count: number };
  steps: any[];
  matchScore: number;
  userDailyCalories: number;
}


const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}/with-inventory`);
        setRecipe(response.data.data);
      } catch (error) {
        console.error('Error al cargar receta:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-50';
      case 'yellow': return 'text-yellow-600 bg-yellow-50';
      case 'red': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return <Circle size={12} fill="currentColor" className="text-green-600" />;
      case 'yellow': return <Circle size={12} fill="currentColor" className="text-yellow-600" />;
      case 'red': return <Circle size={12} fill="currentColor" className="text-red-600" />;
      default: return <Circle size={12} fill="currentColor" className="text-gray-400" />;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }


  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Receta no encontrada</h2>
        <button onClick={() => navigate('/recipes')} className="text-green-600 underline">
          Volver a recetas
        </button>
      </div>
    );
  }


  const caloriePercentage = (recipe.nutrition.calories / recipe.userDailyCalories) * 100;
  const caloriePercentageFormatted = Math.min(caloriePercentage, 100).toFixed(0);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Imagen de cabecera */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
      </div>


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl -mt-20 relative z-10 p-6 md:p-8">
          {/* Título y metadata */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  <Clock size={16} /> {recipe.prepTimeMinutes} min
                </span>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  <DollarSign size={16} /> ${recipe.estimatedCost}
                </span>
                <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
                  <Flame size={16} /> {recipe.nutrition.calories} kcal
                </span>
                <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                  <Star size={16} /> {recipe.ratings.average} ({recipe.ratings.count})
                </span>
                <span className="capitalize bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {recipe.difficulty}
                </span>
              </div>
              <p className="text-gray-700 text-lg mb-4">{recipe.description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className={`px-4 py-2 rounded-full font-bold border ${
                recipe.matchScore >= 70 ? 'bg-green-100 text-green-800 border-green-300' :
                recipe.matchScore >= 40 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                'bg-red-100 text-red-800 border-red-300'
              }`}>
                Coincidencia: {recipe.matchScore.toFixed(0)}%
              </div>
            </div>
          </div>


          {/* Barra de calorías vs. diarias */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">Calorías de esta receta</span>
              <span className="text-gray-700">{recipe.nutrition.calories} / {recipe.userDailyCalories} kcal</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${caloriePercentageFormatted}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {caloriePercentage > 100
                ? 'Esta receta supera tus calorías diarias, considera ajustar porciones.'
                : `Representa el ${caloriePercentageFormatted}% de tus calorías diarias.`}
            </p>
          </div>


          {/* Ingredientes con semáforo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredientes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(ing.status)}`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(ing.status)}
                    <span className="font-medium">{ing.name}</span>
                  </div>
                  <div className="text-sm">
                    {ing.requiredQuantity} {ing.unit}
                    {ing.status === 'green' && ing.availableQuantity && (
                      <span className="ml-2 text-green-700">(disponible)</span>
                    )}
                    {ing.status === 'yellow' && (
                      <span className="ml-2 text-yellow-700">(usar {ing.alternativeUsed})</span>
                    )}
                    {ing.status === 'red' && (
                      <span className="ml-2 text-red-700">(falta)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Botón para cocinar */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/recipes/${id}/cook`)}
              className="bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-700 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ChefHat size={24} />
              Comenzar a cocinar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default RecipeDetail;
