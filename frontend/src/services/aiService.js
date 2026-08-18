import api from './api';

export const interpretPalm = async (features, reading_id) => {
  return await api.post('/api/ai/palm/interpret', { features, reading_id });
};

export const interpretTarot = async (data) => {};
export const generatePersonality = async (data) => {};
export const generateLifeTrends = async (data) => {};
export const generateRecommendations = async (data) => {};
export const generateSynthesis = async (data) => {};

export const chatWithReading = async (reading_id, question) => {
  return await api.post('/api/ai/chat', { reading_id, question });
};
