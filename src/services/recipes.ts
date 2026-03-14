import api from './api';

export const getSuggestedRecipes = async () => {

  const email = localStorage.getItem("email");

  try {

    const res = await api.get('/recipes/suggested', {
      params: {
        email: email,
        t: Date.now()   // evita cache
      }
    });

    return res.data;

  } catch (err: any) {
    console.error('Error fetching suggested recipes:', err.response?.data || err.message);
    throw err;
  }

};