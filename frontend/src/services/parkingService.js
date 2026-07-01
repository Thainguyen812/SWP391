import { apiClient } from '../api/apiClient';

export const parkingService = {
  // 1. AI Check-in
  aiCheckIn: async (data) => {
    return apiClient.post('/v1/parking/check-in/ai', data);
  },
  
  // 3. Visitor Check-in
  visitorCheckIn: async (data) => {
    return apiClient.post('/v1/parking/check-in/visitor', data);
  },

  // 4. Checkout
  checkoutByCardId: async (cardId) => {
    return apiClient.post(`/v1/parking/checkout/${cardId}`);
  },

  checkoutByCode: async (cardCode) => {
    return apiClient.post(`/v1/parking/checkout-by-code/${cardCode}`);
  },
  
  confirmCheckout: async (transactionId) => {
    return apiClient.post(`/v1/parking/checkout/confirm/${transactionId}`);
  },

  // 8. Monitoring Map
  getMonitoringMap: async () => {
    return apiClient.get('/v1/parking/monitoring/map');
  }
};
