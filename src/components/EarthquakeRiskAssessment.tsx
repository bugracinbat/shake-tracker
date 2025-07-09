import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Shield as ShieldIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import type { Earthquake } from '../types/earthquake';

interface RiskFactors {
  recentActivity: number;
  magnitudeTrend: number;
  depthFactor: number;
  proximityFactor: number;
  historicalRisk: number;
}

interface EarthquakeRiskAssessmentProps {
  earthquakes: Earthquake[];
  userLocation?: { lat: number; lng: number } | null;
}

const EarthquakeRiskAssessment = ({
  earthquakes,
  userLocation,
}: EarthquakeRiskAssessmentProps) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState({
    lat: userLocation?.lat || 0,
    lng: userLocation?.lng || 0,
  });

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
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
  };

  const riskAnalysis = useMemo(() => {
    if (!userLocation && customLocation.lat === 0 && customLocation.lng === 0) {
      return null;
    }

    const location = userLocation || customLocation;
    const now = new Date();
    const last24h = earthquakes.filter(
      (eq) => now.getTime() - new Date(eq.date_time).getTime() < 86400000
    );
    const last7d = earthquakes.filter(
      (eq) =>
        now.getTime() - new Date(eq.date_time).getTime() < 7 * 86400000
    );
    const last30d = earthquakes.filter(
      (eq) =>
        now.getTime() - new Date(eq.date_time).getTime() < 30 * 86400000
    );

    // Calculate nearby earthquakes
    const nearbyQuakes = earthquakes.filter((eq) => {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        eq.geojson.coordinates[1],
        eq.geojson.coordinates[0]
      );
      return distance < 500; // Within 500km
    });

    const veryNearQuakes = nearbyQuakes.filter((eq) => {
      const distance = calculateDistance(
        location.lat,
        location.lng,
        eq.geojson.coordinates[1],
        eq.geojson.coordinates[0]
      );
      return distance < 100; // Within 100km
    });

    // Risk factors calculation
    const factors: RiskFactors = {
      // Recent activity score (0-100)
      recentActivity: Math.min(
        100,
        (last24h.length * 10 + last7d.length * 2 + last30d.length * 0.5)
      ),
      // Magnitude trend score (0-100)
      magnitudeTrend:
        last7d.length > 0
          ? Math.min(
              100,
              (last7d.reduce((sum, eq) => sum + eq.mag, 0) / last7d.length) * 20
            )
          : 0,
      // Depth factor (shallow earthquakes are more dangerous)
      depthFactor:
        nearbyQuakes.length > 0
          ? Math.min(
              100,
              100 -
                nearbyQuakes.reduce((sum, eq) => sum + eq.depth, 0) /
                  nearbyQuakes.length
            )
          : 0,
      // Proximity to recent earthquakes
      proximityFactor: Math.min(100, veryNearQuakes.length * 15),
      // Historical risk based on past major earthquakes
      historicalRisk:
        nearbyQuakes.filter((eq) => eq.mag >= 6).length * 20 +
        nearbyQuakes.filter((eq) => eq.mag >= 5).length * 10,
    };

    // Calculate overall risk score
    const overallRisk =
      (factors.recentActivity * 0.25 +
        factors.magnitudeTrend * 0.2 +
        factors.depthFactor * 0.15 +
        factors.proximityFactor * 0.25 +
        factors.historicalRisk * 0.15) /
      100;

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
    let riskColor: string;
    if (overallRisk < 0.25) {
      riskLevel = 'low';
      riskColor = theme.palette.success.main;
    } else if (overallRisk < 0.5) {
      riskLevel = 'moderate';
      riskColor = theme.palette.warning.main;
    } else if (overallRisk < 0.75) {
      riskLevel = 'high';
      riskColor = theme.palette.error.main;
    } else {
      riskLevel = 'very-high';
      riskColor = theme.palette.error.dark;
    }

    // Safety recommendations
    const recommendations = [];
    if (veryNearQuakes.length > 0) {
      recommendations.push({
        priority: 'high',
        text: 'Recent earthquakes detected within 100km. Stay alert and review emergency procedures.',
      });
    }
    if (factors.magnitudeTrend > 50) {
      recommendations.push({
        priority: 'medium',
        text: 'Increasing earthquake magnitude trend detected. Consider preparing emergency supplies.',
      });
    }
    if (factors.depthFactor > 70) {
      recommendations.push({
        priority: 'medium',
        text: 'Shallow earthquakes detected nearby. These can cause more surface damage.',
      });
    }
    if (overallRisk < 0.25) {
      recommendations.push({
        priority: 'low',
        text: 'Low seismic activity in your area. Maintain basic earthquake preparedness.',
      });
    }

    return {
      factors,
      overallRisk,
      riskLevel,
      riskColor,
      recommendations,
      statistics: {
        last24h: last24h.length,
        last7d: last7d.length,
        last30d: last30d.length,
        nearbyQuakes: nearbyQuakes.length,
        veryNearQuakes: veryNearQuakes.length,
        avgMagnitude:
          nearbyQuakes.length > 0
            ? (
                nearbyQuakes.reduce((sum, eq) => sum + eq.mag, 0) /
                nearbyQuakes.length
              ).toFixed(1)
            : 0,
      },
    };
  }, [earthquakes, userLocation, customLocation, theme]);

  const handleLocationSubmit = () => {
    setDialogOpen(false);
  };

  if (!riskAnalysis) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          background:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : theme.palette.background.paper,
        }}
      >
        <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Location Required for Risk Assessment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your location to calculate earthquake risk in your area
        </Typography>
        <Button
          variant="contained"
          startIcon={<LocationIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Set Location
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShieldIcon /> Earthquake Risk Assessment
        </Typography>

        {/* Overall Risk Score */}
        <Card
          sx={{
            mb: 3,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(
                    riskAnalysis.riskColor,
                    0.1
                  )} 0%, ${alpha(riskAnalysis.riskColor, 0.05)} 100%)`
                : `linear-gradient(135deg, ${alpha(
                    riskAnalysis.riskColor,
                    0.05
                  )} 0%, ${alpha(riskAnalysis.riskColor, 0.02)} 100%)`,
            border: `1px solid ${alpha(riskAnalysis.riskColor, 0.3)}`,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" gutterBottom>
                  Overall Risk Level
                </Typography>
                <Chip
                  label={riskAnalysis.riskLevel.toUpperCase()}
                  color={
                    riskAnalysis.riskLevel === 'low'
                      ? 'success'
                      : riskAnalysis.riskLevel === 'moderate'
                      ? 'warning'
                      : 'error'
                  }
                  size="large"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{ color: riskAnalysis.riskColor, fontWeight: 'bold' }}
                >
                  {Math.round(riskAnalysis.overallRisk * 100)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Risk Score
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={riskAnalysis.overallRisk * 100}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: alpha(riskAnalysis.riskColor, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  bgcolor: riskAnalysis.riskColor,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 4 }}>
          Risk Factors Analysis
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {Object.entries(riskAnalysis.factors).map(([key, value]) => (
            <Box key={key} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={value}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(value)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Area Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Seismic Activity in Your Area
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(16.666% - 10px)' } }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {riskAnalysis.statistics.last24h}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last 24h
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(16.666% - 10px)' } }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {riskAnalysis.statistics.last7d}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last 7 days
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(16.666% - 10px)' } }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {riskAnalysis.statistics.nearbyQuakes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Within 500km
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(16.666% - 10px)' } }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                  {riskAnalysis.statistics.veryNearQuakes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Within 100km
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(16.666% - 10px)' } }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {riskAnalysis.statistics.avgMagnitude}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Magnitude
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Safety Recommendations */}
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Safety Recommendations
          </Typography>
          <List dense>
            {riskAnalysis.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {rec.priority === 'high' ? (
                    <WarningIcon color="error" />
                  ) : rec.priority === 'medium' ? (
                    <TrendingUpIcon color="warning" />
                  ) : (
                    <CheckCircleIcon color="success" />
                  )}
                </ListItemIcon>
                <ListItemText primary={rec.text} />
              </ListItem>
            ))}
          </List>
        </Alert>

        {/* Preparedness Checklist */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Earthquake Preparedness Checklist
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {[
              'Emergency kit with water and food',
              'First aid supplies',
              'Flashlight and batteries',
              'Emergency contact list',
              'Know safe spots in each room',
              'Practice drop, cover, and hold on',
            ].map((item, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2">{item}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Location Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Set Your Location</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={customLocation.lat}
              onChange={(e) =>
                setCustomLocation({
                  ...customLocation,
                  lat: parseFloat(e.target.value) || 0,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={customLocation.lng}
              onChange={(e) =>
                setCustomLocation({
                  ...customLocation,
                  lng: parseFloat(e.target.value) || 0,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLocationSubmit} variant="contained">
            Set Location
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EarthquakeRiskAssessment;