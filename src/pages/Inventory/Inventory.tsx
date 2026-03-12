import React from 'react';
//import IngredientForm from '../../components/IngredientForm/IngredientForm';

const Inventory = () => {
  return (
    <div className="inventory-container">

      <h1>Mi Alacena</h1>

      <input 
        type="search" 
        placeholder="Buscar ingredientes..."
      />

      <div className="ingredient-grid">

        <div className="ingredient-card-static">
          Leche - 1L
        </div>

        <div className="ingredient-card-static">
          Huevos - 12 unidades
        </div>

        <div className="ingredient-card-static">
          Arroz - 500g
        </div>

      </div>

      <h2>Agregar Nuevo Ingrediente</h2>

      {/* Aquí aparecerá el formulario que hará Irán */}
      {/* <IngredientForm /> */}

    </div>
  );
};

export default Inventory;