import { useEffect, useState } from 'react';
import api from '../../api/api';

interface HistoryItem {
  id: number;
  recipeName: string;
  date: string;
  rating: number;
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/history');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h1>Historial</h1>

      {history.map((item) => (
        <div key={item.id}>
          <h2>{item.recipeName}</h2>
          <p>{item.date}</p>
          <p>Rating: {item.rating}</p>
        </div>
      ))}
    </div>
  );
}