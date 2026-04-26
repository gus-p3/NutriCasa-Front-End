import React, { useEffect, useState } from 'react';
import api from '../../api/api'; 

interface Comment {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
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
      try {
        const response = await api.get(`/comments/${recipeId}`);
        setComments(response.data);
      } catch (error) {
        console.error('Error al cargar comentarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId, refresh]); // Aquí 'refresh' ya funcionará correctamente

  if (loading) return <p>Cargando comentarios...</p>;
  if (comments.length === 0) return <p className="text-gray-500">Aún no hay comentarios. ¡Sé el primero!</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Comentarios</h3>
      {comments.map((c) => (
        <div key={c._id} className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold">{c.rating} estrellas</span>
          </div>
          <p className="text-gray-700">{c.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;