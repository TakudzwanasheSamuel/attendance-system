/**
 * Geofencing utilities for attendance tracking
 * Provides location-based validation for attendance marking
 */

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Geofence {
  id: string;
  name: string;
  center: Location;
  radius: number; // in meters
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeofenceValidationResult {
  isValid: boolean;
  distance?: number;
  geofence?: Geofence;
  error?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a location is within a geofence
 * @param userLocation User's current location
 * @param geofence Geofence to check against
 * @returns Validation result
 */
export function isWithinGeofence(
  userLocation: Location,
  geofence: Geofence
): GeofenceValidationResult {
  if (!geofence.isActive) {
    return {
      isValid: false,
      error: 'Geofence is not active'
    };
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    geofence.center.latitude,
    geofence.center.longitude
  );

  return {
    isValid: distance <= geofence.radius,
    distance,
    geofence
  };
}

/**
 * Get user's current location using HTML5 Geolocation API
 * @param options Geolocation options
 * @returns Promise with user's location
 */
export function getCurrentLocation(
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000 // 5 minutes
  }
): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
}

/**
 * Validate location accuracy and detect potential spoofing
 * @param location User's location
 * @returns Validation result with spoofing detection
 */
export function validateLocationAccuracy(location: Location): {
  isValid: boolean;
  isSuspicious: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isSuspicious = false;

  // Check accuracy
  if (location.accuracy && location.accuracy > 100) {
    warnings.push('Location accuracy is low (>100m)');
    isSuspicious = true;
  }

  // Check for impossible coordinates
  if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
    warnings.push('Invalid coordinates detected');
    isSuspicious = true;
  }

  // Check for common spoofing coordinates (0,0 or very round numbers)
  if (
    (location.latitude === 0 && location.longitude === 0) ||
    (location.latitude % 1 === 0 && location.longitude % 1 === 0)
  ) {
    warnings.push('Suspicious coordinates detected (possible spoofing)');
    isSuspicious = true;
  }

  // Check timestamp (if provided)
  if (location.timestamp) {
    const age = Date.now() - location.timestamp;
    if (age > 300000) { // 5 minutes
      warnings.push('Location data is older than 5 minutes');
      isSuspicious = true;
    }
  }

  return {
    isValid: warnings.length === 0,
    isSuspicious,
    warnings
  };
}

/**
 * Format distance for display
 * @param distance Distance in meters
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

/**
 * Get location permission status
 * @returns Promise with permission status
 */
export async function getLocationPermissionStatus(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state;
  } catch {
    return 'prompt';
  }
}

/**
 * Request location permission
 * @returns Promise with permission result
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const permission = await getLocationPermissionStatus();
    
    if (permission === 'granted') {
      return true;
    }
    
    if (permission === 'denied') {
      return false;
    }
    
    // For 'prompt' state, we need to actually request location
    // This will trigger the browser's permission dialog
    await getCurrentLocation({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}


