import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:      (data) => api.post('/auth/login', data),
  me:         ()     => api.get('/auth/me'),
  getUsers:   ()     => api.get('/auth/users'),
  register:   (data) => api.post('/auth/register', data),
  updateRole: (id, role) => api.patch(`/auth/users/${id}/role`, { role }),
  deleteUser: (id)   => api.delete(`/auth/users/${id}`),
};

export const equipmentAPI = {
  getHistory: (id) => api.get(`/equipment/${id}/history`),
  getAll:  (params)   => api.get('/equipment', { params }),
  getOne:  (id)       => api.get(`/equipment/${id}`),
  create:  (data)     => api.post('/equipment', data),
  update:  (id, data) => api.put(`/equipment/${id}`, data),
  delete:  (id)       => api.delete(`/equipment/${id}`),
};

export const filesAPI = {
  getAll:  (equipmentId) => api.get('/files', { params: { equipment: equipmentId } }),
  create:  (data)        => api.post('/files', data),
  delete:  (id)          => api.delete(`/files/${id}`),
};

export const issuesAPI = {
  getAll:      (equipmentId) => api.get('/issues', { params: { equipment: equipmentId } }),
  getAllGlobal: ()            => api.get('/issues'),
  create:      (data)        => api.post('/issues', data),
  update:      (id, data)    => api.patch(`/issues/${id}`, data),
  delete:      (id)          => api.delete(`/issues/${id}`),
};

export const commentsAPI = {
  getAll:  (equipmentId) => api.get('/comments', { params: { equipment: equipmentId } }),
  create:  (data)        => api.post('/comments', data),
  delete:  (id)          => api.delete(`/comments/${id}`),
};

export const adminAPI = {
  getMaintenance: () => api.get('/admin/maintenance'),
  getStats:       ()              => api.get('/admin/stats'),
  getLogs:        ()              => api.get('/admin/logs?limit=100'),
  clearLogs:      ()              => api.delete('/admin/logs'),
  getSettings:    ()              => api.get('/admin/settings'),
  saveSettings:   (data)          => api.put('/admin/settings', data),
  export:         ()              => api.get('/admin/export', { responseType: 'blob' }),
  blockUser:      (id)            => api.patch(`/admin/users/${id}/block`),
  changePassword: (id, password)  => api.patch(`/admin/users/${id}/password`, { password }),
};

export const uploadAPI = {
  image: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const categoriesAPI = {
  getAll:  ()     => api.get('/categories'),
  create:  (data) => api.post('/categories', data),
  delete:  (id)   => api.delete(`/categories/${id}`),
};

export const onlineAPI = {
  ping:   () => api.post('/online/ping'),
  getAll: () => api.get('/online'),
};