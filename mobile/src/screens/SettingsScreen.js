import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../config/env';
import api from '../services/api';
import { clearAllOfflineData } from '../services/offlineStorage';
import { COLORS, SHADOWS } from '../theme/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);

  const isGatc = user?.role === 'GATC';

  const handleSaveUrl = () => {
    setApiBaseUrl(serverUrl);
    Alert.alert('Configuration Saved', `API Base URL updated to:\n${getApiBaseUrl()}`);
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        Alert.alert('Connection Successful', `Connected to MEASUREGX Gateway!\nUser: ${res.data?.data?.user?.email}`);
      } else {
        Alert.alert('Gateway Responded', 'Connected to server, but authentication check returned invalid.');
      }
    } catch (err) {
      Alert.alert(
        'Connection Failed',
        `Could not reach gateway at:\n${getApiBaseUrl()}\n\nMake sure the Node.js backend is running on port 5000 and accessible.`
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Local Cache',
      'This will erase cached assignments and offline queue records on this mobile device. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await clearAllOfflineData();
            Alert.alert('Cache Cleared', 'All local offline cache has been reset.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Officer Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Official Credentials</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>
          {isGatc ? 'Authorized GATC Testing Officer' : 'Legal Metrology Officer (LMO)'}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Official Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{isGatc ? 'Facility Code:' : 'Badge / Officer Code:'}</Text>
          <Text style={styles.infoValue}>
            {user?.gatc?.gatcCode || user?.officer?.officerCode || 'TN-OFFICIAL'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jurisdiction District:</Text>
          <Text style={styles.infoValue}>
            {user?.gatc?.district || user?.officer?.district || 'Coimbatore'}
          </Text>
        </View>
      </View>

      {/* Gateway Configuration Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gateway Network Configuration</Text>
        <Text style={styles.cardSub}>
          Connects this field mobile app to the centralized Node.js API Gateway (Port 5000).
        </Text>

        {/* Pre-configured Auto Connection Indicator */}
        <View style={{ marginVertical: 8, padding: 10, backgroundColor: COLORS.successBg, borderRadius: 8, borderWidth: 1, borderColor: COLORS.success }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.success }}>
            ✅ Pre-configured & Ready by Default
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
            The app automatically connects to the database API gateway out of the box.
          </Text>
        </View>

        <Text style={styles.inputLabel}>Central API URL:</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.X:5000/api"
          placeholderTextColor={COLORS.textMuted}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
            <Text style={styles.saveBtnText}>Save URL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.testBtnText}>Test Ping</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Feature Explanations */}
        <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }}>
            💡 What are Save URL & Test Ping for?
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 }}>
            • <Text style={{ fontWeight: '700' }}>Save URL:</Text> Dynamically updates the backend server address (e.g., local Wi-Fi IP vs production cloud URL) without re-installing the mobile app.
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
            • <Text style={{ fontWeight: '700' }}>Test Ping:</Text> Used in zero-network villages to instantly test if the database server is reachable before attempting an online sync.
          </Text>
        </View>
      </View>

      {/* Storage Diagnostics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Local Offline Storage</Text>
        <Text style={styles.cardSub}>
          Manage locally cached assignments and pending verification queue records.
        </Text>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClearCache}>
          <Text style={styles.clearBtnText}>Reset Local Offline Cache</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Sign Out from Field Terminal</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 14,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  testBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  clearBtn: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  clearBtnText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontWeight: '700',
    fontSize: 14,
  },
});
