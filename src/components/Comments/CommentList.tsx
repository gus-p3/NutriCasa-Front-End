import React, { useEffect, useState } from 'react';
import api from '../../api/api'; 

interface Comment {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {       
    name: string;
  };
}

interface CommentListProps {
  recipeId: string;
  refresh: boolean;
  isLoggedIn: boolean; // Agregamos esto para el feedback visual
}

const CommentList: React.FC<CommentListProps> = ({ recipeId, refresh, isLoggedIn }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/comments/${recipeId}`);
        setComments(response.data.data || []); 
      } catch (error) {
        console.error('Error al cargar comentarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId, refresh]);

  if (loading) return <p className="text-gray-500 animate-pulse">Cargando comentarios...</p>;

  return (
    <div className="mt-8 space-y-4">
      {/* 1. Título con Estilo (Semana 3) */}
      <h3 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 w-fit pb-1">
        Opiniones de la comunidad
      </h3>

      {/* 2. Mensaje de Feedback Visual (Semana 3) */}
      {!isLoggedIn && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded-lg text-sm animate-pulse border-l-4 border-blue-500">
          ℹ️ Inicia sesión para dejar un comentario y calificar esta receta.
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-500 italic">Aún no hay comentarios. ¡Sé el primero!</p>
      ) : (
        <div className="grid gap-4">
          {comments.map((c) => (
            /* 3. Lista con Animación y Estética Mejorada (Semana 3) */
            <div key={c._id} className="p-5 bg-white shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* Avatar con inicial */}
                  <div className="w-10 h-10 bg-green-100 text-green-700 font-bold flex items-center justify-center rounded-full shadow-inner">
                    {c.user?.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block leading-none">{c.user?.name || 'Anónimo'}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Estrellas Amarillas */}
                <div className="text-yellow-400 text-sm bg-yellow-50 px-2 py-1 rounded-lg">
                  {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed pl-1">
                {c.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;