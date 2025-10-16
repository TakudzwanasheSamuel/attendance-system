"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Geofence {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function TestGeofencingPage() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  // Fetch geofences
  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const response = await fetch('/api/geofences');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGeofences(data.geofences);
          }
        }
      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };

    fetchGeofences();
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setCurrentLocation(location);
        setIsLoadingLocation(false);
        
        toast({
          title: "Location obtained",
          description: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        toast({
          variant: "destructive",
          title: "Location error",
          description: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  };

  // Test geofencing
  const testGeofencing = () => {
    if (!currentLocation || !selectedGeofence) {
      toast({
        variant: "destructive",
        title: "Missing data",
        description: "Please get your location and select a geofence first.",
      });
      return;
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      selectedGeofence.latitude,
      selectedGeofence.longitude
    );

    const isValid = distance <= selectedGeofence.radius;
    const accuracy = currentLocation.accuracy;

    setValidationResult({
      isValid,
      distance: Math.round(distance),
      accuracy: Math.round(accuracy),
      geofence: selectedGeofence,
      location: currentLocation
    });

    toast({
      title: isValid ? "✅ Within geofence" : "❌ Outside geofence",
      description: `Distance: ${Math.round(distance)}m, Required: ${selectedGeofence.radius}m`,
    });
  };

  // Simulate different locations
  const simulateLocation = (lat: number, lng: number, name: string) => {
    const simulatedLocation: Location = {
      latitude: lat,
      longitude: lng,
      accuracy: 10
    };
    setCurrentLocation(simulatedLocation);
    
    toast({
      title: "Location simulated",
      description: `Simulated: ${name} (${lat}, ${lng})`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Geofencing Test Page</h1>
          <p className="text-muted-foreground mt-2">
            Test the geofencing functionality with real or simulated locations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Available Geofences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Available Geofences
              </CardTitle>
              <CardDescription>
                Select a geofence to test against
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {geofences.map((geofence) => (
                <div
                  key={geofence.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedGeofence?.id === geofence.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedGeofence(geofence)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{geofence.name}</h4>
                      <p className="text-sm text-muted-foreground">{geofence.description}</p>
                    </div>
                    <Badge variant="outline">{geofence.radius}m</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    📍 {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Location Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Location Testing
              </CardTitle>
              <CardDescription>
                Get your real location or simulate different positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Real Location */}
              <div className="space-y-2">
                <Button 
                  onClick={getCurrentLocation} 
                  disabled={isLoadingLocation}
                  className="w-full"
                >
                  {isLoadingLocation ? "Getting Location..." : "Get My Real Location"}
                </Button>
              </div>

              {/* Simulated Locations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Simulate Locations:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateLocation(-17.8252, 31.0335, "Lecture Hall Center")}
                  >
                    Inside Hall
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateLocation(-17.8200, 31.0300, "Far Away")}
                  >
                    Far Away
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateLocation(-17.8252, 31.0360, "Just Outside")}
                  >
                    Just Outside
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => simulateLocation(-17.8260, 31.0340, "Computer Lab")}
                  >
                    Computer Lab
                  </Button>
                </div>
              </div>

              {/* Current Location Display */}
              {currentLocation && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Current Location:</h4>
                  <div className="text-sm space-y-1">
                    <div>📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</div>
                    <div>🎯 Accuracy: {Math.round(currentLocation.accuracy)}m</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Button */}
        <div className="text-center">
          <Button 
            onClick={testGeofencing}
            disabled={!currentLocation || !selectedGeofence}
            size="lg"
          >
            Test Geofencing
          </Button>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Validation Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Geofence Details:</h4>
                  <div className="text-sm space-y-1">
                    <div>📍 {validationResult.geofence.name}</div>
                    <div>📏 Radius: {validationResult.geofence.radius}m</div>
                    <div>🎯 Center: {validationResult.geofence.latitude.toFixed(6)}, {validationResult.geofence.longitude.toFixed(6)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Validation:</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      Status: 
                      <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                        {validationResult.isValid ? "✅ Valid" : "❌ Invalid"}
                      </Badge>
                    </div>
                    <div>📏 Distance: {validationResult.distance}m</div>
                    <div>🎯 Required: ≤{validationResult.geofence.radius}m</div>
                    <div>📍 Accuracy: {validationResult.accuracy}m</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p><strong>1. Select a Geofence:</strong> Choose from the available geofences above</p>
              <p><strong>2. Get Location:</strong> Use "Get My Real Location" or simulate a location</p>
              <p><strong>3. Test:</strong> Click "Test Geofencing" to see if you're within the geofence</p>
              <p><strong>4. Results:</strong> View the validation results below</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Use the simulated locations to test different scenarios:
                <ul className="mt-2 space-y-1">
                  <li>• "Inside Hall" - Should be valid (within 50m radius)</li>
                  <li>• "Just Outside" - Should be invalid (outside 50m radius)</li>
                  <li>• "Far Away" - Should be invalid (very far from geofence)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
