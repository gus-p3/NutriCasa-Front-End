import React, { useEffect, useState } from "react";

const History: React.FC = () => {

  // Estado para guardar datos
  const [history, setHistory] = useState<any[]>([]);

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Estado de error
  const [error, setError] = useState("");

  // Simular llamada a API
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Simulación de datos (como si vinieran del backend)
        const data = [
          { id: 1, name: "Tacos de pollo" },
          { id: 2, name: "Quesadillas" },
          { id: 3, name: "Ensalada" }
        ];

        setHistory(data);
      } catch (err) {
        setError("Error al cargar historial");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Mostrar carga
  if (loading) return <p>Cargando...</p>;

  // Mostrar error
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        Historial
      </h1>

      {/* Lista */}
      {history.map((item) => (
        <div key={item.id} className="mb-2">
          <p className="text-gray-700">
            {item.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default History;