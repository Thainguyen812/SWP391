import { apiClient } from '../api/apiClient';

export const shiftService = {
  getShifts: async () => {
    return apiClient.get('/shifts');
  },
  
  handoverShift: async (shiftData) => {
    return apiClient.post('/shifts/handover', shiftData);
  }
};
