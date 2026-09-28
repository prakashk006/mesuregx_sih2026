import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import api from '../services/api';
import { COLORS, SHADOWS } from '../theme/theme';

export default function InstrumentLookupScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (queryToUse) => {
    const term = (queryToUse || searchTerm).trim();
    if (!term) {
      Alert.alert('Search Required', 'Enter an instrument Custom ID, Serial Number, or Certificate Number.');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const res = await api.get('/instruments', { params: { search: term } });
      const list = res.data?.data?.instruments || [];
      if (list.length > 0) {
        setResult(list[0]);
      } else {
        setResult(null);
      }
    } catch (e) {
      Alert.alert('Lookup Error', 'Failed to retrieve instrument data from server.');
    } finally {
      setLoading(false);
    }
  };

  const simulateQrScan = (code) => {
    setSearchTerm(code);
    handleSearch(code);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Field Instrument Lookup & QR Scanner</Text>
        <Text style={styles.sub}>
          Verify authenticity, view certification lifecycle, and inspect current validity status of any commercial instrument on-site.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter Custom ID, Serial #, or Cert #"
            placeholderTextColor={COLORS.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => handleSearch()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* QR Simulation Presets */}
        <Text style={styles.presetLabel}>SIMULATE QR SCANNER READINGS:</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => simulateQrScan('INST-TN-CBE-000001')}
          >
            <Text style={styles.presetBtnText}>📷 QR: Scale #001</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => simulateQrScan('INST-TN-CBE-000002')}
          >
            <Text style={styles.presetBtnText}>📷 QR: Platform Scale</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result Display */}
      {result ? (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.resultCustomId}>{result.customId}</Text>
              <Text style={styles.resultType}>
                {typeof result.instrumentType === 'object' ? (result.instrumentType?.name || result.instrumentType?.code || 'Weighing Instrument') : (result.instrumentType || 'Weighing Instrument')}
              </Text>
            </View>
            <View
              style={[
                styles.validityBadge,
                {
                  backgroundColor:
                    result.status === 'VERIFIED'
                      ? COLORS.successBg
                      : COLORS.errorBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.validityBadgeText,
                  { color: result.status === 'VERIFIED' ? COLORS.success : COLORS.error },
                ]}
              >
                {result.status || 'UNVERIFIED'}
              </Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Manufacturer:</Text>
              <Text style={styles.detailValue}>{result.manufacturer || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Model:</Text>
              <Text style={styles.detailValue}>{result.model || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Serial Number:</Text>
              <Text style={styles.detailValue}>{result.serialNumber || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Capacity & Class:</Text>
              <Text style={styles.detailValue}>
                {result.capacity} {result.capacityUnit} • Class {result.accuracyClass || 'III'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Commercial Owner:</Text>
              <Text style={styles.detailValue}>{result.business?.businessName || 'N/A'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>District:</Text>
              <Text style={styles.detailValue}>{result.business?.district || 'Coimbatore'}</Text>
            </View>
          </View>

          {/* Active Certificate Info */}
          {result.certificates && result.certificates.length > 0 ? (
            <View style={styles.certBox}>
              <Text style={styles.certTitle}>Active Legal Metrology Certificate</Text>
              <Text style={styles.certNo}>{result.certificates[0].certificateNumber}</Text>
              <Text style={styles.certMeta}>
                Valid Until: {new Date(result.certificates[0].expiryDate).toLocaleDateString()}
              </Text>
              <Text style={styles.certAuthority}>
                Issued by: {result.certificates[0].issuedByType === 'GATC' ? 'Authorized GATC Lab' : 'Legal Metrology Officer'}
              </Text>
            </View>
          ) : (
            <View style={styles.noCertBox}>
              <Text style={styles.noCertText}>No active verification certificate on record.</Text>
            </View>
          )}
        </View>
      ) : searched && !loading ? (
        <View style={styles.notFoundCard}>
          <Text style={styles.notFoundTitle}>Instrument Not Found</Text>
          <Text style={styles.notFoundSub}>
            No measuring device matching "{searchTerm}" was found on the statewide registry.
          </Text>
        </View>
      ) : null}

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
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  presetLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetBtnText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  resultCustomId: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resultType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  validityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  validityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  detailGrid: {
    gap: 8,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  certBox: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 10,
    padding: 12,
  },
  certTitle: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  certNo: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  certMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  certAuthority: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  noCertBox: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    padding: 10,
  },
  noCertText: {
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
  },
  notFoundCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  notFoundTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notFoundSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
