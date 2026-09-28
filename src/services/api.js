// MEASUREGX Mobile Unified API Service
// Communicates with Central Node.js Gateway (Port 5000)

import axios from 'axios';
import { getApiBaseUrl } from '../config/env';
import { getStoredToken } from './offlineStorage';

const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach current Base URL and JWT Token
api.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl();
    const token = await getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export async function loginApi(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getProfileApi() {
  const res = await api.get('/auth/me');
  return res.data;
}

// --- Assignments Endpoints ---
export async function getAssignmentsApi(status = 'ALL') {
  const params = {};
  if (status && status !== 'ALL') params.status = status;
  const res = await api.get('/assignments', { params });
  return res.data;
}

export async function getApplicationDetailsApi(applicationId) {
  const res = await api.get(`/applications/${applicationId}`);
  return res.data;
}

// --- Verification & Calculation Endpoints ---
export async function evaluateReadingsApi(instrumentData, testReadings) {
  // Evaluates readings against OIML R 76-1 tolerances via Verification Engine
  const res = await api.post('/verifications/evaluate-live', {
    instrument: instrumentData,
    readings: testReadings,
  });
  return res.data;
}

export async function submitVerificationApi(payload) {
  const res = await api.post('/verifications/submit', payload);
  return res.data;
}

export async function uploadEvidenceApi(formData) {
  const res = await api.post('/verifications/upload-evidence', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// --- Instrument Lookup Endpoints ---
export async function lookupInstrumentApi(customIdOrSerial) {
  const res = await api.get('/instruments', {
    params: { search: customIdOrSerial },
  });
  return res.data;
}

export default api;
