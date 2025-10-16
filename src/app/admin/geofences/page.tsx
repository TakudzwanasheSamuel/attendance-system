import { getAllGeofences } from '@/lib/geofence-actions';
import { GeofenceManagement } from '@/components/admin/geofence-management';
import { createGeofence, updateGeofence, deleteGeofence } from '@/lib/geofence-actions';

export default async function GeofencesPage() {
  const result = await getAllGeofences();
  const geofences = result.success ? result.geofences : [];

  const handleCreateGeofence = async (geofenceData: {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
  }) => {
    'use server';
    const result = await createGeofence(geofenceData);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleUpdateGeofence = async (id: string, geofenceData: Partial<{
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    radius: number;
    isActive: boolean;
  }>) => {
    'use server';
    const result = await updateGeofence(id, geofenceData);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleDeleteGeofence = async (id: string) => {
    'use server';
    const result = await deleteGeofence(id);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <GeofenceManagement
        geofences={geofences}
        onGeofenceCreate={handleCreateGeofence}
        onGeofenceUpdate={handleUpdateGeofence}
        onGeofenceDelete={handleDeleteGeofence}
      />
    </div>
  );
}


