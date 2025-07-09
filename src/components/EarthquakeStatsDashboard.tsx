import { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import LayersIcon from '@mui/icons-material/Layers';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Earthquake } from '../types/earthquake';

interface EarthquakeStatsDashboardProps {
  earthquakes: Earthquake[];
}

const EarthquakeStatsDashboard = ({
  earthquakes,
}: EarthquakeStatsDashboardProps) => {
  const theme = useTheme();

  const stats = useMemo(() => {
    if (earthquakes.length === 0) {
      return {
        byMagnitude: [],
        byDepth: [],
        byTime: [],
        byCountry: [],
        topCities: [],
        severityDistribution: [],
        hourlyDistribution: [],
      };
    }

    // Magnitude distribution
    const magnitudeRanges = {
      'Minor (< 4.0)': 0,
      'Light (4.0-4.9)': 0,
      'Moderate (5.0-5.9)': 0,
      'Strong (6.0-6.9)': 0,
      'Major (≥ 7.0)': 0,
    };

    earthquakes.forEach((eq) => {
      if (eq.mag < 4.0) magnitudeRanges['Minor (< 4.0)']++;
      else if (eq.mag < 5.0) magnitudeRanges['Light (4.0-4.9)']++;
      else if (eq.mag < 6.0) magnitudeRanges['Moderate (5.0-5.9)']++;
      else if (eq.mag < 7.0) magnitudeRanges['Strong (6.0-6.9)']++;
      else magnitudeRanges['Major (≥ 7.0)']++;
    });

    const byMagnitude = Object.entries(magnitudeRanges).map(
      ([name, value]) => ({
        name,
        value,
        percentage: ((value / earthquakes.length) * 100).toFixed(1),
      })
    );

    // Depth distribution
    const depthRanges = {
      'Shallow (0-70km)': 0,
      'Intermediate (70-300km)': 0,
      'Deep (> 300km)': 0,
    };

    earthquakes.forEach((eq) => {
      if (eq.depth <= 70) depthRanges['Shallow (0-70km)']++;
      else if (eq.depth <= 300) depthRanges['Intermediate (70-300km)']++;
      else depthRanges['Deep (> 300km)']++;
    });

    const byDepth = Object.entries(depthRanges).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / earthquakes.length) * 100).toFixed(1),
    }));

    // Time distribution (last 7 days by hour)
    const hourlyCount = new Array(24).fill(0);
    earthquakes.forEach((eq) => {
      const hour = new Date(eq.date_time).getHours();
      hourlyCount[hour]++;
    });

    const hourlyDistribution = hourlyCount.map((count, hour) => ({
      hour: `${hour}:00`,
      count,
      fullMark: Math.max(...hourlyCount),
    }));

    // Top affected cities
    const cityCount: { [key: string]: number } = {};
    earthquakes.forEach((eq) => {
      const city = eq.location_properties.closestCity.name;
      cityCount[city] = (cityCount[city] || 0) + 1;
    });

    const topCities = Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([city, count]) => ({
        city,
        count,
        percentage: ((count / earthquakes.length) * 100).toFixed(1),
      }));

    // Severity distribution for radial chart
    const severityDistribution = [
      {
        name: 'Low Risk',
        value: earthquakes.filter((eq) => eq.mag < 4.5).length,
        fill: theme.palette.success.main,
      },
      {
        name: 'Medium Risk',
        value: earthquakes.filter((eq) => eq.mag >= 4.5 && eq.mag < 6).length,
        fill: theme.palette.warning.main,
      },
      {
        name: 'High Risk',
        value: earthquakes.filter((eq) => eq.mag >= 6).length,
        fill: theme.palette.error.main,
      },
    ];

    return {
      byMagnitude,
      byDepth,
      hourlyDistribution,
      topCities,
      severityDistribution,
    };
  }, [earthquakes, theme]);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
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
        <PublicIcon /> Earthquake Statistics Dashboard
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Magnitude Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <TrendingUpIcon color="primary" /> Magnitude Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byMagnitude}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {stats.byMagnitude.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Depth Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LayersIcon color="secondary" /> Depth Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="90%"
                data={stats.byDepth}
                startAngle={180}
                endAngle={0}
              >
                <PolarGrid />
                <PolarAngleAxis type="number" domain={[0, 100]} />
                <RadialBar
                  background
                  dataKey="value"
                  fill={theme.palette.secondary.main}
                />
                <Legend
                  iconSize={18}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Hourly Activity Pattern */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Paper
            sx={{
              p: 3,
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3,
              }}
            >
              <AccessTimeIcon color="info" /> 24-Hour Activity Pattern
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {stats.hourlyDistribution.map((hour) => (
                <Box
                  key={hour.hour}
                  sx={{
                    flex: '1 1 auto',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      height: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        background: theme.palette.primary.main,
                        height: `${(hour.count / hour.fullMark) * 100}%`,
                        minHeight: hour.count > 0 ? '4px' : '0',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {hour.hour.split(':')[0]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Top Affected Cities */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Top Affected Cities
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.topCities.slice(0, 5).map((city, index) => (
                <Box key={city.city}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {index + 1}. {city.city}
                    </Typography>
                    <Chip
                      label={`${city.count} (${city.percentage}%)`}
                      size="small"
                      color={index === 0 ? 'primary' : 'default'}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(city.percentage)}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor:
                          index === 0
                            ? theme.palette.primary.main
                            : theme.palette.primary.light,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Risk Distribution */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.8)
                  : theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Risk Level Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.severityDistribution.map((severity) => (
                <Box key={severity.name}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: severity.fill,
                      borderWidth: 2,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ color: severity.fill }}
                        >
                          {severity.name}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 'bold',
                            color: severity.fill,
                          }}
                        >
                          {severity.value}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(severity.value / earthquakes.length) * 100}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(severity.fill, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: severity.fill,
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default EarthquakeStatsDashboard;