import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import api from '../services/api';
import {
  getOfflineQueue,
  removeOfflineInspection,
  syncAllPending,
} from '../services/offlineStorage';
import { COLORS, SHADOWS } from '../theme/theme';

export default function SyncQueueScreen() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await getOfflineQueue();
      setQueue(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleSyncAll = async () => {
    if (queue.length === 0) {
      Alert.alert('Queue Empty', 'There are no pending offline inspections to synchronize.');
      return;
    }

    try {
      setSyncing(true);
      const results = await syncAllPending(api);
      await loadQueue();

      if (results.failed === 0) {
        Alert.alert(
          'Synchronization Complete',
          `Successfully synchronized ${results.success} field verification record(s) to the central Legal Metrology gateway!`
        );
      } else {
        Alert.alert(
          'Sync Completed with Warnings',
          `Success: ${results.success}\nFailed: ${results.failed}\n\n${results.errors.join('\n')}`
        );
      }
    } catch (e) {
      Alert.alert('Sync Error', 'An unexpected error occurred during cloud synchronization.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = (localId) => {
    Alert.alert(
      'Discard Record',
      'Are you sure you want to delete this locally saved inspection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeOfflineInspection(localId);
            await loadQueue();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isPending = item.syncStatus === 'LOCAL' || item.syncStatus === 'SYNC_PENDING';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.appNo}>{item.applicationNumber || 'APP-OFFLINE'}</Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isPending ? COLORS.warningBg : COLORS.successBg },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: isPending ? COLORS.warning : COLORS.success },
              ]}
            >
              {item.syncStatus}
            </Text>
          </View>
        </View>

        <Text style={styles.bizName}>{item.businessName || 'Business Establishment'}</Text>
        <Text style={styles.instMeta}>Machine ID: {item.instrumentCustomId || 'N/A'}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            Verdict: <Text style={{ color: item.overallResult === 'PASS' ? COLORS.success : COLORS.error, fontWeight: '700' }}>{item.overallResult}</Text>
          </Text>
          <Text style={styles.metaText}>
            Recorded: {new Date(item.savedAt).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.localIdText}>Local ID: {item.localId}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.localId)}>
            <Text style={styles.deleteLink}>Discard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Offline Field Verification Queue</Text>
        <Text style={styles.infoSub}>
          Inspections recorded without internet connectivity are buffered locally. Once connected to cellular or Wi-Fi, sync to register certificates centrally.
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>
            {queue.length} Record{queue.length === 1 ? '' : 's'} in Storage
          </Text>
        </View>
      </View>

      {/* Sync Button */}
      <TouchableOpacity
        style={[styles.syncBtn, (syncing || queue.length === 0) && { opacity: 0.6 }]}
        onPress={handleSyncAll}
        disabled={syncing || queue.length === 0}
      >
        {syncing ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.syncBtnText}>
            🔄 Sync All Records to Gateway
          </Text>
        )}
      </TouchableOpacity>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Reading local storage...</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.localId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>Queue Clean & Synced</Text>
              <Text style={styles.emptySub}>
                All field inspection records are synchronized with the central database.
              </Text>
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
    padding: 16,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  syncBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.small,
  },
  syncBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  listContent: {
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
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
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  bizName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  instMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  localIdText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  deleteLink: {
    fontSize: 11,
    color: COLORS.error,
    fontWeight: '600',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
