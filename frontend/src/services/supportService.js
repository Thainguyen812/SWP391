const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const supportService = {
  getTickets: async () => {
    try {
      const response = await fetch(`${API_URL}/tickets`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch tickets from backend, using fallback:", error);
      return null; // Return null so frontend uses mock data fallback
    }
  },
  
  createTicket: async (ticketData) => {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to post ticket to backend:", error);
      return null;
    }
  }
};
