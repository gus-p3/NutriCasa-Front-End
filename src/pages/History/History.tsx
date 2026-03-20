import React from "react";

const History: React.FC = () => {
  const historyData = [
    {
      id: 1,
      name: "Ensalada saludable",
      date: "2026-03-17",
    },
    {
      id: 2,
      name: "Pollo a la plancha",
      date: "2026-03-16",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Historial</h1>

      <div className="space-y-4">
        {historyData.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;