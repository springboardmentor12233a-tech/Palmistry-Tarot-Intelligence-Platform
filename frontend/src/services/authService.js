import api from './api';

export const updateProfile = async (profileData) => {
  return await api.put('/api/auth/profile/update', profileData);
};

export const changePassword = async (passwordData) => {
  return await api.put('/api/auth/password/change', passwordData);
};
