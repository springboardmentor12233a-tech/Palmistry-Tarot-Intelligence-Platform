import api from '../services/api';

export const getSpreads = () => api.get('/api/tarot/spreads');
export const getCards = () => api.get('/api/tarot/cards');
export const createReading = (data) => api.post('/api/tarot/readings', data);
export const shuffleDeck = (readingId) => api.post(`/api/tarot/readings/${readingId}/shuffle`);
export const selectCard = (readingId, data) => api.post(`/api/tarot/readings/${readingId}/select`, data);
export const getReading = (readingId) => api.get(`/api/tarot/readings/${readingId}`);
export const getHistory = () => api.get('/api/tarot/history');
