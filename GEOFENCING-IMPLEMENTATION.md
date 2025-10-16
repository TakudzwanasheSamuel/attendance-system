# Simple Geofencing Implementation

This document describes the **simplest approach** to implementing geofencing in the attendance system.

## Overview

The geofencing system ensures students can only mark attendance when they're physically present at the designated course location (within 50 meters).

## How It Works

### 1. **Browser Geolocation API**
- Uses the built-in `navigator.geolocation` API
- No additional libraries or complex setup required
- Works on all modern browsers and mobile devices

### 2. **Simple Distance Calculation**
- Uses the Haversine formula to calculate distance between coordinates
- Fixed 50-meter radius for all courses
- Lightweight and fast calculation

### 3. **Database Schema Changes**
```sql
-- Courses table
ALTER TABLE courses ADD COLUMN latitude FLOAT;
ALTER TABLE courses ADD COLUMN longitude FLOAT;
ALTER TABLE courses ADD COLUMN locationName VARCHAR(255);

-- Attendance records table
ALTER TABLE attendance_records ADD COLUMN latitude FLOAT;
ALTER TABLE attendance_records ADD COLUMN longitude FLOAT;
ALTER TABLE attendance_records ADD COLUMN accuracy FLOAT;
ALTER TABLE attendance_records ADD COLUMN geofenceId VARCHAR(255);
ALTER TABLE attendance_records ADD COLUMN isLocationValid BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance_records ADD COLUMN locationTimestamp DATETIME;
```

## Implementation Files

### 1. **Geolocation Service** (`src/lib/geolocation.ts`)
- `calculateDistance()` - Calculate distance between two coordinates
- `getCurrentLocation()` - Get user's current location using browser API
- `isWithinGeofence()` - Check if user is within allowed distance

### 2. **Updated Attendance Form** (`src/components/student/attendance-form.tsx`)
- Added location capture button
- Shows distance from course location
- Validates location before allowing attendance submission
- Visual feedback for location status

### 3. **Updated Attendance API** (`src/app/api/attendance/mark/route.ts`)
- Validates student location against course location
- Rejects attendance if student is more than 50m away
- Stores location data in attendance record

### 4. **Course Location Management** (`src/components/lecturer/course-location-form.tsx`)
- Allows lecturers to set course location
- "Use Current Location" button for easy setup
- Form validation for coordinates

### 5. **Location API** (`src/app/api/courses/[courseId]/location/route.ts`)
- Endpoint to update course location
- Validates coordinate ranges
- Updates course with location data

## Usage Flow

### For Lecturers:
1. Go to course management
2. Set course location using the location form
3. Use "Use Current Location" button or manually enter coordinates
4. Save location settings

### For Students:
1. Navigate to attendance page
2. Click "Capture Location" button
3. Allow browser location access
4. System shows distance from course location
5. If within 50m, proceed to mark attendance
6. If outside 50m, attendance is rejected

## Security Considerations

### Current Limitations:
- Location can be spoofed using browser developer tools
- GPS spoofing apps can bypass location checks
- VPN/proxy can manipulate location data

### Basic Mitigation:
- Location data is logged for audit trails
- Multiple validation layers can be added later
- Admin override capabilities for edge cases

## Configuration

### Default Settings:
- **Geofence Radius**: 50 meters
- **Location Accuracy**: High accuracy enabled
- **Timeout**: 10 seconds for location request
- **Cache**: 5 minutes for location data

### Customization:
- Modify `maxDistance` parameter in `isWithinGeofence()` function
- Adjust timeout and accuracy settings in `getCurrentLocation()`
- Change validation logic in attendance API

## Testing

### Test Scenarios:
1. **Valid Location**: Student within 50m of course location
2. **Invalid Location**: Student more than 50m away
3. **No Location**: Student denies location access
4. **No Course Location**: Course doesn't have location set
5. **Location Error**: GPS unavailable or timeout

### Test Data:
```javascript
// Example coordinates for testing
const testLocations = {
  classroom: { lat: 40.7128, lng: -74.0060 }, // New York
  nearby: { lat: 40.7130, lng: -74.0058 },   // ~50m away
  far: { lat: 40.7200, lng: -74.0000 }       // ~1km away
};
```

## Future Enhancements

### Phase 2 Improvements:
1. **Configurable Radius**: Allow different radius per course
2. **Multiple Validation**: GPS + IP + time-based validation
3. **Location History**: Track location patterns for fraud detection
4. **Admin Override**: Allow admins to bypass location checks
5. **Mobile App**: Native mobile app with more secure GPS

### Advanced Security:
1. **Device Fingerprinting**: Track device characteristics
2. **Behavioral Analysis**: Detect suspicious patterns
3. **Multi-factor Location**: Combine multiple location sources
4. **Real-time Validation**: Continuous location monitoring

## Troubleshooting

### Common Issues:
1. **"Location access denied"**: User needs to enable location permissions
2. **"Location unavailable"**: GPS signal weak or disabled
3. **"Invalid coordinates"**: Check coordinate format and ranges
4. **"Database connection error"**: Ensure database is running

### Debug Mode:
Enable console logging by setting `NODE_ENV=development` to see detailed location data and validation steps.

## Conclusion

This simple geofencing implementation provides basic location-based attendance validation with minimal complexity. It's a good starting point that can be enhanced with more sophisticated security measures as needed.

The system is designed to be:
- **Simple**: Easy to understand and maintain
- **Lightweight**: No external dependencies
- **Compatible**: Works across all modern browsers
- **Extensible**: Easy to add more features later
