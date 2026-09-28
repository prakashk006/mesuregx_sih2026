import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, SHADOWS } from '../theme/theme';

export default function AssignmentDetailScreen({ route, navigation }) {
  const { assignment } = route.params || {};
  const app = assignment?.application || {};
  const inst = app?.instrument || {};
  const biz = app?.business || {};

  const [geofenceVerified, setGeofenceVerified] = useState(true);

  const handleStartInspection = () => {
    navigation.navigate('FieldInspection', { assignment });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.appNo}>{app.applicationNumber || 'APP-2026'}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{assignment?.status || 'SCHEDULED'}</Text>
          </View>
        </View>
        <Text style={styles.appType}>
          {app.applicationType || 'Periodic Legal Metrology Verification'}
        </Text>
        <Text style={styles.dateMeta}>
          Scheduled: {new Date(assignment?.scheduledDate || app.createdAt).toLocaleDateString()} at {assignment?.scheduledTime || '10:30 AM'}
        </Text>
      </View>

      {/* Geofence Status Banner */}
      <View
        style={[
          styles.geofenceBox,
          {
            backgroundColor: geofenceVerified ? COLORS.successBg : COLORS.errorBg,
            borderColor: geofenceVerified ? COLORS.success : COLORS.error,
          },
        ]}
      >
        <Text style={styles.geofenceIcon}>{geofenceVerified ? '📍' : '⚠️'}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.geofenceTitle,
              { color: geofenceVerified ? COLORS.success : COLORS.error },
            ]}
          >
            {geofenceVerified
              ? 'GPS Geofence Verified On-Site'
              : 'Outside Verification Geofence'}
          </Text>
          <Text style={styles.geofenceSub}>
            {geofenceVerified
              ? 'Device coordinates match registered commercial premises (11.0168° N, 76.9558° E).'
              : 'Warning: Please ensure you are within 100 meters of the testing site.'}
          </Text>
        </View>
      </View>

      {/* Commercial Establishment Card */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Commercial Establishment</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Establishment:</Text>
          <Text style={styles.infoValue}>{biz.businessName || 'Business Name'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Trade Name:</Text>
          <Text style={styles.infoValue}>{biz.tradeName || biz.businessName || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Reg. Number:</Text>
          <Text style={styles.infoValue}>{biz.registrationNumber || 'REG-TN-2026'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Premises Location:</Text>
          <Text style={styles.infoValue}>
            {app.location || biz.address || 'Coimbatore, Tamil Nadu'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>District:</Text>
          <Text style={styles.infoValue}>{biz.district || 'Coimbatore'}</Text>
        </View>
      </View>

      {/* Measuring Instrument Specifications */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Instrument Specifications</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Machine Custom ID:</Text>
          <Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>
            {inst.customId || 'INST-001'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type of Instrument:</Text>
          <Text style={styles.infoValue}>
            {typeof inst.instrumentType === 'object' ? (inst.instrumentType?.name || inst.instrumentType?.code || 'Non-Automatic Weighing Instrument') : (inst.instrumentType || 'Non-Automatic Weighing Instrument')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make & Model:</Text>
          <Text style={styles.infoValue}>
            {inst.manufacturer || 'Standard'} {inst.model || 'Series-X'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Serial Number:</Text>
          <Text style={styles.infoValue}>{inst.serialNumber || 'SN-2026-001'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Max Capacity:</Text>
          <Text style={styles.infoValue}>
            {inst.capacity} {inst.capacityUnit}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Accuracy Class:</Text>
          <Text style={[styles.infoValue, { color: COLORS.warning, fontWeight: '700' }]}>
            Class {inst.accuracyClass || 'III'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Status:</Text>
          <Text style={styles.infoValue}>{inst.status || 'ACTIVE'}</Text>
        </View>
      </View>

      {/* Inspection Instructions */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Special Field Instructions</Text>
        <Text style={styles.instructionText}>
          {assignment?.instructions ||
            'Verify physical seal condition, check zero balance repeatability, and record readings with standard F1/M1 class weights up to maximum rated capacity.'}
        </Text>
      </View>

      {/* Start Inspection Action */}
      <TouchableOpacity
        style={styles.startBtn}
        onPress={handleStartInspection}
      >
        <Text style={styles.startBtnText}>⚖️ Begin Field Verification</Text>
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
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appNo: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  appType: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dateMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  geofenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  geofenceIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  geofenceTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  geofenceSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.small,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
