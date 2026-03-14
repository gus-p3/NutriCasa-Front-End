// src/pages/Recipes.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { 
  Search, 
  Clock, 
  DollarSign, 
  Flame, 
  Filter,
  X,
  ChevronDown,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  dietTypes: string[];
  allergens: string[];
  ingredients: any[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prepTimeMinutes: number;
  estimatedCost: number;
  difficulty: string;
  ratings: {
    average: number;
    count: number;
  };
  matchScore: number;
}

interface FilterState {
  q: string;
  category: string;
  maxPrepTime: string;
  maxCost: string;
  dietType: string;
  difficulty: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    category: '',
    maxPrepTime: '',
    maxCost: '',
    dietType: '',
    difficulty: '',
    sortBy: 'matchScore',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    pagina_actual: 1,
    total_paginas: 1,
    total_items: 0,
    limite: 20,
    tiene_siguiente: false,
    tiene_anterior: false
  });

  // Cargar recetas sugeridas inicialmente
  useEffect(() => {
    loadSuggestedRecipes();
  }, []);

  const loadSuggestedRecipes = async () => {
    setLoading(true);
    setIsSearching(false);
    setSearchPerformed(false);
    try {
      const response = await api.get('/recipes/suggested?limit=20');
      setRecipes(response.data.data);
      setPagination({
        pagina_actual: 1,
        total_paginas: 1,
        total_items: response.data.data.length,
        limite: 20,
        tiene_siguiente: false,
        tiene_anterior: false
      });
    } catch (error) {
      console.error('Error al cargar recetas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
    // Si no hay término de búsqueda ni filtros, volver a recomendadas
    if (!filters.q && !filters.category && !filters.maxPrepTime && !filters.maxCost && 
        !filters.dietType && !filters.difficulty) {
      loadSuggestedRecipes();
      return;
    }

    setSearchLoading(true);
    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category) params.append('category', filters.category);
      if (filters.maxPrepTime) params.append('maxPrepTime', filters.maxPrepTime);
      if (filters.maxCost) params.append('maxCost', filters.maxCost);
      if (filters.dietType) params.append('dietType', filters.dietType);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.sortBy) {
        params.append('ordenarPor', filters.sortBy);
        params.append('orden', filters.sortOrder);
      }
      params.append('pagina', page.toString());
      params.append('limite', pagination.limite.toString());

      const response = await api.get(`/recipes/search?${params.toString()}`);
      setRecipes(response.data.data);
      setPagination({
        pagina_actual: response.data.paginacion.pagina_actual,
        total_paginas: response.data.paginacion.total_paginas,
        total_items: response.data.paginacion.total_items,
        limite: response.data.paginacion.limite,
        tiene_siguiente: response.data.paginacion.pagina_actual < response.data.paginacion.total_paginas,
        tiene_anterior: response.data.paginacion.pagina_actual > 1
      });
    } catch (error) {
      console.error('Error al buscar recetas:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      maxPrepTime: '',
      maxCost: '',
      dietType: '',
      difficulty: '',
      sortBy: 'matchScore',
      sortOrder: 'desc'
    });
    loadSuggestedRecipes();
  };

  const getMatchColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getMatchIcon = (score: number) => {
    if (score >= 70) return '🟢';
    if (score >= 40) return '🟡';
    return '🔴';
  };

  const missingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter((i: any) => i.status === 'red').length;
  };

  const missingCost = (recipe: Recipe) => {
    const missingCount = missingIngredients(recipe);
    return Math.round((missingCount / recipe.ingredients.length) * recipe.estimatedCost);
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando tu perfil y alacena...</p>
          <p className="text-sm text-gray-500 mt-2">Buscando las mejores recetas para ti</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header con título y contador */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {!isSearching ? (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-green-600" size={28} />
                    Recomendaciones para ti
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {pagination.total_items} recetas personalizadas • Basadas en tu perfil y alacena
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Search className="text-green-600" size={28} />
                    Resultados de búsqueda
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {pagination.total_items} recetas encontradas {filters.q && `para "${filters.q}"`}
                    {!searchLoading && pagination.total_items === 0 && " • Intenta con otros términos"}
                  </p>
                </>
              )}
            </div>
            
            {/* Barra de búsqueda principal */}
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar recetas..."
                  value={filters.q}
                  onChange={(e) => setFilters({...filters, q: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {/* Indicador de búsqueda en tiempo real */}
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-green-600" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-xl flex items-center gap-2 transition-colors ${
                  showFilters 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter size={20} />
                Filtros
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Botón para volver a recomendaciones (solo visible en búsqueda) */}
          {isSearching && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={loadSuggestedRecipes}
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
              >
                <ArrowLeft size={16} />
                Volver a recomendaciones
              </button>
              {searchPerformed && !searchLoading && pagination.total_items === 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  • No encontramos resultados, prueba con otros filtros
                </span>
              )}
            </div>
          )}

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    <option value="desayuno">Desayuno</option>
                    <option value="comida">Comida</option>
                    <option value="cena">Cena</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Tiempo máximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo máximo</label>
                  <select
                    value={filters.maxPrepTime}
                    onChange={(e) => setFilters({...filters, maxPrepTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Cualquier tiempo</option>
                    <option value="15">Hasta 15 min</option>
                    <option value="30">Hasta 30 min</option>
                    <option value="45">Hasta 45 min</option>
                    <option value="60">Hasta 1 hora</option>
                  </select>
                </div>

                {/* Costo máximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo máximo</label>
                  <select
                    value={filters.maxCost}
                    onChange={(e) => setFilters({...filters, maxCost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Cualquier costo</option>
                    <option value="50">$50</option>
                    <option value="100">$100</option>
                    <option value="150">$150</option>
                    <option value="200">$200</option>
                  </select>
                </div>

                {/* Tipo de dieta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dieta</label>
                  <select
                    value={filters.dietType}
                    onChange={(e) => setFilters({...filters, dietType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    <option value="normal">Normal</option>
                    <option value="vegetarian">Vegetariano</option>
                    <option value="vegan">Vegano</option>
                  </select>
                </div>

                {/* Dificultad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Todas</option>
                    <option value="fácil">Fácil</option>
                    <option value="media">Media</option>
                    <option value="difícil">Difícil</option>
                  </select>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="matchScore">Coincidencia</option>
                    <option value="estimatedCost">Costo</option>
                    <option value="prepTimeMinutes">Tiempo</option>
                    <option value="ratings.average">Valoración</option>
                  </select>
                </div>

                {/* Orden */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters({...filters, sortOrder: e.target.value as 'asc' | 'desc'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                  <X size={18} />
                  Limpiar filtros
                </button>
                <button
                  onClick={() => handleSearch()}
                  disabled={searchLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Aplicar filtros
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de recetas */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de búsqueda */}
        {searchLoading && (
          <div className="text-center py-12">
            <Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Buscando recetas...</h3>
            <p className="text-gray-500">Estamos encontrando las mejores opciones para ti</p>
          </div>
        )}

        {/* Sin resultados */}
        {!searchLoading && recipes.length === 0 && (
          <div className="text-center py-16">
            <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isSearching ? 'No encontramos recetas' : 'No hay recetas disponibles'}
            </h3>
            <p className="text-gray-500">
              {isSearching 
                ? 'Prueba con otros términos de búsqueda o limpia los filtros' 
                : 'Por ahora no tenemos recetas que coincidan con tu perfil'}
            </p>
            {isSearching && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Grid de resultados */}
        {!searchLoading && recipes.length > 0 && (
          <>
            {/* Indicador de resultados de búsqueda */}
            {isSearching && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                <Search size={20} className="text-blue-600" />
                <div>
                  <p className="text-blue-700 font-medium">
                    {pagination.total_items} resultados encontrados
                  </p>
                  <p className="text-sm text-blue-600">
                    Mostrando las mejores coincidencias según tu búsqueda
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${getMatchColor(recipe.matchScore)}`}>
                      {getMatchIcon(recipe.matchScore)} {Math.round(recipe.matchScore)}% match
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
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

                    {missingIngredients(recipe) > 0 && (
                      <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-700 flex items-center gap-1">
                          <AlertCircle size={12} />
                          Te faltan {missingIngredients(recipe)} ingredientes
                          {missingCost(recipe) > 0 && (
                            <span className="font-medium"> (${missingCost(recipe)} aprox.)</span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        recipe.difficulty === 'fácil' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        ★ {recipe.ratings.average.toFixed(1)} ({recipe.ratings.count})
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginación */}
            {pagination.total_paginas > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => handleSearch(pagination.pagina_actual - 1)}
                  disabled={!pagination.tiene_anterior || searchLoading}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  {pagination.pagina_actual} / {pagination.total_paginas}
                </span>
                <button
                  onClick={() => handleSearch(pagination.pagina_actual + 1)}
                  disabled={!pagination.tiene_siguiente || searchLoading}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipes;