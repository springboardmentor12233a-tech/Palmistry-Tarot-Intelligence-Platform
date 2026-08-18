import api from './api';

export const createReading = async () => {
  return await api.post('/api/readings');
};

export const getReadings = async () => {
  return await api.get('/api/readings');
};

export const getReading = async (id) => {
  return await api.get(`/api/readings/${id}`);
};

export const updateReading = async (id, data) => {
  return await api.patch(`/api/readings/${id}`, data);
};

export const generateSynthesis = async (reading_id) => {
  return await api.post('/api/ai/synthesis', { reading_id });
};

export const generatePDF = async (reading_id) => {
  return await api.post(`/api/reports/${reading_id}/generate`);
};
