const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const shiftService = {
  getShifts: async () => {
    try {
      const response = await fetch(`${API_URL}/shifts`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch shifts from backend, using fallback:", error);
      return null;
    }
  },
  
  handoverShift: async (shiftData) => {
    try {
      const response = await fetch(`${API_URL}/shifts/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shiftData)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to post shift to backend:", error);
      return null;
    }
  }
};
