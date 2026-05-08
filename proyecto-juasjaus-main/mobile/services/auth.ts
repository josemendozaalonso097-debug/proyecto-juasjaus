import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('access_token', response.data.access_token);
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  await AsyncStorage.setItem('access_token', response.data.access_token);
  return response.data;
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user');
};
