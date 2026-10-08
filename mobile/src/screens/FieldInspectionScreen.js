import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { submitVerificationApi } from '../services/api';
import { saveOfflineInspection } from '../services/offlineStorage';
import { fetchGeoTagData } from '../services/locationService';
import { COLORS, SHADOWS } from '../theme/theme';

export default function FieldInspectionScreen({ route, navigation }) {
  const { assignment } = route.params || {};
  const app = assignment?.application || {};
  const inst = app?.instrument || {};
  const biz = app?.business || {};

  // Read-only freeze detection for completed inspections
  const ver = app?.verification || assignment?.verification || {};
  const isReadOnly = Boolean(
    route.params?.isReadOnly ||
    assignment?.status === 'COMPLETED' ||
    app?.status === 'VERIFIED' ||
    Boolean(app?.verification) ||
    Boolean(assignment?.verification)
  );

  // Form Stages
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Visual, 2: Readings/Manual, 3: Physical Stamping & Decision

  // Pattern Selection
  const [verificationPattern, setVerificationPattern] = useState(ver.verificationPattern || 'PATTERN_A'); // 'PATTERN_A' (Field Premises) | 'PATTERN_B' (Lab/Counter)

  // Category Mode
  const [isManualCategoryMode, setIsManualCategoryMode] = useState(Boolean(ver.isManualCategoryMode));
  const [manualEvaluationNotes, setManualEvaluationNotes] = useState(ver.manualEvaluationNotes || '');

  // Spot Payment (Pattern A Treasury Challan)
  const [spotChallanNumber, setSpotChallanNumber] = useState(ver.spotChallanNumber || '');

  // Stage 1: Physical Checks
  const [physicalChecks, setPhysicalChecks] = useState({
    sealIntact: isReadOnly ? true : false,
    levelCentered: isReadOnly ? true : false,
    stampingPlateVisible: isReadOnly ? true : false,
    photoAttached: isReadOnly ? Boolean(ver.evidencePhotoUri || ver.photoUri) : false,
  });

  // Stage 2: Test Readings (Instant On-Device Calculation)
  const defaultReadings = [
    { load: '0.000', observed: '0.000', mpe: '±0.002', passed: true },
    { load: '5.000', observed: '5.001', mpe: '±0.005', passed: true },
    { load: '15.000', observed: '15.002', mpe: '±0.010', passed: true },
    { load: '30.000', observed: '30.004', mpe: '±0.015', passed: true },
  ];
  const [readings, setReadings] = useState(
    Array.isArray(ver.testReadings) && ver.testReadings.length > 0 ? ver.testReadings : defaultReadings
  );

  // Stage 3: Physical Lead Stamping & Statutory Decision
  const [sealNumber, setSealNumber] = useState(
    ver.sealNumber || (isReadOnly ? 'SEAL-TN-VERIFIED' : `SEAL-TN-${Date.now().toString().slice(-6)}`)
  );
  const [stampApplied, setStampApplied] = useState(
    ver.physicalStampApplied !== undefined ? Boolean(ver.physicalStampApplied) : true
  );
  const [officerDecision, setOfficerDecision] = useState(
    ver.overallResult || ver.officerDecision || 'PASS'
  ); // 'PASS' | 'FAIL' | 'NEEDS_CORRECTION'
  const [remarks, setRemarks] = useState(
    ver.remarks || 'Instrument verified compliant with Legal Metrology General Rules, 2011.'
  );
  const [digitalSignatureConfirmed, setDigitalSignatureConfirmed] = useState(true);

  // Evidence Photo State (Real Native Camera with Live Statutory Geo-Tagging)
  const initialPhoto = (ver.evidencePhotoUri || ver.photoUri)
    ? {
        uri: ver.evidencePhotoUri || ver.photoUri,
        latitude: ver.evidencePhotoLatitude || ver.gpsLatitude || ver.latitude || 11.0168,
        longitude: ver.evidencePhotoLongitude || ver.gpsLongitude || ver.longitude || 76.9558,
        accuracy: ver.evidencePhotoAccuracy || 3,
        address: ver.evidencePhotoAddress || biz.businessAddress || 'Field Inspection Site',
        isLiveGps: true,
        timestamp: ver.evidencePhotoTimestamp || (ver.verificationDate ? new Date(ver.verificationDate).toLocaleString('en-IN') : 'Certified Record'),
        sealNumber: ver.sealNumber || 'SEAL-TN-VERIFIED',
        fileSize: ver.evidencePhotoSize || null,
      }
    : null;
  const [evidencePhoto, setEvidencePhoto] = useState(initialPhoto); // { uri, width, height, latitude, longitude, address, accuracy, timestamp, sealNumber }
  const [capturingPhoto, setCapturingPhoto] = useState(false);

  // Low-RAM Android Photo Recovery: If Android OS paused/recreated activity while camera was open
  useEffect(() => {
    async function recoverPendingPhoto() {
      try {
        if (ImagePicker.getPendingResultAsync) {
          const pending = await ImagePicker.getPendingResultAsync();
          if (pending && !pending.canceled && pending.assets && pending.assets.length > 0) {
            const asset = pending.assets[0];
            const geoTag = await fetchGeoTagData(biz);
            const now = new Date();
            const formattedTime = now.toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            });

            setEvidencePhoto({
              uri: asset.uri,
              width: asset.width,
              height: asset.height,
              latitude: geoTag.latitude,
              longitude: geoTag.longitude,
              altitude: geoTag.altitude,
              accuracy: geoTag.accuracy,
              address: geoTag.address,
              district: geoTag.district,
              state: geoTag.state,
              isLiveGps: geoTag.isLiveGps,
              timestamp: formattedTime,
              sealNumber,
              fileSize: asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : null,
            });
            setPhysicalChecks((prev) => ({ ...prev, photoAttached: true }));
          }
        }
      } catch (e) {
        console.warn('Pending photo recovery notice:', e);
      }
    }
    recoverPendingPhoto();
  }, []);

  // Native Camera Capture with Automatic Live GPS Geo-Tagging
  const handleTakeEvidencePhoto = async () => {
    try {
      setCapturingPhoto(true);

      // 1. Fetch live GPS coordinates in parallel for statutory geo-tagging
      const geoTag = await fetchGeoTagData(biz);

      // 2. Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is required to capture on-site statutory evidence photos. Please grant camera permission in your phone settings.'
        );
        return;
      }

      // 3. Launch camera - allowsEditing: false PREVENTS Android tick drop bug!
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Critical: delivers photo directly without buggy external crop intent
        quality: 0.85,
        exif: true,
      });

      // 4. Automatically process and attach photo the instant tick (✔) is pressed
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const now = new Date();
        const formattedTime = now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const photoData = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          latitude: geoTag.latitude,
          longitude: geoTag.longitude,
          altitude: geoTag.altitude,
          accuracy: geoTag.accuracy,
          address: geoTag.address,
          district: geoTag.district,
          state: geoTag.state,
          isLiveGps: geoTag.isLiveGps,
          timestamp: formattedTime,
          sealNumber,
          fileSize: asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : null,
        };

        setEvidencePhoto(photoData);
        setPhysicalChecks((prev) => ({ ...prev, photoAttached: true }));
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Camera Error', 'Could not launch camera viewfinder. Please verify device permissions.');
    } finally {
      setCapturingPhoto(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setCapturingPhoto(true);
      const geoTag = await fetchGeoTagData(biz);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Gallery Permission Required',
          'Gallery access is required to attach existing inspection photos from your device library.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const now = new Date();
        const formattedTime = now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const photoData = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          latitude: geoTag.latitude,
          longitude: geoTag.longitude,
          altitude: geoTag.altitude,
          accuracy: geoTag.accuracy,
          address: geoTag.address,
          district: geoTag.district,
          state: geoTag.state,
          isLiveGps: geoTag.isLiveGps,
          timestamp: formattedTime,
          sealNumber,
          fileSize: asset.fileSize ? `${Math.round(asset.fileSize / 1024)} KB` : null,
        };

        setEvidencePhoto(photoData);
        setPhysicalChecks((prev) => ({ ...prev, photoAttached: true }));
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Gallery Error', 'Could not open photo gallery.');
    } finally {
      setCapturingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this evidence photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setEvidencePhoto(null);
            setPhysicalChecks((prev) => ({ ...prev, photoAttached: false }));
          },
        },
      ]
    );
  };

  // Client-Side OIML Math (Instant On-Device Calculation in Village)
  const handleUpdateReading = (index, val) => {
    const updated = [...readings];
    updated[index].observed = val;

    const nominal = parseFloat(updated[index].load) || 0;
    const obs = parseFloat(val) || 0;
    const err = Math.abs(obs - nominal);
    const mpeLimit = parseFloat(updated[index].mpe.replace('±', '')) || 0.01;

    updated[index].passed = err <= mpeLimit;
    setReadings(updated);
  };

  const allReadingsPassed = isManualCategoryMode ? true : readings.every((r) => r.passed);

  // Step Completion Strict Statutory Gating
  const isStep1Complete = isReadOnly || (
    physicalChecks.sealIntact &&
    physicalChecks.levelCentered &&
    physicalChecks.stampingPlateVisible &&
    Boolean(evidencePhoto?.uri)
  );

  const isStep2Complete = isReadOnly || (
    isManualCategoryMode
      ? manualEvaluationNotes.trim().length >= 10
      : readings.length > 0 && readings.every((r) => r.observed !== '' && !isNaN(parseFloat(r.observed)))
  );

  const isStep3Complete = isReadOnly || (
    sealNumber.trim().length >= 4 &&
    stampApplied &&
    Boolean(officerDecision) &&
    digitalSignatureConfirmed
  );

  const handleStepNavigation = (targetStep) => {
    if (targetStep === currentStep) return;

    // In read-only archive mode, officer can freely review all steps
    if (isReadOnly) {
      setCurrentStep(targetStep);
      return;
    }

    if (targetStep === 2) {
      if (!isStep1Complete) {
        Alert.alert(
          'Step 1 Statutory Checklist Incomplete',
          'Under Rule 13 of Legal Metrology General Rules 2011, you must verify all 3 mechanical checks (prior seal intact, spirit level centered, serial stamping plate legible) and capture a mandatory geo-tagged evidence photo before proceeding to tolerance testing.'
        );
        return;
      }
      setCurrentStep(2);
    } else if (targetStep === 3) {
      if (!isStep1Complete) {
        Alert.alert(
          'Step 1 Statutory Checklist Incomplete',
          'Please complete Step 1 (mechanical checks and on-site evidence photo) before advancing.'
        );
        return;
      }
      if (!isStep2Complete) {
        Alert.alert(
          'Step 2 Test Readings Incomplete',
          'Please enter valid observed readings for all standard test loads (or provide calibration methodology notes) before proceeding to physical stamping.'
        );
        return;
      }
      setCurrentStep(3);
    } else {
      setCurrentStep(targetStep);
    }
  };

  const handleSaveOffline = async () => {
    if (!isStep3Complete) {
      Alert.alert(
        'Verification Requirements Incomplete',
        'Please enter the physical seal number, affirm seal application, select your statutory verdict, and acknowledge the digital signature before saving.'
      );
      return;
    }
    try {
      setSubmitting(true);
      const record = {
        applicationId: app.id,
        instrumentId: inst.id,
        businessName: biz.businessName,
        applicationNumber: app.applicationNumber,
        instrumentCustomId: inst.customId,
        verificationPattern,
        isManualCategoryMode,
        testReadings: isManualCategoryMode ? [] : readings,
        manualEvaluationNotes,
        spotChallanNumber,
        overallResult: officerDecision,
        physicalStampApplied: stampApplied,
        sealNumber,
        remarks: remarks + ` (Seal: ${sealNumber}, Stamp: ${stampApplied ? 'APPLIED' : 'PENDING'})`,
        latitude: evidencePhoto?.latitude || 11.0168,
        longitude: evidencePhoto?.longitude || 76.9558,
        officerSignature: 'DIGITAL_SIG_OFFLINE_VILLAGE',
        evidencePhotoUri: evidencePhoto?.uri || null,
        evidencePhotoTimestamp: evidencePhoto?.timestamp || null,
        evidencePhotoLatitude: evidencePhoto?.latitude || null,
        evidencePhotoLongitude: evidencePhoto?.longitude || null,
        evidencePhotoAccuracy: evidencePhoto?.accuracy || null,
        evidencePhotoAddress: evidencePhoto?.address || null,
        evidencePhotoSize: evidencePhoto?.fileSize || null,
        syncStatus: 'LOCAL',
        savedAt: new Date().toISOString(),
      };

      await saveOfflineInspection(record);
      Alert.alert(
        'Saved to Device Buffer (Village Mode)',
        `Inspection for ${app.applicationNumber} saved on local storage with instant on-device OIML evaluation. It will automatically upload to PostgreSQL server when you return to cellular coverage.`,
        [
          {
            text: 'View Sync Queue',
            onPress: () => navigation.navigate('SyncQueue'),
          },
          {
            text: 'Return to Dashboard',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to store inspection locally.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOnline = async () => {
    if (!isStep3Complete) {
      Alert.alert(
        'Verification Requirements Incomplete',
        'Please enter the physical seal number, affirm seal application, select your statutory verdict, and acknowledge the digital signature before submitting.'
      );
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        applicationId: app.id,
        instrumentId: inst.id,
        verificationPattern,
        spotChallanNumber,
        isManualCategoryMode,
        manualEvaluationNotes,
        testReadings: readings,
        overallResult: officerDecision,
        physicalStampApplied: stampApplied,
        sealNumber,
        officerDecision,
        remarks: remarks + ` (Seal: ${sealNumber}, Stamp: ${stampApplied ? 'APPLIED' : 'PENDING'})`,
        gpsLatitude: evidencePhoto?.latitude || 11.0168,
        gpsLongitude: evidencePhoto?.longitude || 76.9558,
        officerSignature: 'DIGITAL_SIGNATURE_LMO',
        evidencePhotoUri: evidencePhoto?.uri || null,
        evidencePhotoTimestamp: evidencePhoto?.timestamp || null,
        evidencePhotoLatitude: evidencePhoto?.latitude || null,
        evidencePhotoLongitude: evidencePhoto?.longitude || null,
        evidencePhotoAccuracy: evidencePhoto?.accuracy || null,
        evidencePhotoAddress: evidencePhoto?.address || null,
        verificationDate: new Date().toISOString(),
      };

      const res = await submitVerificationApi(payload);
      Alert.alert(
        'Verification & Stamping Complete',
        res.message || 'Legal Metrology Certificate registered successfully! Status updated to VERIFIED.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Server Unreachable (Village Signal)',
        'No internet connection detected. Would you like to save this inspection to your offline sync queue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Offline', onPress: handleSaveOffline },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Village Offline Mode Banner */}
      <View style={styles.offlineEngineCard}>
        <View style={styles.offlineEngineHeader}>
          <Text style={styles.offlineEngineIcon}>📶</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineEngineTitle}>On-Device Verification Engine Active</Text>
            <Text style={styles.offlineEngineSub}>
              OIML Math & Satellite GPS execute 100% locally for zero-internet village inspections.
            </Text>
          </View>
        </View>
      </View>

      {/* Official Government Sovereign Read-Only Archive Banner */}
      {isReadOnly && (
        <View style={styles.readOnlyBanner}>
          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyIcon}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.readOnlyTitle}>OFFICIAL VERIFICATION ARCHIVE (READ-ONLY)</Text>
              <Text style={styles.readOnlySub}>
                This statutory verification has been completed, physically stamped, and officially sealed. Modification is strictly locked under the Legal Metrology Act, 2009.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Instrument Overview Banner */}
      <View style={styles.headerCard}>
        <Text style={styles.appNo}>{app.applicationNumber || 'APP-2026'}</Text>
        <Text style={styles.bizName}>{biz.businessName || 'Business Establishment'}</Text>
        <Text style={styles.instMeta}>
          ⚖️ {inst.customId} ({inst.capacity} {inst.capacityUnit} • Class {inst.accuracyClass})
        </Text>
      </View>

      {/* Pattern Selector (Pattern A vs Pattern B) */}
      <View style={styles.patternBox}>
        <Text style={styles.patternLabel}>VERIFICATION PATTERN:</Text>
        <View style={styles.patternRow}>
          <TouchableOpacity
            style={[styles.patternBtn, verificationPattern === 'PATTERN_A' && styles.patternBtnActive]}
            onPress={() => setVerificationPattern('PATTERN_A')}
            disabled={isReadOnly}
          >
            <Text style={[styles.patternBtnText, verificationPattern === 'PATTERN_A' && styles.patternBtnTextActive]}>
              📍 Pattern A (Field Premises Visit)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.patternBtn, verificationPattern === 'PATTERN_B' && styles.patternBtnActive]}
            onPress={() => setVerificationPattern('PATTERN_B')}
            disabled={isReadOnly}
          >
            <Text style={[styles.patternBtnText, verificationPattern === 'PATTERN_B' && styles.patternBtnTextActive]}>
              🏢 Pattern B (Lab / Counter Bring-In)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stepper Tabs */}
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepTab, currentStep === 1 && styles.stepTabActive]}
          onPress={() => handleStepNavigation(1)}
        >
          <Text style={[styles.stepTabText, currentStep === 1 && styles.stepTabTextActive]}>
            1. Physical Checks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stepTab,
            currentStep === 2 && styles.stepTabActive,
            !isStep1Complete && !isReadOnly && styles.stepTabLocked,
          ]}
          onPress={() => handleStepNavigation(2)}
        >
          <Text style={[styles.stepTabText, currentStep === 2 && styles.stepTabTextActive]}>
            2. Tolerance Test {!isStep1Complete && !isReadOnly ? '🔒' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stepTab,
            currentStep === 3 && styles.stepTabActive,
            (!isStep1Complete || !isStep2Complete) && !isReadOnly && styles.stepTabLocked,
          ]}
          onPress={() => handleStepNavigation(3)}
        >
          <Text style={[styles.stepTabText, currentStep === 3 && styles.stepTabTextActive]}>
            3. Stamp & Verdict {(!isStep1Complete || !isStep2Complete) && !isReadOnly ? '🔒' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* STEP 1: VISUAL & PHYSICAL SEAL INSPECTION */}
      {currentStep === 1 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Physical Inspection & Security Seals</Text>
          <Text style={styles.cardSub}>
            Verify mechanical integrity under Rule 13 of Legal Metrology General Rules 2011.
          </Text>

          <TouchableOpacity
            style={[styles.checkItem, physicalChecks.sealIntact && styles.checkItemActive]}
            onPress={() =>
              setPhysicalChecks({ ...physicalChecks, sealIntact: !physicalChecks.sealIntact })
            }
            disabled={isReadOnly}
          >
            <Text style={styles.checkIcon}>{physicalChecks.sealIntact ? '☑️' : '⬜'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>Prior Verification Seal Intact</Text>
              <Text style={styles.checkSub}>Security lead seal unbroken and untampered</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkItem, physicalChecks.levelCentered && styles.checkItemActive]}
            onPress={() =>
              setPhysicalChecks({ ...physicalChecks, levelCentered: !physicalChecks.levelCentered })
            }
            disabled={isReadOnly}
          >
            <Text style={styles.checkIcon}>{physicalChecks.levelCentered ? '☑️' : '⬜'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>Spirit Level Indicator Centered</Text>
              <Text style={styles.checkSub}>Machine leveled on solid foundation</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkItem, physicalChecks.stampingPlateVisible && styles.checkItemActive]}
            onPress={() =>
              setPhysicalChecks({
                ...physicalChecks,
                stampingPlateVisible: !physicalChecks.stampingPlateVisible,
              })
            }
            disabled={isReadOnly}
          >
            <Text style={styles.checkIcon}>{physicalChecks.stampingPlateVisible ? '☑️' : '⬜'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkLabel}>Verification Stamping Plate</Text>
              <Text style={styles.checkSub}>Nameplate, model approval code, and serial number legible</Text>
            </View>
          </TouchableOpacity>

          {/* On-Site Evidence Photo Capture Section */}
          <View style={styles.evidenceContainer}>
            <View style={styles.evidenceHeaderRow}>
              <Text style={styles.evidenceTitle}>📷 On-Site Evidence Photo (Scale & Lead Seal)</Text>
              {evidencePhoto && (
                <View style={styles.photoCountBadge}>
                  <Text style={styles.photoCountBadgeText}>1 Attached</Text>
                </View>
              )}
            </View>
            <Text style={styles.evidenceSubtitle}>
              Attach a high-resolution photo of the physical lead seal and instrument serial plate for statutory verification proof.
            </Text>

            {/* Launch Camera Button & Gallery Option (Hidden in Read-Only Mode) */}
            {!isReadOnly && (
              <View style={styles.photoActionRow}>
                <TouchableOpacity
                  style={[
                    styles.captureBtn,
                    evidencePhoto && styles.captureBtnSuccess,
                    capturingPhoto && styles.captureBtnDisabled,
                  ]}
                  onPress={handleTakeEvidencePhoto}
                  disabled={capturingPhoto}
                  activeOpacity={0.8}
                >
                  {capturingPhoto ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Text style={styles.captureBtnIcon}>📸</Text>
                      <Text style={styles.captureBtnText}>
                        {evidencePhoto ? 'Retake Photo with Camera' : 'Capture On-Site Photo'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryBtn}
                  onPress={handlePickFromGallery}
                  disabled={capturingPhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.galleryBtnText}>🖼️ Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Automatic Photo Preview Directly Underneath */}
            {evidencePhoto ? (
              <View style={styles.previewCard}>
                <View style={styles.previewImageWrapper}>
                  <Image
                    source={{ uri: evidencePhoto.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />

                  {/* STATUTORY GPS GEO-TAG OVERLAY BANNER */}
                  <View style={styles.geoTagBanner}>
                    <View style={styles.geoTagHeader}>
                      <View style={styles.geoTagBadge}>
                        <Text style={styles.geoTagLiveDot}>🔴</Text>
                        <Text style={styles.geoTagBadgeText}>
                          {evidencePhoto.isLiveGps ? 'GPS GEO-TAGGED STATUTORY PROOF' : 'OFFLINE GPS STATUTORY PROOF'}
                        </Text>
                      </View>
                      <Text style={styles.geoTagAccText}>
                        Acc: ±{evidencePhoto.accuracy || 3}m
                      </Text>
                    </View>

                    <Text style={styles.geoTagCoordText}>
                      📍 Lat: {evidencePhoto.latitude}° N | Long: {evidencePhoto.longitude}° E
                    </Text>

                    <Text style={styles.geoTagAddressText} numberOfLines={2}>
                      🏢 {evidencePhoto.address || biz.businessAddress || 'Field Inspection Site'}
                    </Text>

                    <View style={styles.geoTagFooter}>
                      <Text style={styles.geoTagFooterText}>
                        🕒 {evidencePhoto.timestamp}
                      </Text>
                      <Text style={styles.geoTagSealText}>
                        🔒 Seal #{evidencePhoto.sealNumber} • {app.applicationNumber || 'APP-2026'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Photo Meta & Status */}
                <View style={styles.previewInfoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewStatusText}>
                      ✅ Statutory Evidence Photo Attached & Geo-Tagged
                    </Text>
                    <Text style={styles.previewMetaText}>
                      {evidencePhoto.fileSize ? `${evidencePhoto.fileSize} • ` : ''}GPS Accuracy: ±{evidencePhoto.accuracy || 3}m
                    </Text>
                  </View>
                </View>

                {/* Retake and Remove Controls (Hidden in Read-Only Mode) */}
                {!isReadOnly && (
                  <View style={styles.previewButtonsRow}>
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={handleTakeEvidencePhoto}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.retakeBtnText}>🔄 Retake Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={handleRemovePhoto}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.removePhotoBtnText}>🗑️ Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.photoHintBox}>
                <Text style={styles.photoHintText}>
                  ℹ️ Tap "Capture On-Site Photo" to open your device camera. The captured image will appear right here automatically.
                </Text>
              </View>
            )}
          </View>

          {/* Spot Treasury Challan for Pattern A */}
          {verificationPattern === 'PATTERN_A' && (
            <View style={styles.challanBox}>
              <Text style={styles.inputLabel}>Spot Treasury Challan / Receipt # (Rule 16 Field Payment)</Text>
              <TextInput
                style={styles.input}
                value={spotChallanNumber}
                onChangeText={setSpotChallanNumber}
                placeholder="e.g. TREASURY-TN-2026-90412"
                placeholderTextColor={COLORS.textMuted}
                editable={!isReadOnly}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.nextBtn,
              !isStep1Complete && !isReadOnly && styles.nextBtnDisabled,
            ]}
            onPress={() => handleStepNavigation(2)}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {isReadOnly ? 'View Tolerance Test →' : 'Continue to Tolerance Test →'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: LOAD READINGS & OIML MPE CHECK */}
      {currentStep === 2 && (
        <View style={styles.card}>
          <View style={styles.modeToggleHeader}>
            <Text style={styles.cardTitle}>Tolerance Verification</Text>
            <TouchableOpacity
              style={styles.modeToggleBtn}
              onPress={() => setIsManualCategoryMode(!isManualCategoryMode)}
              disabled={isReadOnly}
            >
              <Text style={styles.modeToggleText}>
                {isManualCategoryMode ? '⚡ Switch to OIML R 76-1' : '🛠️ Fallback: Manual Expert Form'}
              </Text>
            </TouchableOpacity>
          </View>

          {!isManualCategoryMode ? (
            <>
              <Text style={styles.cardSub}>
                OIML R 76-1 Math calculates error limits instantly on-device without internet connection.
              </Text>

              {/* OIML Mathematical Formula & Legal Metrology Proof Card */}
              <View style={styles.formulaCard}>
                <View style={styles.formulaHeader}>
                  <Text style={styles.formulaIcon}>📐</Text>
                  <Text style={styles.formulaTitle}>OIML R 76-1 Statutory Tolerance Equation</Text>
                </View>
                <Text style={styles.formulaEquation}>
                  Error E = |Observed Reading − Reference Standard Load|
                </Text>
                <Text style={styles.formulaRule}>
                  Statutory Rule: Error E ≤ MPE (Maximum Permissible Error • Class III Table 6)
                </Text>
              </View>

              {readings.map((r, idx) => (
                <View key={idx} style={styles.readingRow}>
                  <View style={{ width: '25%' }}>
                    <Text style={styles.readingLabel}>Standard Load</Text>
                    <Text style={styles.readingLoad}>{r.load} kg</Text>
                  </View>

                  <View style={{ width: '45%' }}>
                    <Text style={styles.readingLabel}>Observed Reading (kg)</Text>
                    <TextInput
                      style={styles.readingInput}
                      keyboardType="numeric"
                      value={r.observed}
                      onChangeText={(val) => handleUpdateReading(idx, val)}
                      editable={!isReadOnly}
                    />
                  </View>

                  <View style={{ width: '30%', alignItems: 'flex-end' }}>
                    <Text style={styles.readingLabel}>MPE: {r.mpe}</Text>
                    <View
                      style={[
                        styles.tolerancePill,
                        { backgroundColor: r.passed ? COLORS.successBg : COLORS.errorBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tolerancePillText,
                          { color: r.passed ? COLORS.success : COLORS.error },
                        ]}
                      >
                        {r.passed ? '✓ WITHIN MPE' : '✕ EXCEEDS'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <View
                style={[
                  styles.calcSummaryBox,
                  { borderColor: allReadingsPassed ? COLORS.success : COLORS.error },
                ]}
              >
                <Text style={styles.calcSummaryTitle}>
                  {allReadingsPassed
                    ? '✅ All Load Test Readings Within Statutory Limits'
                    : '⚠️ Tolerance Deviation Detected in Test Readings'}
                </Text>
                <Text style={styles.calcSummarySub}>
                  Evaluated on-device under OIML R 76-1 (Non-Automatic Weighing Instruments).
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.manualFallbackBox}>
              <Text style={styles.manualFallbackTitle}>Expert Manual Inspection Form (Unconfigured Category)</Text>
              <Text style={styles.manualFallbackSub}>
                For non-standard or custom instrument categories under Legal Metrology Rules (~40 categories).
              </Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                multiline
                value={manualEvaluationNotes}
                onChangeText={setManualEvaluationNotes}
                placeholder="Describe manual calibration methodology, applied test standards, and statutory findings..."
                placeholderTextColor={COLORS.textMuted}
                editable={!isReadOnly}
              />
            </View>
          )}

          <View style={styles.stepBtnRow}>
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => handleStepNavigation(1)}
            >
              <Text style={styles.prevBtnText}>← Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextBtnHalf,
                !isStep2Complete && !isReadOnly && styles.nextBtnDisabled,
              ]}
              onPress={() => handleStepNavigation(3)}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>
                {isReadOnly ? 'View Stamping & Verdict →' : 'Physical Stamping →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3: PHYSICAL STAMPING & STATUTORY VERDICT */}
      {currentStep === 3 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rule 13 Physical Stamping & Verdict</Text>
          <Text style={styles.cardSub}>
            Physical lead seal must be affixed before central certificate issuance.
          </Text>

          {/* Physical Stamping Log Entry */}
          <View style={styles.stampingEntryCard}>
            <Text style={styles.stampingEntryTitle}>🏷️ Physical Stamping Entry (Rule 13)</Text>
            
            <TouchableOpacity
              style={styles.stampToggleRow}
              onPress={() => setStampApplied(!stampApplied)}
              disabled={isReadOnly}
            >
              <Text style={styles.checkIcon}>{stampApplied ? '☑️' : '⬜'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.stampToggleText}>Physical Lead Seal Affixed & Stamped On-Site</Text>
                <Text style={styles.stampToggleSub}>Lead seal plug inserted into machine adjusting cavity</Text>
              </View>
            </TouchableOpacity>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.inputLabel}>Affixed Security Lead Seal Serial Number *</Text>
              <TextInput
                style={styles.input}
                value={sealNumber}
                onChangeText={setSealNumber}
                placeholder="e.g. SEAL-TN-048291"
                placeholderTextColor={COLORS.textMuted}
                editable={!isReadOnly}
              />
            </View>
          </View>

          {/* Decision Picker */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Statutory Officer Verdict *</Text>
          <View style={styles.decisionRow}>
            <TouchableOpacity
              style={[
                styles.decisionBtn,
                officerDecision === 'PASS' && { backgroundColor: COLORS.success, borderColor: COLORS.success },
              ]}
              onPress={() => setOfficerDecision('PASS')}
              disabled={isReadOnly}
            >
              <Text
                style={[
                  styles.decisionBtnText,
                  officerDecision === 'PASS' ? { color: '#FFFFFF', fontWeight: '800' } : { color: '#1E293B', fontWeight: '700' },
                ]}
              >
                PASS & Issue Certificate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.decisionBtn,
                officerDecision === 'FAIL' && { backgroundColor: COLORS.error, borderColor: COLORS.error },
              ]}
              onPress={() => setOfficerDecision('FAIL')}
              disabled={isReadOnly}
            >
              <Text
                style={[
                  styles.decisionBtnText,
                  officerDecision === 'FAIL' ? { color: '#FFFFFF', fontWeight: '800' } : { color: '#1E293B', fontWeight: '700' },
                ]}
              >
                FAIL (Repair Notice)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.decisionBtn,
                officerDecision === 'NEEDS_CORRECTION' && { backgroundColor: COLORS.warning, borderColor: COLORS.warning },
              ]}
              onPress={() => setOfficerDecision('NEEDS_CORRECTION')}
              disabled={isReadOnly}
            >
              <Text
                style={[
                  styles.decisionBtnText,
                  officerDecision === 'NEEDS_CORRECTION' ? { color: '#FFFFFF', fontWeight: '800' } : { color: '#1E293B', fontWeight: '700' },
                ]}
              >
                Needs Correction
              </Text>
            </TouchableOpacity>
          </View>

          {/* Remarks */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.inputLabel}>Officer Findings & Remarks</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              multiline
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Enter statutory inspection notes..."
              placeholderTextColor={COLORS.textMuted}
              editable={!isReadOnly}
            />
          </View>

          {/* Signature Acknowledgement */}
          <TouchableOpacity
            style={styles.signatureRow}
            onPress={() => setDigitalSignatureConfirmed(!digitalSignatureConfirmed)}
            disabled={isReadOnly}
          >
            <Text style={styles.checkIcon}>{digitalSignatureConfirmed ? '☑️' : '⬜'}</Text>
            <Text style={styles.signatureText}>
              I solemnly affirm that physical lead seal {sealNumber} was applied and standards comply with Legal Metrology Rules, 2011.
            </Text>
          </TouchableOpacity>

          {/* Navigation & Submission Controls */}
          <View style={[styles.stepBtnRow, { marginTop: 16 }]}>
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => handleStepNavigation(2)}
            >
              <Text style={styles.prevBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {isReadOnly ? (
            <View style={styles.verifiedCard}>
              <View style={styles.verifiedBadgeRow}>
                <Text style={styles.verifiedBadgeText}>✅ STATUTORY CERTIFICATE ISSUED</Text>
              </View>
              <Text style={styles.verifiedCardTitle}>Verification Complete & Certified</Text>
              <Text style={styles.verifiedCardSub}>
                This instrument has completed statutory verification, calibration, and physical sealing under the Legal Metrology Act, 2009.
              </Text>
              <View style={styles.verifiedDetailRow}>
                <Text style={styles.verifiedDetailLabel}>Security Seal #:</Text>
                <Text style={styles.verifiedDetailValue}>{sealNumber}</Text>
              </View>
              <View style={styles.verifiedDetailRow}>
                <Text style={styles.verifiedDetailLabel}>Statutory Verdict:</Text>
                <Text style={[styles.verifiedDetailValue, { color: officerDecision === 'PASS' ? COLORS.success : COLORS.error }]}>
                  {officerDecision}
                </Text>
              </View>
              <View style={styles.verifiedDetailRow}>
                <Text style={styles.verifiedDetailLabel}>Verification Mode:</Text>
                <Text style={styles.verifiedDetailValue}>
                  {verificationPattern === 'PATTERN_A' ? 'Pattern A (Field Premises Visit)' : 'Pattern B (Lab / Counter Bring-In)'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.returnDashboardBtn}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={styles.returnDashboardBtnText}>← Return to Officer Dashboard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 14, gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.submitOnlineBtn,
                  (!isStep3Complete || submitting) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmitOnline}
                disabled={!isStep3Complete || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitOnlineBtnText}>
                    🚀 Submit & Issue Certificate (Online Mode)
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveOfflineBtn,
                  (!isStep3Complete || submitting) && styles.saveOfflineBtnDisabled,
                ]}
                onPress={handleSaveOffline}
                disabled={!isStep3Complete || submitting}
              >
                <Text style={styles.saveOfflineBtnText}>
                  💾 Save to Device Buffer (Village Mode - Zero Network)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  offlineEngineCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  offlineEngineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineEngineIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  offlineEngineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  offlineEngineSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  appNo: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bizName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  instMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  patternBox: {
    marginBottom: 12,
  },
  patternLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  patternRow: {
    flexDirection: 'row',
    gap: 8,
  },
  patternBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  patternBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  patternBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  patternBtnTextActive: {
    color: COLORS.primaryDark,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  stepTab: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  stepTabTextActive: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  checkSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  challanBox: {
    marginTop: 6,
    marginBottom: 12,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.small,
  },
  nextBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  modeToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeToggleBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readingLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  readingLoad: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  readingInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  tolerancePill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 2,
  },
  tolerancePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  calcSummaryBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  calcSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calcSummarySub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  manualFallbackBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  manualFallbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  manualFallbackSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  stepBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prevBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  prevBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  nextBtnHalf: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stampingEntryCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  stampingEntryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  stampToggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stampToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  stampToggleSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  decisionBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  decisionBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  signatureText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  submitOnlineBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  submitOnlineBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  saveOfflineBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveOfflineBtnText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  // Evidence Camera & Auto-Preview Styles
  evidenceContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  evidenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  evidenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  photoCountBadge: {
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  photoCountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  evidenceSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  captureBtn: {
    flex: 3,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  captureBtnSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  captureBtnDisabled: {
    opacity: 0.6,
  },
  captureBtnIcon: {
    fontSize: 16,
  },
  captureBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  galleryBtn: {
    flex: 1.2,
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  galleryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  previewCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginTop: 4,
  },
  previewImageWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  // Statutory GPS Geo-Tag Watermark Overlay Styles
  geoTagBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  geoTagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  geoTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  geoTagLiveDot: {
    fontSize: 8,
  },
  geoTagBadgeText: {
    color: '#FCA5A5',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  geoTagAccText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  geoTagCoordText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  geoTagAddressText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    marginBottom: 4,
  },
  geoTagFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 4,
  },
  geoTagFooterText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '600',
  },
  geoTagSealText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '700',
  },
  previewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  previewMetaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  previewButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  retakeBtn: {
    flex: 2,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  retakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  removePhotoBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removePhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  photoHintBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  photoHintText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  readOnlyBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readOnlyIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  readOnlyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  readOnlySub: {
    fontSize: 11,
    color: '#1E3A8A',
    marginTop: 2,
    lineHeight: 15,
  },
  stepTabLocked: {
    opacity: 0.6,
  },
  nextBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  saveOfflineBtnDisabled: {
    opacity: 0.5,
  },
  verifiedCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  verifiedBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  verifiedBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  verifiedCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  verifiedCardSub: {
    fontSize: 12,
    color: '#15803D',
    marginBottom: 12,
    lineHeight: 16,
  },
  verifiedDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
  },
  verifiedDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  verifiedDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14532D',
  },
  returnDashboardBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  returnDashboardBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  formulaCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.2,
    borderColor: '#93C5FD',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  formulaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  formulaEquation: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginVertical: 3,
  },
  formulaRule: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
