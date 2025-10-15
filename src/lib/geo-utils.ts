/**
 * Geo-fencing and location utilities for attendance verification
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeoFenceConfig {
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param point1 First location
 * @param point2 Second location
 * @returns Distance in meters
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a location is within a geo-fence
 * @param userLocation User's current location
 * @param geoFence Geo-fence configuration
 * @returns Object with isWithin boolean and distance in meters
 */
export function isWithinGeoFence(
  userLocation: Location,
  geoFence: GeoFenceConfig
): { isWithin: boolean; distance: number } {
  const center: Location = {
    latitude: geoFence.centerLatitude,
    longitude: geoFence.centerLongitude,
  };

  const distance = calculateDistance(userLocation, center);
  const isWithin = distance <= geoFence.radiusMeters;

  return { isWithin, distance };
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "50m" or "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get user's current location from browser
 * @returns Promise with location or error
 */
export async function getUserLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Validate location data
 * @param latitude Latitude value
 * @param longitude Longitude value
 * @returns Boolean indicating if coordinates are valid
 */
export function isValidLocation(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
