import { useEffect, useRef, useCallback } from 'react';
import type { Earthquake } from '../types/earthquake';

interface AlertConfig {
  minMagnitude: number;
  maxDistance?: number;
  userLocation?: { lat: number; lng: number } | null;
  playSound?: boolean;
  showNotification?: boolean;
}

export const useEarthquakeAlerts = (
  earthquakes: Earthquake[],
  config: AlertConfig
) => {
  const previousEarthquakesRef = useRef<Set<string>>(new Set());
  const notificationPermissionRef = useRef<NotificationPermission>('default');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission;
      });
    }
  }, []);

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const playAlertSound = useCallback(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZijUHFmm98OScTgwOUarp5blmFgU1kNjw0HkyCipt');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore errors if audio playback is blocked
    });
  }, []);

  const showNotification = useCallback((earthquake: Earthquake) => {
    if (
      'Notification' in window &&
      notificationPermissionRef.current === 'granted'
    ) {
      const notification = new Notification('Earthquake Alert!', {
        body: `Magnitude ${earthquake.mag} earthquake detected near ${earthquake.location_properties.closestCity.name}`,
        icon: '/logo.svg',
        badge: '/logo.svg',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: earthquake._id,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  }, []);

  useEffect(() => {
    const currentEarthquakeIds = new Set(earthquakes.map((eq) => eq._id));
    const newEarthquakes = earthquakes.filter(
      (eq) => !previousEarthquakesRef.current.has(eq._id)
    );

    // Check each new earthquake for alert criteria
    newEarthquakes.forEach((earthquake) => {
      // Check magnitude threshold
      if (earthquake.mag < config.minMagnitude) return;

      // Check distance if user location is provided
      if (config.userLocation && config.maxDistance) {
        const distance = calculateDistance(
          config.userLocation.lat,
          config.userLocation.lng,
          earthquake.geojson.coordinates[1],
          earthquake.geojson.coordinates[0]
        );
        if (distance > config.maxDistance) return;
      }

      // Trigger alerts
      if (config.playSound) {
        playAlertSound();
      }

      if (config.showNotification) {
        showNotification(earthquake);
      }

      // Dispatch custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent('earthquakeAlert', {
          detail: earthquake,
        })
      );
    });

    // Update the reference with current earthquake IDs
    previousEarthquakesRef.current = currentEarthquakeIds;
  }, [
    earthquakes,
    config,
    calculateDistance,
    playAlertSound,
    showNotification,
  ]);

  return {
    notificationPermission: notificationPermissionRef.current,
  };
};