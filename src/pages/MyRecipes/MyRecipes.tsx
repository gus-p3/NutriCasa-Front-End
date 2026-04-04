import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRecipes, deleteRecipe } from '../../api/recipes.service';
import type { Recipe } from '../../api/recipes.service';
import {
  Clock,
  DollarSign,
  Flame,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Loader2,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const MyRecipes: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMyRecipes();
  }, []);

  const loadMyRecipes = async () => {
    try {
      setLoading(true);
      const data = await getUserRecipes();
      setRecipes(data);
    } catch (err: any) {
      console.error('Error al cargar mis recetas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) return;

    try {
      setDeletingId(id);
      await deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r._id !== id));
      alert('Receta eliminada correctamente');
    } catch (err: any) {
      console.error('Error al eliminar receta:', err);
      alert('No se pudo eliminar la receta');
    } finally {
      setDeletingId(null);
    }
  };

  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus creaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <User className="text-green-600" size={28} />
                Mis Recetas Propias
              </h1>
              <p className="text-gray-600 mt-1">
                {recipes.length} {recipes.length === 1 ? 'receta creada' : 'recetas creadas'} por ti
              </p>
            </div>
            
            <Link
              to="/create-recipe"
              className="bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-green-700 hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle size={20} />
              Crear Nueva Receta
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vacío */}
        {recipes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
            <Sparkles size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Aún no has creado recetas</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              ¡Comparte tu talento culinario con el mundo! Crea tu primera receta personalizada ahora mismo.
            </p>
            <Link
              to="/create-recipe"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all"
            >
              <PlusCircle size={24} />
              Comenzar a Crear
            </Link>
          </div>
        )}

        {/* Grid de mis recetas (Estilo premium inspirado en Recipes.tsx) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getFullImageUrl(recipe.imageUrl)}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-100 shadow-sm">
                  {recipe.category}
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {recipe.title}
                </h3>
                
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-green-600" />
                    {recipe.prepTimeMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} className="text-green-600" />
                    ${recipe.estimatedCost}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={14} className="text-green-600" />
                    {recipe.nutrition.calories} cal
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    recipe.difficulty === 'fácil' ? 'bg-green-100 text-green-700' :
                    recipe.difficulty === 'media' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>

                {/* Acciones */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-1">
                  <Link 
                    to={`/recipes/${recipe._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Eye size={16} />
                    Ver
                  </Link>

                  <Link 
                    to={`/edit-recipe/${recipe._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border-x border-gray-50"
                  >
                    <Edit size={16} />
                    Editar
                  </Link>

                  <button 
                    onClick={(e) => handleDelete(recipe._id, e)}
                    disabled={deletingId === recipe._id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deletingId === recipe._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRecipes;