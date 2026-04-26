import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../api/api';

interface CommentFormProps {
  recipeId: string;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ recipeId, onCommentAdded }) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

// Dentro de CommentForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Asegúrate de que esta ruta coincida con tu backend
    await api.post('/comments', {
      recipeId,
      rating,
      comment
    });
    
    alert('¡Comentario publicado con éxito!');

    onCommentAdded();

    setComment(''); // Limpiar el campo
    setRating(0);   // Reiniciar estrellas
    // Opcional: recargar la página o disparar un evento para refrescar la lista
  } catch (error) {
    console.error('Error al guardar comentario:', error);
    alert('Hubo un error al publicar tu comentario.');
  }
};

  // Validar si el botón debe estar deshabilitado
  const isFormInvalid = rating === 0 || comment.trim() === '';

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-sm border mt-4">
      <h3 className="text-lg font-semibold mb-2">Deja tu opinión</h3>
      
      {/* Estrellas */}
      <div className="flex gap-1 mb-4">
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

      {/* Input de texto */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="¿Qué te pareció la receta?"
        className="w-full p-2 border rounded-md mb-4 focus:ring-2 focus:ring-green-500 outline-none"
        rows={3}
      />

      {/* Botón */}
      <button
        type="submit"
        disabled={isFormInvalid}
        className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
          isFormInvalid 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        Publicar Opinión
      </button>
    </form>
  );
};

export default CommentForm;