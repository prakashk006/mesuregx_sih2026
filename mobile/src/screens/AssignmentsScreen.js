import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { getAssignmentsApi } from '../services/api';
import {
  getCachedAssignments,
  saveCachedAssignments,
} from '../services/offlineStorage';
import { COLORS, SHADOWS } from '../theme/theme';

export default function AssignmentsScreen({ navigation }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const loadAssignments = async () => {
    try {
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
      } catch (err) {
        // Fallback to offline cached records
        const cached = await getCachedAssignments();
        setAssignments(cached || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const filteredAssignments = assignments.filter((item) => {
    const isSched = item.status === 'SCHEDULED' || item.status === 'ASSIGNED' || item.status === 'PENDING' || item.application?.status === 'ASSIGNED' || item.application?.status === 'SCHEDULED';
    if (filter === 'SCHEDULED' && !isSched) return false;
    if (filter === 'IN_PROGRESS' && item.status !== 'IN_PROGRESS' && item.application?.status !== 'IN_PROGRESS') return false;
    if (filter === 'COMPLETED' && item.status !== 'COMPLETED' && item.application?.status !== 'VERIFIED' && item.application?.status !== 'CERTIFICATE_ISSUED') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const appNo = item.application?.applicationNumber?.toLowerCase() || '';
      const bizName = item.application?.business?.businessName?.toLowerCase() || '';
      const inst = item.application?.instrument?.customId?.toLowerCase() || '';
      return appNo.includes(q) || bizName.includes(q) || inst.includes(q);
    }

    return true;
  });

  const renderItem = ({ item }) => {
    const app = item.application || {};
    const inst = app.instrument || {};
    const biz = app.business || {};

    const isPending = item.status === 'SCHEDULED' || item.status === 'ASSIGNED';
    const isInProgress = item.status === 'IN_PROGRESS' || app.status === 'IN_PROGRESS';
    const isCompleted = item.status === 'COMPLETED' || app.status === 'VERIFIED';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.appNo}>{app.applicationNumber || 'APP-2026'}</Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isCompleted
                  ? COLORS.successBg
                  : isInProgress
                  ? COLORS.warningBg
                  : COLORS.primaryLight,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isCompleted ? COLORS.success : isInProgress ? COLORS.warning : COLORS.primaryDark,
                },
              ]}
            >
              {item.status || 'SCHEDULED'}
            </Text>
          </View>
        </View>

        <Text style={styles.bizName}>{biz.businessName || 'Business Establishment'}</Text>
        <Text style={styles.location}>📍 {app.location || biz.address || 'Field Location'}</Text>

        <View style={styles.specBox}>
          <Text style={styles.specLabel}>Instrument Spec:</Text>
          <Text style={styles.specValue}>
            {inst.customId || 'INST-001'} • {typeof inst.instrumentType === 'object' ? (inst.instrumentType?.name || inst.instrumentType?.code || 'Weighing Machine') : (inst.instrumentType || 'Weighing Machine')}
          </Text>
          <Text style={styles.specSub}>
            Capacity: {inst.capacity} {inst.capacityUnit} • Class {inst.accuracyClass || 'III'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            📅 {new Date(item.scheduledDate || app.createdAt).toLocaleDateString()} ({item.scheduledTime || '10:30 AM'})
          </Text>
          <Text style={styles.openLink}>Inspect →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by app #, establishment, machine..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs with Workload Counts */}
      <View style={styles.filterRow}>
        {[
          { key: 'ALL', label: `All (${assignments.length})` },
          { key: 'SCHEDULED', label: `Scheduled (${assignments.filter((a) => a.status === 'SCHEDULED' || a.status === 'ASSIGNED' || a.status === 'PENDING' || a.application?.status === 'ASSIGNED' || a.application?.status === 'SCHEDULED').length})` },
          { key: 'IN_PROGRESS', label: `In Progress (${assignments.filter((a) => a.status === 'IN_PROGRESS' || a.application?.status === 'IN_PROGRESS').length})` },
          { key: 'COMPLETED', label: `Completed (${assignments.filter((a) => a.status === 'COMPLETED' || a.application?.status === 'VERIFIED' || a.application?.status === 'CERTIFICATE_ISSUED').length})` },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading assigned visits...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No field inspections matching filter.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appNo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bizName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  specBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  specSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  openLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
