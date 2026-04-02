import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  User
} from 'lucide-react';

const MyRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMyRecipes();
  }, []);

  const loadMyRecipes = async () => {
    try {
      setLoading(true);
      const data = await getUserRecipes(); // 👈 ya sin cast raro
      setRecipes(data);
    } catch (err: any) {
      console.error('Error al cargar mis recetas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta receta?')) return;

    try {
      setDeletingId(id);
      await deleteRecipe(id);
      await loadMyRecipes();
    } catch (err: any) {
      console.error('Error al eliminar receta:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User /> Mis Recetas
        </h1>

        <Link
          to="/create-recipe"
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Crear
        </Link>
      </div>

      {/* VACÍO */}
      {recipes.length === 0 && (
        <p className="text-center text-gray-500">
          No tienes recetas aún
        </p>
      )}

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe._id} className="border rounded-xl p-4 shadow">
            <img
              src={recipe.imageUrl || 'https://via.placeholder.com/300'}
              alt={recipe.title}
              className="w-full h-40 object-cover rounded"
            />

            <h3 className="font-bold mt-2">{recipe.title}</h3>
            <p className="text-sm text-gray-500">{recipe.description}</p>

            <div className="flex gap-3 text-sm mt-2">
              <span><Clock size={14} /> {recipe.prepTimeMinutes}m</span>
              <span><DollarSign size={14} /> ${recipe.estimatedCost}</span>
              <span><Flame size={14} /> {recipe.nutrition.calories}</span>
            </div>

            <div className="flex gap-2 mt-3">
              <Link to={`/recipes/${recipe._id}`}>
                <Eye size={18} />
              </Link>

              <Link to={`/edit-recipe/${recipe._id}`}>
                <Edit size={18} />
              </Link>

              <button onClick={() => handleDelete(recipe._id)}>
                {deletingId === recipe._id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRecipes;