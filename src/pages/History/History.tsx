import React, { useEffect, useState, useMemo } from 'react';
import { Utensils, Star, Flame, DollarSign, Package, Clock, Filter, ArrowUpDown } from 'lucide-react';
import { getUserHistory, type HistoryEntry, formatHistoryDate } from '../../api/history.service';
import HistoryDetailModal from './components/HistoryDetailModal';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  // Filtros
  const [filterMealTime, setFilterMealTime] = useState<string>('ALL');
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  
  // Ordenamiento
  const [sortBy, setSortBy] = useState<'DATE' | 'RATING' | 'CALORIES'>('DATE');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('No se pudo cargar el historial. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (url: string | undefined): string => {
    if (!url) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000';
    if (url.startsWith('http')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // KPIs calculados
  const stats = useMemo(() => {
    if (!history || !history.length) return { total: 0, avgRating: 0, totalCal: 0, totalCost: 0 };
    
    const total = history.length;
    const avgRating = history.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total;
    const totalCal = history.reduce((acc, curr) => acc + (curr.caloriesConsumed || 0), 0);
    const totalCost = history.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

    return { total, avgRating, totalCal, totalCost };
  }, [history]);

  // Aplicar Filtros y Ordenamiento
  const filteredAndSortedHistory = useMemo(() => {
    if (!history || !history.length) return [];
    
    let result = [...history];

    // Aplicar filtros
    if (filterMealTime !== 'ALL') {
      result = result.filter(h => h.mealTime && h.mealTime.toLowerCase() === filterMealTime.toLowerCase());
    }
    if (filterMinRating > 0) {
      result = result.filter(h => (h.rating || 0) >= filterMinRating);
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'DATE') {
        const dateA = a.cookedAt ? new Date(a.cookedAt).getTime() : 0;
        const dateB = b.cookedAt ? new Date(b.cookedAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'RATING') {
        comparison = (a.rating || 0) - (b.rating || 0);
      } else if (sortBy === 'CALORIES') {
        comparison = (a.caloriesConsumed || 0) - (b.caloriesConsumed || 0);
      }
      return sortOrder === 'ASC' ? comparison : -comparison;
    });

    return result;
  }, [history, filterMealTime, filterMinRating, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
  };

  // Badge styles based on mealTime
  const getBadgeStyles = (mealTime: string) => {
    const types: Record<string, string> = {
      desayuno: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      comida: 'bg-orange-100 text-orange-800 border-orange-200',
      cena: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      snack: 'bg-green-100 text-green-800 border-green-200',
    };
    return types[mealTime?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-500">Cargando tu historial culinario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center max-w-2xl mx-auto border border-red-100">
          <p>{error}</p>
          <button 
            onClick={fetchHistory}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Clock className="text-green-600" size={32} />
          Historial de Recetas
        </h1>
        <p className="text-gray-500 mt-2">Revisa todo lo que has cocinado, y agrega sobrantes a tu inventario.</p>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
          <Utensils className="text-green-500 mb-2" size={24} />
          <span className="text-sm text-gray-500 font-medium">Recetas</span>
          <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
          <Star className="text-yellow-500 mb-2" size={24} fill="currentColor" />
          <span className="text-sm text-gray-500 font-medium">Promedio</span>
          <span className="text-2xl font-bold text-gray-800">{stats.avgRating.toFixed(1)}/5</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
          <Flame className="text-orange-500 mb-2" size={24} />
          <span className="text-sm text-gray-500 font-medium">Kcal Totales</span>
          <span className="text-2xl font-bold text-gray-800">{stats.totalCal.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center">
          <DollarSign className="text-blue-500 mb-2" size={24} />
          <span className="text-sm text-gray-500 font-medium">Gasto Total</span>
          <span className="text-2xl font-bold text-gray-800">${stats.totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Controles de Filtros y Orden */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <select 
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            value={filterMealTime}
            onChange={(e) => setFilterMealTime(e.target.value)}
          >
            <option value="ALL">Todo tipo</option>
            <option value="desayuno">Desayuno</option>
            <option value="comida">Comida</option>
            <option value="cena">Cena</option>
            <option value="snack">Snack</option>
          </select>

          <select
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            value={filterMinRating}
            onChange={(e) => setFilterMinRating(Number(e.target.value))}
          >
            <option value={0}>Cualquier Rating</option>
            <option value={5}>5 Estrellas</option>
            <option value={4}>4+ Estrellas</option>
            <option value={3}>3+ Estrellas</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          
          <select
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="DATE">Fecha</option>
            <option value="RATING">Rating</option>
            <option value="CALORIES">Calorías</option>
          </select>

          <button 
            onClick={toggleSortOrder}
            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-colors"
            title={sortOrder === 'ASC' ? 'Ascendente' : 'Descendente'}
          >
            <ArrowUpDown size={18} className={sortOrder === 'ASC' ? 'rotate-180 transform' : ''} />
          </button>
        </div>

      </div>

      {/* Grid de Recetas */}
      {filteredAndSortedHistory.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100">
          <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600">No se encontraron recetas</h3>
          <p className="text-gray-500 mt-2">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedHistory.map((entry) => {
            const imageUrl = typeof entry.recipeId === 'object' && entry.recipeId !== null && 'imageUrl' in entry.recipeId 
              ? (entry.recipeId as any).imageUrl 
              : undefined;

            return (
              <div 
                key={entry._id}
                onClick={() => setSelectedEntry(entry)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* Imagen */}
                <div className="h-44 bg-gray-100 relative overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={getFullImageUrl(imageUrl)} 
                      alt={entry.recipeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Utensils size={40} />
                    </div>
                  )}
                  
                  {/* Badge Type */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm backdrop-blur-sm bg-white/90 ${getBadgeStyles(entry.mealTime)}`}>
                      {(entry.mealTime || 'Otros').toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-yellow-500" fill="currentColor" />
                    {entry.rating}
                  </div>
                  
                  {/* Gradient overlay para fecha */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                      <Clock size={12} />
                      {formatHistoryDate(entry.cookedAt).split(',')[0]} {/* Solo la fecha corta en la tarjeta */}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 truncate" title={entry.recipeName}>
                    {entry.recipeName}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1" title="Calorías">
                      <Flame size={16} className="text-orange-400" />
                      <span className="font-medium">{entry.caloriesConsumed || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Costo">
                      <DollarSign size={16} className="text-green-500" />
                      <span className="font-medium">${(entry.estimatedCost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Ingredientes">
                      <Package size={16} className="text-blue-400" />
                      <span className="font-medium">{entry.ingredientsUsed?.length || 0}</span>
                    </div>
                  </div>

                  {/* Top ingredientes */}
                  {entry.ingredientsUsed && entry.ingredientsUsed.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">Ingredientes principales:</p>
                      <p className="text-xs text-gray-700 truncate">
                        {entry.ingredientsUsed.slice(0, 3).map(i => i.name).join(', ')}
                        {entry.ingredientsUsed.length > 3 && '...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedEntry && (
        <HistoryDetailModal 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
          onRefresh={fetchHistory}
        />
      )}
      
    </div>
  );
};

export default History;