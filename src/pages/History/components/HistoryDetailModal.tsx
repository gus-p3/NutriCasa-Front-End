import React, { useState } from 'react';
import { X, Star, Flame, DollarSign, Package, Clock, Utensils, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { formatHistoryDate, countLeftoverIngredients, type HistoryEntry } from '../../../api/history.service';

interface HistoryDetailModalProps {
  entry: HistoryEntry;
  onClose: () => void;
  onRefresh?: () => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ entry, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [isAddingLeftovers, setIsAddingLeftovers] = useState(false);

  const leftoversCount = countLeftoverIngredients(entry.ingredientsUsed);

  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  // Helper to extract recipe ID string (handles populated object or plain string)
  const extractRecipeId = () => {
    if (typeof entry.recipeId === 'object' && entry.recipeId !== null) {
      return (entry.recipeId as any)._id;
    }
    return entry.recipeId;
  };

  const recipeIdStr = extractRecipeId();

  // Helper to extract imageUrl if populated
  const imageUrl = typeof entry.recipeId === 'object' && entry.recipeId !== null && 'imageUrl' in entry.recipeId 
    ? (entry.recipeId as any).imageUrl 
    : undefined;

  const handleAddLeftovers = async () => {
    setIsAddingLeftovers(true);
    try {
      // Filtrar solos los que tienen sobrante
      const leftovers = entry.ingredientsUsed.filter(i => i.leftover > 0).map(i => ({
        id: i._id, // enviamos el _id del ingrediente en el historial, o mapearlo según pida el backend
        name: i.name,
        quantity: i.leftover,
        unit: i.unit
      }));

      // Petición al backend según los requerimientos: POST /inventory/add-leftover
      await api.post('/inventory/add-leftover', { ingredients: leftovers });
      
      alert('¡Sobrantes agregados al inventario con éxito!');
      if (onRefresh) onRefresh();
      
      // Opcional: Cerrar el modal para forzar actualización
      onClose();
    } catch (error) {
      console.error('Error al agregar sobrantes:', error);
      alert('Ocurrió un error al agregar los sobrantes al inventario. Inténtalo de nuevo.');
    } finally {
      setIsAddingLeftovers(false);
    }
  };

  const handleCookAgain = () => {
    if (recipeIdStr) {
      navigate(`/recipes/${recipeIdStr}/cook`);
    } else {
      alert("No se pudo obtener el ID de la receta.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header con Imagen */}
        <div className="relative h-48 bg-gray-200 shrink-0">
          {imageUrl ? (
            <img 
              src={getFullImageUrl(imageUrl)} 
              alt={entry.recipeName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-green-50">
              <Utensils size={48} className="opacity-20 text-green-600" />
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-sm transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
            <h2 className="text-2xl font-bold text-white mb-1">{entry.recipeName}</h2>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Clock size={16} />
              <span>{formatHistoryDate(entry.cookedAt)}</span>
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <Star className="text-yellow-500 mb-1" size={20} fill="currentColor" />
              <span className="text-xs text-yellow-700 font-medium">Rating</span>
              <span className="text-lg font-bold text-yellow-800">{entry.rating}/5</span>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <Flame className="text-orange-500 mb-1" size={20} />
              <span className="text-xs text-orange-700 font-medium">Calorías</span>
              <span className="text-lg font-bold text-orange-800">{entry.caloriesConsumed}</span>
            </div>
            <div className="bg-green-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <DollarSign className="text-green-500 mb-1" size={20} />
              <span className="text-xs text-green-700 font-medium">Costo</span>
              <span className="text-lg font-bold text-green-800">${(entry.estimatedCost || 0).toFixed(2)}</span>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <Package className="text-blue-500 mb-1" size={20} />
              <span className="text-xs text-blue-700 font-medium">Ingrs.</span>
              <span className="text-lg font-bold text-blue-800">{entry.ingredientsUsed?.length || 0}</span>
            </div>
          </div>

          {/* Lista de Ingredientes */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-green-600" /> 
              Ingredientes Utilizados
            </h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {(entry.ingredientsUsed || []).map((ing, idx) => (
                  <li key={ing._id || idx} className="p-3 hover:bg-white transition-colors flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-700 block">{ing.name}</span>
                      <span className="text-xs text-gray-500">
                        Usado: {ing.quantityUsed} {ing.unit}
                      </span>
                    </div>
                    {ing.leftover > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Sobró {ing.leftover} {ing.unit}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Agotado
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 flex-col sm:flex-row shrink-0">
          <button 
            onClick={handleCookAgain}
            className="flex-1 bg-white border-2 border-green-600 text-green-600 font-semibold py-3 px-4 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <Utensils size={18} />
            Cocinar de nuevo
          </button>
          
          {leftoversCount > 0 && (
            <button 
              onClick={handleAddLeftovers}
              disabled={isAddingLeftovers}
              className={`flex-1 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                isAddingLeftovers ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200'
              }`}
            >
              <Package size={18} />
              {isAddingLeftovers ? 'Guardando...' : `Guardar sobrantes (${leftoversCount})`}
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default HistoryDetailModal;
