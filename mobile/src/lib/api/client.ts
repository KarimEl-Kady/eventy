import axios from 'axios';

// Use your machine's LAN IP so physical devices can reach the API
// Change this if your network IP changes
const BASE_URL = 'http://10.0.8.251:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
