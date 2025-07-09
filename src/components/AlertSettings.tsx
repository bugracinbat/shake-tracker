import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

export interface AlertPreferences {
  enabled: boolean;
  minMagnitude: number;
  maxDistance: number;
  playSound: boolean;
  showNotification: boolean;
  userLocation: { lat: number; lng: number } | null;
}

interface AlertSettingsProps {
  open: boolean;
  onClose: () => void;
  preferences: AlertPreferences;
  onSave: (preferences: AlertPreferences) => void;
}

const AlertSettings = ({
  open,
  onClose,
  preferences,
  onSave,
}: AlertSettingsProps) => {
  const [localPrefs, setLocalPrefs] = useState<AlertPreferences>(preferences);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleLocationRequest = () => {
    setLocationStatus('loading');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalPrefs({
            ...localPrefs,
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('error');
        },
        { timeout: 10000 }
      );
    } else {
      setLocationStatus('error');
    }
  };

  const handleNotificationRequest = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Earthquake Alert Settings</Typography>
          </Box>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={localPrefs.enabled}
                onChange={(e) =>
                  setLocalPrefs({ ...localPrefs, enabled: e.target.checked })
                }
                color="primary"
              />
            }
            label="Enable Earthquake Alerts"
            sx={{ mb: 3 }}
          />

          {localPrefs.enabled && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography gutterBottom>
                  Minimum Magnitude: {localPrefs.minMagnitude.toFixed(1)}
                </Typography>
                <Slider
                  value={localPrefs.minMagnitude}
                  onChange={(_, value) =>
                    setLocalPrefs({
                      ...localPrefs,
                      minMagnitude: value as number,
                    })
                  }
                  min={3.0}
                  max={8.0}
                  step={0.1}
                  marks={[
                    { value: 3, label: '3.0' },
                    { value: 5, label: '5.0' },
                    { value: 7, label: '7.0' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography gutterBottom>Location-based Alerts</Typography>
                  {localPrefs.userLocation && (
                    <Chip
                      icon={<LocationOnIcon />}
                      label="Location Set"
                      color="success"
                      size="small"
                    />
                  )}
                </Box>
                {!localPrefs.userLocation ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enable location to receive alerts for earthquakes near you
                  </Alert>
                ) : (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Alerts will be shown for earthquakes within{' '}
                    {localPrefs.maxDistance} km of your location
                  </Typography>
                )}
                <Button
                  variant={localPrefs.userLocation ? 'outlined' : 'contained'}
                  startIcon={<LocationOnIcon />}
                  onClick={handleLocationRequest}
                  disabled={locationStatus === 'loading'}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {locationStatus === 'loading'
                    ? 'Getting Location...'
                    : localPrefs.userLocation
                    ? 'Update Location'
                    : 'Enable Location'}
                </Button>
                {locationStatus === 'error' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to get location. Please check your browser settings.
                  </Alert>
                )}
                {localPrefs.userLocation && (
                  <Box sx={{ mb: 2 }}>
                    <Typography gutterBottom>
                      Maximum Distance: {localPrefs.maxDistance} km
                    </Typography>
                    <Slider
                      value={localPrefs.maxDistance}
                      onChange={(_, value) =>
                        setLocalPrefs({
                          ...localPrefs,
                          maxDistance: value as number,
                        })
                      }
                      min={50}
                      max={1000}
                      step={50}
                      marks={[
                        { value: 100, label: '100km' },
                        { value: 500, label: '500km' },
                        { value: 1000, label: '1000km' },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Alert Types
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPrefs.playSound}
                      onChange={(e) =>
                        setLocalPrefs({
                          ...localPrefs,
                          playSound: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Play Sound Alert"
                  sx={{ display: 'block', mb: 1 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={localPrefs.showNotification}
                      onChange={(e) =>
                        setLocalPrefs({
                          ...localPrefs,
                          showNotification: e.target.checked,
                        })
                      }
                      disabled={notificationPermission !== 'granted'}
                    />
                  }
                  label="Show Desktop Notifications"
                  sx={{ display: 'block' }}
                />
                {notificationPermission === 'default' && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleNotificationRequest}
                    sx={{ mt: 1 }}
                  >
                    Enable Notifications
                  </Button>
                )}
                {notificationPermission === 'denied' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Notifications are blocked. Please enable them in your browser
                    settings.
                  </Alert>
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertSettings;