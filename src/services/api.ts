import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

export const register = (data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) => api.post('/auth/register', data);

// Classes
export const getClasses = (params?: { type?: string; trainer?: string }) =>
  api.get('/classes', { params });

export const enrollClass = (sessionId: number) =>
  api.post('/classes/enroll', { session_id: sessionId });

export const cancelEnrollment = (sessionId: number) =>
  api.post('/classes/cancel', { session_id: sessionId });

// Trainers
export const getTrainers = () => api.get('/trainers');
export const getTrainer = (id: number) => api.get(`/trainers/${id}`);

// Equipment
export const getEquipment = () => api.get('/equipment');

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data: { name: string; email: string }) =>
  api.put('/profile', data);

// Reviews
export const submitReview = (sessionId: number, rating: number, comment: string) =>
  api.post('/reviews', { session_id: sessionId, rating, comment });

export default api;
