import { apiClient } from '../api/apiClient';

export const supportService = {
  getTickets: async () => {
    try {
      return await apiClient.get('/tickets');
    } catch (error) {
      console.error("Failed to fetch tickets from backend:", error);
      return [];
    }
  },
  
  createTicket: async (ticketData) => {
    try {
      return await apiClient.post('/tickets', ticketData);
    } catch (error) {
      console.error("Failed to post ticket to backend:", error);
      return null;
    }
  },

  resolveTicket: async (id) => {
    try {
      return await apiClient.put(/tickets//resolve);
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
      return null;
    }
  }
};