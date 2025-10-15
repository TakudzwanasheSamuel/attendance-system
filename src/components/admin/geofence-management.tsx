"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CoordinateHelper } from './coordinate-helper';
import { toast } from '@/hooks/use-toast';

interface Geofence {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface GeofenceManagementProps {
  geofences: Geofence[];
  onGeofenceCreate: (geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onGeofenceUpdate: (id: string, geofence: Partial<Geofence>) => Promise<void>;
  onGeofenceDelete: (id: string) => Promise<void>;
}

export function GeofenceManagement({ 
  geofences, 
  onGeofenceCreate, 
  onGeofenceUpdate, 
  onGeofenceDelete 
}: GeofenceManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    radius: '50',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      radius: '50',
      isActive: true
    });
  };

  const handleCreate = async () => {
    try {
      await onGeofenceCreate({
        name: formData.name,
        description: formData.description || undefined,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius),
        isActive: formData.isActive
      });
      
      resetForm();
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Geofence created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create geofence",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingGeofence) return;
    
    try {
      await onGeofenceUpdate(editingGeofence.id, {
        name: formData.name,
        description: formData.description || undefined,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseFloat(formData.radius),
        isActive: formData.isActive
      });
      
      setEditingGeofence(null);
      resetForm();
      toast({
        title: "Success",
        description: "Geofence updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update geofence",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onGeofenceDelete(id);
      toast({
        title: "Success",
        description: "Geofence deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete geofence",
        variant: "destructive",
      });
    }
  };

  const startEdit = (geofence: Geofence) => {
    setEditingGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description || '',
      latitude: geofence.latitude.toString(),
      longitude: geofence.longitude.toString(),
      radius: geofence.radius.toString(),
      isActive: geofence.isActive
    });
  };

  const getCurrentLocation = () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter coordinates manually.",
        variant: "destructive",
      });
      return;
    }

    // Check if we're on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      toast({
        title: "HTTPS Required",
        description: "Geolocation requires HTTPS. Please enter coordinates manually or use localhost.",
        variant: "destructive",
      });
      return;
    }

    // Show loading state
    toast({
      title: "Getting Location",
      description: "Please allow location access when prompted...",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        
        toast({
          title: "Location Obtained",
          description: `Coordinates: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        });
      },
      (error) => {
        let errorMessage = "Unable to get current location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your GPS settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Geofence Management</h2>
          <p className="text-muted-foreground">
            Manage location-based attendance boundaries
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Geofence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Geofence</DialogTitle>
              <DialogDescription>
                Define a geographical boundary for attendance tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Lecture Hall"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="e.g., -17.8252"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 31.0335"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use Current Location
                </Button>
                <div className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Geolocation requires HTTPS or localhost. If it doesn't work, use the helper below.
                </div>
              </div>
              
              {/* Coordinate Helper */}
              <CoordinateHelper 
                onCoordinatesSelected={(lat, lng) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat.toString(),
                    longitude: lng.toString()
                  }));
                }}
              />
              <div className="grid gap-2">
                <Label htmlFor="radius">Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                  placeholder="50"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Geofence</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {geofences.map((geofence) => (
          <Card key={geofence.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{geofence.name}</CardTitle>
                <Badge variant={geofence.isActive ? "default" : "secondary"}>
                  {geofence.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {geofence.description && (
                <CardDescription>{geofence.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <div>📍 {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}</div>
                <div>📏 Radius: {geofence.radius}m</div>
                <div>📅 Created: {new Date(geofence.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(geofence)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Geofence</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{geofence.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(geofence.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingGeofence} onOpenChange={(open) => !open && setEditingGeofence(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Geofence</DialogTitle>
            <DialogDescription>
              Update the geofence details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Lecture Hall"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g., -17.8252"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g., 31.0335"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-radius">Radius (meters)</Label>
              <Input
                id="edit-radius"
                type="number"
                value={formData.radius}
                onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                placeholder="50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGeofence(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Geofence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


