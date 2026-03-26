import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithAssistant } from '../../api/ai.api';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    if (isOpen && history.length === 0) {
      setHistory([
        { 
          id: Date.now().toString(), 
          role: 'bot', 
          text: '¡Hola! Soy el asistente de NutriCasa 🌮. ¿En qué te puedo ayudar hoy? (Puedes preguntarme sobre tu alacena, recetas, o pedirme recomendaciones)' 
        }
      ]);
    }
  }, [isOpen, history.length]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');

    // Añadir mensaje del usuario al historial
    const newHistory: ChatMessage[] = [
      ...history, 
      { id: Date.now().toString(), role: 'user', text: userMsg }
    ];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      // Convertir al formato que espera el backend
      const backendHistory = history
        // Omitir el primer mensaje de bienvenida para ahorrar tokens (opcional), pero lo enviaremos por simplicidad
        .map(h => ({ role: h.role, text: h.text }));

      const data = await chatWithAssistant(userMsg, backendHistory);
      
      setHistory(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', text: data.response }
      ]);
    } catch (error) {
      console.error('Error enviando mensaje al chatbot:', error);
      setHistory(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', text: 'Ups, tuve un problema para conectarme. Por favor, intenta de nuevo.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 sm:w-96 h-[500px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 origin-bottom-left">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 flex items-center justify-between text-white shrink-0 shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">NutriAsistente</h3>
                <p className="text-xs text-white/80 font-medium">En línea</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
            <div className="flex flex-col gap-4">
              {history.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-emerald-600'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div 
                    className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none prose prose-sm prose-p:my-1 prose-ul:my-1 prose-ul:pl-4'
                    }`}
                  >
                    {msg.role === 'bot' ? (
                      // Parsear un poco el texto con espacios y viñetas simples (al ser respuesta simple de Markdown)
                      <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-green-100 text-emerald-600 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-emerald-500" />
                    <span className="text-xs text-gray-500 font-medium">Pensando...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="w-10 h-10 shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} w-14 h-14 bg-gradient-to-tr from-emerald-600 to-green-500 rounded-full shadow-xl shadow-green-200/50 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-50 absolute bottom-0 left-0`}
      >
        <MessageCircle size={28} />
      </button>

    </div>
  );
};

export default Chatbot;
