import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Purge expired/invalid tokens on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Health check
export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Auth API Calls
export const registerUserApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUserApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Profile API Calls
export const getUserProfileApi = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfileApi = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const getDashboardSummaryApi = async () => {
  const response = await api.get('/users/dashboard-summary');
  return response.data;
};

// Skills API Calls
export const getSkillsApi = async () => {
  const response = await api.get('/skills');
  return response.data;
};

export const addSkillApi = async (skillData) => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

export const updateSkillApi = async (id, proficiency) => {
  const response = await api.put(`/skills/${id}`, { proficiency });
  return response.data;
};

export const deleteSkillApi = async (id) => {
  const response = await api.delete(`/skills/${id}`);
  return response.data;
};

// Careers API Calls
export const getCareersApi = async (search = '') => {
  const url = search ? `/careers?search=${encodeURIComponent(search)}` : '/careers';
  const response = await api.get(url);
  return response.data;
};

export const getCareerByIdApi = async (id) => {
  const response = await api.get(`/careers/${id}`);
  return response.data;
};

export const selectCareerApi = async (id) => {
  const response = await api.post(`/careers/${id}/select`);
  return response.data;
};

export const compareCareersApi = async (careerTitles = [], careerIds = []) => {
  const response = await api.post('/careers/compare', { careerTitles, careerIds });
  return response.data;
};


// Skill Gap Analysis API Calls
export const analyzeSkillGapApi = async (careerTitle = '') => {
  const response = await api.post('/skill-gap/analyze', { careerTitle });
  return response.data;
};

export const getSkillGapApi = async (userId = 'me') => {
  const response = await api.get(`/skill-gap/${userId}`);
  return response.data;
};

// Roadmap API Calls
export const generateRoadmapApi = async (targetCareer = '') => {
  const response = await api.post('/roadmaps/generate', { targetCareer });
  return response.data;
};

export const getRoadmapApi = async (userId = 'me') => {
  const response = await api.get(`/roadmaps/${userId}`);
  return response.data;
};

export const updateRoadmapProgressApi = async (roadmapId, phaseNumber, status) => {
  const response = await api.put(`/roadmaps/${roadmapId}/progress`, { phaseNumber, status });
  return response.data;
};

// Admin Panel API Calls
export const getAdminUsersApi = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getAdminStatisticsApi = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};

export const createCareerApi = async (careerData) => {
  const response = await api.post('/careers', careerData);
  return response.data;
};

export const updateCareerApi = async (id, careerData) => {
  const response = await api.put(`/careers/${id}`, careerData);
  return response.data;
};

export const deleteCareerApi = async (id) => {
  const response = await api.delete(`/careers/${id}`);
  return response.data;
};

export const getAdminCatalogSkillsApi = async () => {
  const response = await api.get('/admin/skills');
  return response.data;
};

export const createAdminCatalogSkillApi = async (skillData) => {
  const response = await api.post('/admin/skills', skillData);
  return response.data;
};

export const updateAdminCatalogSkillApi = async (id, skillData) => {
  const response = await api.put(`/admin/skills/${id}`, skillData);
  return response.data;
};

export const deleteAdminCatalogSkillApi = async (id) => {
  const response = await api.delete(`/admin/skills/${id}`);
  return response.data;
};

export default api;

