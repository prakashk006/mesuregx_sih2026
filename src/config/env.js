// Centralized API Base URL configuration for MEASUREGX Mobile
// When running in Android Emulator, 10.0.2.2 maps to localhost:5000 on the host PC.
// For physical devices on the same Wi-Fi, set the host PC's LAN IP (e.g. 192.168.1.5).

import { Platform } from 'react-native';

const DEFAULT_SERVER_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  web: 'http://localhost:5000/api',
  default: 'http://10.0.2.2:5000/api',
});

let currentBaseUrl = DEFAULT_SERVER_URL;

export function getApiBaseUrl() {
  return currentBaseUrl;
}

export function setApiBaseUrl(newUrl) {
  if (!newUrl) return;
  let formatted = newUrl.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `http://${formatted}`;
  }
  if (!formatted.endsWith('/api')) {
    formatted = `${formatted.replace(/\/$/, '')}/api`;
  }
  currentBaseUrl = formatted;
  return currentBaseUrl;
}

export default {
  getApiBaseUrl,
  setApiBaseUrl,
  DEFAULT_SERVER_URL,
};
