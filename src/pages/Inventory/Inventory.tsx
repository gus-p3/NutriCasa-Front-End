import React from 'react';
//import IngredientForm from '../../components/IngredientForm/IngredientForm';

const Inventory = () => {
return (
  <div className="min-h-screen bg-gray-100 p-10">

    <h1 className="text-6xl text-green-500 font-bold">
  Mi Alacena
</h1>

    <div className="grid grid-cols-2 gap-8">

      {/* Formulario agregar ingrediente */}
      <div className="bg-green-800 text-white p-6 rounded-xl">

        <h2 className="text-2xl mb-6">Agregar ingrediente</h2>

        <input
          className="w-full p-2 mb-3 text-black rounded"
          placeholder="Nombre del ingrediente"
        />

        <input
          className="w-full p-2 mb-3 text-black rounded"
          placeholder="Cantidad"
        />

        <select className="w-full p-2 mb-3 text-black rounded">
          <option>gramos</option>
          <option>piezas</option>
          <option>litros</option>
        </select>

        <button className="bg-green-300 text-black px-4 py-2 rounded mt-3">
          Agregar
        </button>

      </div>

      {/* Lista de ingredientes */}
      <div className="bg-green-200 p-6 rounded-xl">

        <h2 className="text-2xl mb-4">Lista de ingredientes</h2>

        <ul className="space-y-2">
          <li>🥦 Brócoli - 2 piezas</li>
          <li>🍗 Pechuga de pollo - 1 kg</li>
        </ul>

      </div>

    </div>

  </div>
);
};

export default Inventory;