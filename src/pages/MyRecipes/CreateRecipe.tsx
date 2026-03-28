import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../../api/recipes.service';

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    prepTimeMinutes: '',
    estimatedCost: '',
    calories: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRecipe({
  title: form.title,
  description: form.description,
  prepTimeMinutes: Number(form.prepTimeMinutes),
  estimatedCost: Number(form.estimatedCost),
  nutrition: {
    calories: Number(form.calories),
    protein: 0,
    carbs: 0,
    fat: 0
  },
  category: 'comida',
  dietTypes: ['normal'],
  ingredients: [],
  steps: []
});

      alert('Receta creada');
      navigate('/my-recipes');

    } catch (error) {
      console.error(error);
      alert('Error al crear receta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-96">

        <h2 className="text-2xl font-bold mb-4">Crear Receta</h2>

        <input
          type="text"
          name="title"
          placeholder="Nombre"
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
        />

        <input
          type="text"
          name="description"
          placeholder="Descripción"
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
        />

        <input
          type="number"
          name="prepTimeMinutes"
          placeholder="Tiempo (min)"
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
        />

        <input
          type="number"
          name="estimatedCost"
          placeholder="Costo"
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
        />

        <input
          type="number"
          name="calories"
          placeholder="Calorías"
          className="w-full mb-3 p-2 border rounded"
          onChange={handleChange}
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Guardar
        </button>

      </form>
    </div>
  );
};

export default CreateRecipe;