import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the fssf_token cookie
});

export default api;
