import * as Location from 'expo-location';

/**
 * Request high-precision foreground GPS location permissions.
 */
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.warn('Error requesting location permission:', err);
    return false;
  }
}

/**
 * Fetch high-accuracy GPS coordinates and reverse geocoded locality for statutory Geo-Tagging.
 * Includes graceful fallback to last known position and business address so the officer is never blocked.
 * 
 * @param {Object} business Optional business establishment info for fallback context.
 * @returns {Promise<Object>} Geo-tag payload { latitude, longitude, accuracy, address, district, state, isLiveGps }
 */
export async function fetchGeoTagData(business = {}) {
  const fallbackLat = 11.016845;
  const fallbackLng = 76.955812;
  const fallbackAddress = business.businessAddress || 'Gandhipuram, Coimbatore, Tamil Nadu';

  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return {
        latitude: fallbackLat,
        longitude: fallbackLng,
        accuracy: 10,
        address: fallbackAddress,
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        isLiveGps: false,
        timestamp: new Date().toISOString(),
      };
    }

    // Try current position with balanced/high accuracy and 5s timeout
    let position = null;
    try {
      const positionPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('GPS Timeout')), 5000)
      );
      position = await Promise.race([positionPromise, timeoutPromise]);
    } catch (timeoutErr) {
      // Fallback to last known position if satellite fix takes longer
      position = await Location.getLastKnownPositionAsync();
    }

    if (!position || !position.coords) {
      return {
        latitude: fallbackLat,
        longitude: fallbackLng,
        accuracy: 12,
        address: fallbackAddress,
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        isLiveGps: false,
        timestamp: new Date().toISOString(),
      };
    }

    const { latitude, longitude, accuracy, altitude } = position.coords;

    // Reverse geocode to human-readable address
    let formattedAddress = fallbackAddress;
    let district = 'Coimbatore';
    let state = 'Tamil Nadu';

    try {
      const geocodeList = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocodeList && geocodeList.length > 0) {
        const item = geocodeList[0];
        const parts = [
          item.name || item.street,
          item.district || item.subregion || item.city,
          item.city !== item.district ? item.city : null,
          item.region,
          item.postalCode ? `PIN: ${item.postalCode}` : null,
        ].filter(Boolean);

        if (parts.length > 0) {
          formattedAddress = parts.join(', ');
        }
        district = item.district || item.city || 'Coimbatore';
        state = item.region || 'Tamil Nadu';
      }
    } catch (geoErr) {
      console.warn('Reverse geocoding warning:', geoErr.message);
    }

    return {
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
      altitude: altitude ? Math.round(altitude) : null,
      accuracy: accuracy ? Math.round(accuracy) : 3,
      address: formattedAddress,
      district,
      state,
      isLiveGps: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('fetchGeoTagData error:', error);
    return {
      latitude: fallbackLat,
      longitude: fallbackLng,
      accuracy: 15,
      address: fallbackAddress,
      district: 'Coimbatore',
      state: 'Tamil Nadu',
      isLiveGps: false,
      timestamp: new Date().toISOString(),
    };
  }
}
