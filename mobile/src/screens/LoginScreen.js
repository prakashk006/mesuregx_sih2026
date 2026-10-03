import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../config/env';
import { COLORS, SHADOWS } from '../theme/theme';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('officer@mesuregx.demo');
  const [password, setPassword] = useState('Officer@123');
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Authentication Failed', err.message);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  const handleSaveServerUrl = () => {
    setApiBaseUrl(serverUrl);
    setShowServerModal(false);
    Alert.alert('Server Configured', `API Base URL updated to:\n${getApiBaseUrl()}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>MEASUREGX</Text>
          <Text style={styles.subTitle}>FIELD VERIFICATION SUITE</Text>
          <Text style={styles.departmentText}>
            Department of Consumer Affairs • Legal Metrology
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Official Field Login</Text>
          <Text style={styles.cardSub}>
            Sign in with your Legal Metrology Officer (LMO) or Authorized GATC laboratory credentials.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Official Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. officer@mesuregx.demo"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your security password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In to Field Terminal</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Fill Buttons */}
          <Text style={styles.quickFillHeader}>QUICK EVALUATOR PROFILES</Text>
          <View style={styles.quickFillRow}>
            <TouchableOpacity
              style={styles.quickFillBtn}
              onPress={() => fillCredentials('officer@mesuregx.demo', 'Officer@123')}
            >
              <Text style={styles.quickFillText}>LMO Officer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickFillBtn}
              onPress={() => fillCredentials('gatc@mesuregx.demo', 'Gatc@123')}
            >
              <Text style={styles.quickFillText}>GATC Lab</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickFillBtn}
              onPress={() => fillCredentials('admin@mesuregx.demo', 'Admin@123')}
            >
              <Text style={styles.quickFillText}>Admin</Text>
            </TouchableOpacity>
          </View>

          {/* Server Settings Link */}
          <TouchableOpacity
            style={styles.serverSettingsLink}
            onPress={() => setShowServerModal(!showServerModal)}
          >
            <Text style={styles.serverSettingsText}>
              ⚙️ Server Endpoint: {getApiBaseUrl()}
            </Text>
          </TouchableOpacity>

          {showServerModal && (
            <View style={styles.serverConfigBox}>
              <Text style={styles.serverConfigLabel}>Configured API Gateway URL:</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://192.168.1.X:5000/api"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity
                style={styles.saveServerBtn}
                onPress={handleSaveServerUrl}
              >
                <Text style={styles.saveServerBtnText}>Apply Server URL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 1.5,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  departmentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.small,
  },
  loginBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  quickFillHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  quickFillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickFillBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  serverSettingsLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  serverSettingsText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  serverConfigBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serverConfigLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  saveServerBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveServerBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
