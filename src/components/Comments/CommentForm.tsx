import React, { useState } from 'react';
import { Star } from 'lucide-react'; // Mantenemos tus iconos profesionales
import api from '../../api/api'; 

interface CommentFormProps {
  recipeId: string;
  onCommentAdded: () => void; 
  isLoggedIn: boolean; // Control de acceso (Semana 3/4)
}

const CommentForm: React.FC<CommentFormProps> = ({ recipeId, onCommentAdded, isLoggedIn }) => {
  // --- ESTADOS ---
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0); 
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NUEVOS ESTADOS       Para eliminar los alert() del navegador
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<boolean>(false);

  // Si el usuario no ha iniciado sesión, el formulario no debe renderizarse
  if (!isLoggedIn) {
    return null; 
  }

  // --- LÓGICA DE ENVÍO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(false);
    
    // Validaciones de Control de Calidad (QA)
    if (rating === 0) {
      setErrorStatus('Por favor, selecciona una calificación en estrellas.');
      return;
    }
    if (!comment.trim()) {
      setErrorStatus('El comentario no puede estar vacío.');
      return;
    }
    
    // Bloquear botón de envío (Anti-Spam)
    setIsSubmitting(true);
    
    try {
      await api.post('/comments', { recipeId, rating, comment });
      
      // Notificación visual integrada en la UI
      setSuccessStatus(true);
      
      // Limpieza absoluta del formulario tras éxito
      setComment(''); 
      setRating(0);
      setHover(0);
      
      // Refrescar lista de comentarios en tiempo real
      onCommentAdded();
    } catch (error: any) {
      console.error('Error al enviar:', error);
      const message = error.response?.data?.message || 'Hubo un error al publicar tu comentario.';
      setErrorStatus(message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 mt-6 shadow-sm">
      <h4 className="text-lg font-bold text-gray-800">Comparte tu opinión</h4>
      
      {/* Selector de Estrellas Interactivo con tu efecto Hover original */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Calificación:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star}
              size={28}
              className={`cursor-pointer transition-all duration-150 hover:scale-110 ${
                star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            />
          ))}
        </div>
      </div>

      {/* Campo de Texto Estilizado */}
      <div>
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none transition-all"
          placeholder="¿Qué te pareció la receta? ¿Le cambiaste algún ingrediente?"
        />
      </div>
      
      {/*  Manejo de Alertas Visuales en la UI */}
      {errorStatus && (
        <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border-l-4 border-red-500 animate-in fade-in duration-200">
          ⚠️ {errorStatus}
        </div>
      )}
      
      {successStatus && (
        <div className="p-3 text-sm bg-green-50 text-green-600 rounded-lg border-l-4 border-green-500 animate-in fade-in duration-200">
          ✅ ¡Comentario publicado con éxito! Gracias por tu opinión.
        </div>
      )}
      
      {/* Botón de Envío con Estado de Carga */}
      <button 
        disabled={isSubmitting} 
        type="submit"
        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
          isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'
        }`}
      >
        {isSubmitting ? 'Enviando opinión...' : 'Publicar Opinión'}
      </button>
    </form>
  );
};

export default CommentForm;