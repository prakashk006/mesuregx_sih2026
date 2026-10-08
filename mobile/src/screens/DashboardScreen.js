import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAssignmentsApi } from '../services/api';
import {
  getCachedAssignments,
  saveCachedAssignments,
  getOfflineQueue,
} from '../services/offlineStorage';
import { COLORS, SHADOWS } from '../theme/theme';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [offlineCount, setOfflineCount] = useState(0);

  const isGatc = user?.role === 'GATC';

  const loadDashboardData = async () => {
    try {
      // 1. Check offline queue count
      const queue = await getOfflineQueue();
      const pendingRecords = queue.filter(
        (q) => q.syncStatus === 'LOCAL' || q.syncStatus === 'SYNC_PENDING'
      );
      setOfflineCount(pendingRecords.length);

      // 2. Fetch assignments from API or fallback to cached
      try {
        const res = await getAssignmentsApi('ALL');
        const list = Array.isArray(res?.data?.assignments)
          ? res.data.assignments
          : Array.isArray(res?.assignments)
          ? res.assignments
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setAssignments(list);
        await saveCachedAssignments(list);
        setIsOnline(true);
      } catch (networkErr) {
        setIsOnline(false);
        const cached = await getCachedAssignments();
        setAssignments(cached || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const pendingCount = assignments.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'ASSIGNED'
  ).length;
  const inProgressCount = assignments.filter(
    (a) => a.status === 'IN_PROGRESS' || a.application?.status === 'IN_PROGRESS'
  ).length;
  const completedCount = assignments.filter(
    (a) => a.status === 'COMPLETED' || a.application?.status === 'VERIFIED'
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing Field Console...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Officer Header Card - Govt Dark Blue */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.officerName}>{user?.name || 'Field Officer'}</Text>
            <Text style={styles.officerRole}>
              {isGatc
                ? `${user?.gatc?.name || 'GATC Laboratory'} (${user?.gatc?.gatcCode || 'GATC-AUTH'})`
                : `${user?.officer?.designation || 'Legal Metrology Officer'} • ${user?.officer?.officerCode || 'TN-LMO'}`}
            </Text>
          </View>
          <View
            style={[
              styles.statusChip,
              { backgroundColor: isOnline ? COLORS.successBg : COLORS.errorBg },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? COLORS.success : COLORS.error },
              ]}
            />
            <Text
              style={[
                styles.statusChipText,
                { color: isOnline ? COLORS.success : COLORS.error },
              ]}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <Text style={styles.jurisdictionText}>
          📍 Jurisdiction: {user?.officer?.district || user?.gatc?.district || 'Tamil Nadu State'}
        </Text>
      </View>

      {/* Offline Alert Banner if items pending */}
      {offlineCount > 0 && (
        <TouchableOpacity
          style={styles.offlineAlertCard}
          onPress={() => navigation.navigate('SyncQueue')}
          activeOpacity={0.85}
        >
          <View style={styles.offlineAlertRow}>
            <Text style={styles.offlineAlertIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.offlineAlertTitle}>
                {offlineCount} Field Inspections Saved Locally
              </Text>
              <Text style={styles.offlineAlertSub}>
                Ready to sync certificates to central sovereign cloud ledger.
              </Text>
            </View>
            <View style={styles.syncNowBtnBadge}>
              <Text style={styles.syncNowBtnText}>SYNC NOW →</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Stats Grid - Pure White Surface Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { borderLeftColor: COLORS.primary, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Pending Visits</Text>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{pendingCount}</Text>
          <Text style={styles.statSub}>Assigned on queue</Text>
        </View>

        <View style={[styles.statBox, { borderLeftColor: COLORS.warning, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>In Verification</Text>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{inProgressCount}</Text>
          <Text style={styles.statSub}>Readings in progress</Text>
        </View>

        <View style={[styles.statBox, { borderLeftColor: COLORS.success, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{completedCount}</Text>
          <Text style={styles.statSub}>Certificates verified</Text>
        </View>

        <View style={[styles.statBox, { borderLeftColor: COLORS.info, borderLeftWidth: 4 }]}>
          <Text style={styles.statLabel}>Offline Queue</Text>
          <Text style={[styles.statValue, { color: COLORS.info }]}>{offlineCount}</Text>
          <Text style={styles.statSub}>Local records</Text>
        </View>
      </View>

      {/* Quick Action Buttons - Light Blue Pills */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Assignments')}
        >
          <Text style={styles.actionBtnIcon}>📋</Text>
          <Text style={styles.actionBtnText}>Field Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Lookup')}
        >
          <Text style={styles.actionBtnIcon}>🔍</Text>
          <Text style={styles.actionBtnText}>Lookup Machine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('SyncQueue')}
        >
          <Text style={styles.actionBtnIcon}>🔄</Text>
          <Text style={styles.actionBtnText}>Sync Queue</Text>
        </TouchableOpacity>
      </View>

      {/* Next Up Schedule Preview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Scheduled Field Inspections</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Assignments')}>
          <Text style={styles.seeAllText}>View All ({assignments.length})</Text>
        </TouchableOpacity>
      </View>

      {assignments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No field assignments currently queued.</Text>
        </View>
      ) : (
        assignments.slice(0, 3).map((item) => {
          const app = item.application || {};
          const inst = app.instrument || {};
          const biz = app.business || {};

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.inspectionCard}
              onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}
            >
              <View style={styles.inspectionCardHeader}>
                <Text style={styles.appNumber}>{app.applicationNumber || 'APP-2026'}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{item.status || 'SCHEDULED'}</Text>
                </View>
              </View>

              <Text style={styles.bizName}>{biz.businessName || 'Commercial Establishment'}</Text>
              <Text style={styles.bizLocation}>📍 {app.location || biz.address || 'Field Location'}</Text>

              <View style={styles.instrumentMeta}>
                <Text style={styles.instrumentMetaText}>
                  ⚖️ {typeof inst.instrumentType === 'object' ? (inst.instrumentType?.name || inst.instrumentType?.code || 'Scale') : (inst.instrumentType || 'Scale')} ({inst.capacity} {inst.capacityUnit} • Class {inst.accuracyClass || 'III'})
                </Text>
                <Text style={styles.dateMetaText}>
                  📅 {new Date(item.scheduledDate || app.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  headerCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  officerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  officerRole: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginTop: 2,
  },
  jurisdictionText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  offlineAlertCard: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  offlineAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineAlertIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  offlineAlertTitle: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 13,
  },
  offlineAlertSub: {
    color: '#B45309',
    fontSize: 11,
    marginTop: 2,
  },
  syncNowBtnBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  syncNowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    ...SHADOWS.small,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  actionBtnIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionBtnText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  inspectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  inspectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  bizName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bizLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  instrumentMeta: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  instrumentMetaText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  dateMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
