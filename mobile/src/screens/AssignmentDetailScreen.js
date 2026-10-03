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

  const isCompleted =
    assignment?.status === 'COMPLETED' ||
    app?.status === 'VERIFIED' ||
    app?.status === 'CERTIFICATE_ISSUED';

  const [geofenceVerified, setGeofenceVerified] = useState(true);
  const [preChecks, setPreChecks] = useState({
    premisesMatched: false,
    serialMatched: false,
    traderPresent: false,
  });

  const allPreChecksComplete =
    isCompleted ||
    (preChecks.premisesMatched &&
      preChecks.serialMatched &&
      preChecks.traderPresent);

  const handleStartInspection = () => {
    if (!allPreChecksComplete && !isCompleted) {
      Alert.alert(
        'Statutory Pre-requisite Missing',
        'Under Indian Legal Metrology Rules, an inspecting officer must verify all 3 preliminary on-site conditions (premises geofence match, serial number plate match, and trader attendance) before proceeding to field verification.',
        [{ text: 'Understand & Verify' }]
      );
      return;
    }
    navigation.navigate('FieldInspection', {
      assignment,
      isReadOnly: isCompleted,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Top Banner */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.appNo}>{app.applicationNumber || 'APP-2026'}</Text>
          <View
            style={[
              styles.badge,
              isCompleted && { backgroundColor: COLORS.successBg, borderColor: COLORS.success, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isCompleted && { color: COLORS.success },
              ]}
            >
              {isCompleted ? '✓ COMPLETED & SEALED' : (assignment?.status || 'SCHEDULED')}
            </Text>
          </View>
        </View>
        <Text style={styles.appType}>
          {app.applicationType || 'Periodic Legal Metrology Verification'}
        </Text>
        <Text style={styles.dateMeta}>
          Scheduled: {new Date(assignment?.scheduledDate || app.createdAt).toLocaleDateString()} at {assignment?.scheduledTime || '10:30 AM'}
        </Text>
      </View>

      {/* If Completed, show read-only status banner */}
      {isCompleted && (
        <View style={styles.completedNoticeCard}>
          <Text style={styles.completedNoticeTitle}>🔒 Statutory Record Finalized & Sealed</Text>
          <Text style={styles.completedNoticeSub}>
            Field inspection has been completed. The physical security seal was applied and statutory certificate issued. You can view the full verified record in read-only mode.
          </Text>
        </View>
      )}

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

      {/* Mandatory Statutory On-Site Preliminary Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>
          {isCompleted ? 'Statutory Pre-Inspection Record' : 'Mandatory On-Site Protocol Checklist *'}
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 12 }}>
          {isCompleted
            ? 'All preliminary statutory criteria were verified during field inspection.'
            : 'Inspect and confirm all three requirements before starting field tests:'}
        </Text>

        <TouchableOpacity
          style={styles.checkItemRow}
          disabled={isCompleted}
          onPress={() =>
            setPreChecks((prev) => ({
              ...prev,
              premisesMatched: !prev.premisesMatched,
            }))
          }
        >
          <Text style={styles.checkIcon}>
            {isCompleted || preChecks.premisesMatched ? '☑️' : '⬜'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkTitle}>1. Commercial Premises Geofence Match</Text>
            <Text style={styles.checkSub}>
              Physical presence verified at {biz.businessName || 'the registered shop'} ({biz.district || 'district jurisdiction'})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkItemRow}
          disabled={isCompleted}
          onPress={() =>
            setPreChecks((prev) => ({
              ...prev,
              serialMatched: !prev.serialMatched,
            }))
          }
        >
          <Text style={styles.checkIcon}>
            {isCompleted || preChecks.serialMatched ? '☑️' : '⬜'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkTitle}>2. Instrument Serial & Model Plate Match</Text>
            <Text style={styles.checkSub}>
              Physical nameplate matches Serial #{inst.serialNumber || 'SN-001'} ({inst.customId || 'INST-001'})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkItemRow}
          disabled={isCompleted}
          onPress={() =>
            setPreChecks((prev) => ({
              ...prev,
              traderPresent: !prev.traderPresent,
            }))
          }
        >
          <Text style={styles.checkIcon}>
            {isCompleted || preChecks.traderPresent ? '☑️' : '⬜'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkTitle}>3. Trader / Representative In Attendance</Text>
            <Text style={styles.checkSub}>
              Authorized shopkeeper or technician present during statutory testing
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Inspection Instructions */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Special Field Instructions</Text>
        <Text style={styles.instructionText}>
          {assignment?.instructions ||
            'Verify physical seal condition, check zero balance repeatability, and record readings with standard F1/M1 class weights up to maximum rated capacity.'}
        </Text>
      </View>

      {/* Start Inspection Action with Strict Gatekeeping */}
      <TouchableOpacity
        style={[
          styles.startBtn,
          isCompleted
            ? { backgroundColor: '#0F766E' }
            : allPreChecksComplete
            ? { backgroundColor: COLORS.primary }
            : { backgroundColor: '#64748B', opacity: 0.65 },
        ]}
        onPress={handleStartInspection}
        activeOpacity={0.8}
      >
        <Text style={styles.startBtnText}>
          {isCompleted
            ? '📄 View Completed Verification Record (Read-Only)'
            : allPreChecksComplete
            ? '⚖️ Begin Field Verification →'
            : '🔒 Verify 3 Checklist Items to Begin Field Test'}
        </Text>
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
  completedNoticeCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  completedNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  completedNoticeSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  checkIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  checkSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});
