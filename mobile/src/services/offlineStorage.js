import AsyncStorage from '@react-native-async-storage/async-storage';

let memoryStore = {};

const storage = {
  getItem: async (key) => {
    try {
      if (AsyncStorage && AsyncStorage.getItem) {
        return await AsyncStorage.getItem(key);
      }
      return memoryStore[key] || null;
    } catch (e) {
      return memoryStore[key] || null;
    }
  },
  setItem: async (key, val) => {
    try {
      if (AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, val);
      }
      memoryStore[key] = val;
    } catch (e) {
      memoryStore[key] = val;
    }
  },
  removeItem: async (key) => {
    try {
      if (AsyncStorage && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
      }
      delete memoryStore[key];
    } catch (e) {
      delete memoryStore[key];
    }
  },
};

const KEYS = {
  ASSIGNMENTS: '@measuregx_cached_assignments',
  OFFLINE_QUEUE: '@measuregx_offline_inspections',
  AUTH_TOKEN: '@measuregx_jwt_token',
  AUTH_USER: '@measuregx_user_profile',
  SERVER_IP: '@measuregx_server_ip',
};

// --- Cached Assignments ---
export async function getCachedAssignments() {
  const data = await storage.getItem(KEYS.ASSIGNMENTS);
  return data ? JSON.parse(data) : [];
}

export async function saveCachedAssignments(assignments) {
  await storage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(assignments));
}

// --- Offline Inspections Queue (LOCAL -> SYNC_PENDING -> SYNCED) ---
export async function getOfflineQueue() {
  const data = await storage.getItem(KEYS.OFFLINE_QUEUE);
  return data ? JSON.parse(data) : [];
}

export async function saveOfflineInspection(inspection) {
  const queue = await getOfflineQueue();
  const existingIdx = queue.findIndex((q) => q.localId === inspection.localId || q.applicationId === inspection.applicationId);

  const record = {
    ...inspection,
    localId: inspection.localId || `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    syncStatus: inspection.syncStatus || 'LOCAL', // 'LOCAL' | 'SYNC_PENDING' | 'SYNCED' | 'FAILED'
    savedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = record;
  } else {
    queue.unshift(record);
  }

  await storage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  return record;
}

export async function markInspectionPending(localId) {
  const queue = await getOfflineQueue();
  const updated = queue.map((item) =>
    item.localId === localId ? { ...item, syncStatus: 'SYNC_PENDING' } : item
  );
  await storage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(updated));
}

export async function removeOfflineInspection(localId) {
  const queue = await getOfflineQueue();
  const filtered = queue.filter((item) => item.localId !== localId);
  await storage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
}

export async function clearAllOfflineData() {
  await storage.removeItem(KEYS.ASSIGNMENTS);
  await storage.removeItem(KEYS.OFFLINE_QUEUE);
}

// --- Sync Engine: Submit pending records to Backend ---
export async function syncAllPending(apiClient) {
  const queue = await getOfflineQueue();
  const pending = queue.filter((item) => item.syncStatus === 'LOCAL' || item.syncStatus === 'SYNC_PENDING');

  const results = {
    total: pending.length,
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const record of pending) {
    try {
      await markInspectionPending(record.localId);

      const payload = {
        applicationId: record.applicationId,
        instrumentId: record.instrumentId,
        testReadings: record.testReadings,
        overallResult: record.overallResult || 'PASS',
        officerDecision: record.overallResult || 'PASS',
        remarks: record.remarks ? `[OFFLINE SYNCED] ${record.remarks}` : '[OFFLINE SYNCED] Field Verification Complete',
        gpsLatitude: record.latitude || null,
        gpsLongitude: record.longitude || null,
        officerSignature: record.officerSignature || 'DIGITAL_SIG_OFFLINE',
        verificationDate: record.savedAt,
      };

      const res = await apiClient.post('/verification/submit', payload);

      if (res.data?.success) {
        // Mark as synced or remove from local queue
        await removeOfflineInspection(record.localId);
        results.success += 1;
      } else {
        results.failed += 1;
        results.errors.push(`App ${record.applicationId}: ${res.data?.message || 'Sync failed'}`);
      }
    } catch (err) {
      results.failed += 1;
      results.errors.push(`App ${record.applicationId}: ${err.response?.data?.message || err.message}`);
    }
  }

  return results;
}

// --- Auth Storage Helpers ---
export async function getStoredToken() {
  return await storage.getItem(KEYS.AUTH_TOKEN);
}

export async function setStoredToken(token) {
  if (token) {
    await storage.setItem(KEYS.AUTH_TOKEN, token);
  } else {
    await storage.removeItem(KEYS.AUTH_TOKEN);
  }
}

export async function getStoredUser() {
  const data = await storage.getItem(KEYS.AUTH_USER);
  return data ? JSON.parse(data) : null;
}

export async function setStoredUser(user) {
  if (user) {
    await storage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
  } else {
    await storage.removeItem(KEYS.AUTH_USER);
  }
}

export default {
  getCachedAssignments,
  saveCachedAssignments,
  getOfflineQueue,
  saveOfflineInspection,
  markInspectionPending,
  removeOfflineInspection,
  clearAllOfflineData,
  syncAllPending,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
};
