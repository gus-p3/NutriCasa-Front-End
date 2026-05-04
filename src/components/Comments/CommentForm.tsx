import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../api/api'; 

interface CommentFormProps {
  recipeId: string;
  onCommentAdded: () => void; 
}

const CommentForm: React.FC<CommentFormProps> = ({ recipeId, onCommentAdded }) => {
  // --- ESTADOS ---
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0); 
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LÓGICA DE ENVÍO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Por favor, selecciona una calificación.');
    
    setIsSubmitting(true);
    
    try {
      await api.post('/comments', { recipeId, rating, comment });
      
      setComment(''); 
      setRating(0);
      
      // Refrescar lista de comentarios
      onCommentAdded(); 
    } catch (error: any) {
      const message = error.response?.data?.message || 'Hubo un error al publicar tu comentario.';
      console.error('Error al enviar:', error);
      alert(message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm bg-white">
      <h4 className="font-bold mb-2">Deja tu opinión</h4>
      
      {/* Estrellas con efecto hover */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            size={28}
            className={`cursor-pointer transition-colors ${
              star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          />
        ))}
      </div>

      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 border rounded mt-2"
        placeholder="Escribe tu comentario..."
        required
      />
      
      <button 
        disabled={isSubmitting} 
        type="submit"
        className={`mt-3 px-6 py-2 rounded font-bold transition-colors ${
          isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? 'Enviando...' : 'Publicar Opinión'}
      </button>
    </form>
  );
};

export default CommentForm;