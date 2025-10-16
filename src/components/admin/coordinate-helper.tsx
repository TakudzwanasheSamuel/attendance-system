"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CoordinateHelperProps {
  onCoordinatesSelected: (lat: number, lng: number) => void;
}

export function CoordinateHelper({ onCoordinatesSelected }: CoordinateHelperProps) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleMapsSearch = () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to search",
        variant: "destructive",
      });
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleManualEntry = () => {
    // This would typically open a modal or form for manual coordinate entry
    toast({
      title: "Manual Entry",
      description: "Please enter coordinates manually in the latitude and longitude fields above.",
    });
  };


  const useSampleCoordinates = (lat: number, lng: number, name: string) => {
    onCoordinatesSelected(lat, lng);
    toast({
      title: "Coordinates Set",
      description: `${name} coordinates have been set`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Coordinate Helper
        </CardTitle>
        <CardDescription>
          Get coordinates for your geofence location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Maps Search */}
        <div className="space-y-2">
          <Label htmlFor="address">Search Address</Label>
          <div className="flex gap-2">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., Midlands State University, Gweru"
            />
            <Button 
              variant="outline" 
              onClick={handleGoogleMapsSearch}
              disabled={isLoading}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => useSampleCoordinates(-17.8252, 31.0335, "MSU Main Campus")}
            >
              MSU Main Campus
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => useSampleCoordinates(-17.8260, 31.0340, "Computer Lab")}
            >
              Computer Lab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => useSampleCoordinates(-17.8200, 31.0300, "Library")}
            >
              Library
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
