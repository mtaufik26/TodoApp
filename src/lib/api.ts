import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fe-test-api.nwappservice.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
