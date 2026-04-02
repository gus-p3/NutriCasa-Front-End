import React, { useEffect, useState } from "react";
import api from "../../api/api";

interface HistoryItem {
  _id: string;
  recipeName: string;
  cookedAt: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/history");
        setHistory(response.data.data?.history || []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Historial</h1>

      {/*  Loading */}
      {loading && <p className="text-gray-600">Cargando historial...</p>}

      {/*  Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Vacío */}
      {!loading && !error && history.length === 0 && (
        <p className="text-gray-600">
          No hay recetas en tu historial.
        </p>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.recipeName || "Receta Desconocida"}</h2>
            <p className="text-gray-600">{new Date(item.cookedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;