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
}

const CommentList: React.FC<CommentListProps> = ({ recipeId, refresh }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        // Eduardo confirmó que la respuesta trae los datos dentro de .data
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
  
  if (comments.length === 0) return <p className="text-gray-500">Aún no hay comentarios. ¡Sé el primero!</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Opiniones de la comunidad</h3>
      {comments.map((c) => (
        <div key={c._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar con la inicial del usuario */}
              <div className="w-10 h-10 bg-green-100 text-green-700 font-bold flex items-center justify-center rounded-full">
                {c.user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{c.user?.name || 'Anónimo'}</p>
                <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex text-yellow-400">
               <span>{'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}</span>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{c.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;