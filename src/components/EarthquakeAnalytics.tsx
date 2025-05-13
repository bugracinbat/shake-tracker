import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
  IconButton,
  Tooltip as MuiTooltip,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Brush,
} from "recharts";
import {
  format,
  subDays,
  parseISO,
  differenceInHours,
  startOfDay,
  endOfDay,
} from "date-fns";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import type { Earthquake } from "../types/earthquake";

interface EarthquakeAnalyticsProps {
  earthquakes: Earthquake[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const StatCard = ({
  title,
  value,
  trend,
  icon,
  info,
}: {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  info?: string;
}) => {
  const theme = useTheme();
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {info && (
              <MuiTooltip title={info}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </MuiTooltip>
            )}
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {trend > 0 ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={trend > 0 ? "success.main" : "error.main"}
            >
              {Math.abs(trend)}% from previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "1px solid #ccc",
        }}
      >
        <Typography variant="subtitle2">{label}</Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const EarthquakeAnalytics = ({ earthquakes }: EarthquakeAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("7");
  const [viewMode, setViewMode] = useState("overview");
  const [selectedMagnitude, setSelectedMagnitude] = useState<string | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleViewModeChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setViewMode(newValue);
  };

  const handleMagnitudeClick = (data: any) => {
    setSelectedMagnitude(data.range === selectedMagnitude ? null : data.range);
  };

  const filteredEarthquakes = useMemo(() => {
    const now = new Date();
    const days = parseInt(timeRange);
    const startDate = subDays(now, days);
    return earthquakes.filter((eq) => parseISO(eq.date_time) >= startDate);
  }, [earthquakes, timeRange]);

  // Key Statistics
  const stats = useMemo(() => {
    const totalCount = filteredEarthquakes.length;
    const avgMagnitude =
      filteredEarthquakes.reduce((sum, eq) => sum + eq.mag, 0) / totalCount;
    const maxMagnitude = Math.max(...filteredEarthquakes.map((eq) => eq.mag));
    const recentCount = filteredEarthquakes.filter(
      (eq) => differenceInHours(new Date(), parseISO(eq.date_time)) < 24
    ).length;

    // Calculate trend (comparing with previous period)
    const previousPeriod = earthquakes.filter(
      (eq) =>
        parseISO(eq.date_time) >=
          subDays(new Date(), parseInt(timeRange) * 2) &&
        parseISO(eq.date_time) < subDays(new Date(), parseInt(timeRange))
    );
    const previousCount = previousPeriod.length;
    const trend = previousCount
      ? ((totalCount - previousCount) / previousCount) * 100
      : 0;

    // Calculate daily average
    const days = parseInt(timeRange);
    const dailyAverage = totalCount / days;

    // Calculate magnitude distribution
    const magnitudeDistribution = {
      low: filteredEarthquakes.filter((eq) => eq.mag < 4).length,
      medium: filteredEarthquakes.filter((eq) => eq.mag >= 4 && eq.mag < 6)
        .length,
      high: filteredEarthquakes.filter((eq) => eq.mag >= 6).length,
    };

    return {
      totalCount,
      avgMagnitude: avgMagnitude.toFixed(2),
      maxMagnitude: maxMagnitude.toFixed(1),
      recentCount,
      trend,
      dailyAverage: dailyAverage.toFixed(1),
      magnitudeDistribution,
    };
  }, [filteredEarthquakes, earthquakes, timeRange]);

  // Magnitude Distribution Data
  const magnitudeData = useMemo(() => {
    const ranges = {
      "0-2": 0,
      "2-4": 0,
      "4-6": 0,
      "6-8": 0,
      "8+": 0,
    };

    filteredEarthquakes.forEach((eq) => {
      const mag = eq.mag;
      if (mag < 2) ranges["0-2"]++;
      else if (mag < 4) ranges["2-4"]++;
      else if (mag < 6) ranges["4-6"]++;
      else if (mag < 8) ranges["6-8"]++;
      else ranges["8+"]++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
    }));
  }, [filteredEarthquakes]);

  // Time Series Data with Magnitude
  const timeSeriesData = useMemo(() => {
    const dailyData = new Map();
    filteredEarthquakes.forEach((eq) => {
      const date = format(parseISO(eq.date_time), "MMM dd");
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          count: 0,
          avgMagnitude: 0,
          totalMagnitude: 0,
          maxMagnitude: 0,
        });
      }
      const data = dailyData.get(date);
      data.count++;
      data.totalMagnitude += eq.mag;
      data.avgMagnitude = data.totalMagnitude / data.count;
      data.maxMagnitude = Math.max(data.maxMagnitude, eq.mag);
    });

    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      avgMagnitude: Number(data.avgMagnitude.toFixed(2)),
      maxMagnitude: Number(data.maxMagnitude.toFixed(1)),
    }));
  }, [filteredEarthquakes]);

  // Depth vs Magnitude Data
  const depthMagnitudeData = useMemo(() => {
    return filteredEarthquakes.map((eq) => ({
      depth: eq.depth,
      magnitude: eq.mag,
      size: Math.pow(eq.mag, 2) * 10, // Size based on magnitude
      date: format(parseISO(eq.date_time), "MMM dd"),
    }));
  }, [filteredEarthquakes]);

  // Recent Significant Earthquakes
  const recentSignificant = useMemo(() => {
    return filteredEarthquakes
      .filter((eq) => eq.mag >= 4.5)
      .sort(
        (a, b) =>
          parseISO(b.date_time).getTime() - parseISO(a.date_time).getTime()
      )
      .slice(0, 5);
  }, [filteredEarthquakes]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ mb: { xs: 1, sm: 0 } }}
        >
          Earthquake Analytics
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => setViewMode("overview")}
              variant={viewMode === "overview" ? "contained" : "outlined"}
            >
              Overview
            </Button>
            <Button
              onClick={() => setViewMode("magnitude")}
              variant={viewMode === "magnitude" ? "contained" : "outlined"}
            >
              Magnitude
            </Button>
            <Button
              onClick={() => setViewMode("depth")}
              variant={viewMode === "depth" ? "contained" : "outlined"}
            >
              Depth
            </Button>
          </ButtonGroup>
        </Box>
      </Box>

      {/* Key Statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <StatCard
          title="Total Earthquakes"
          value={stats.totalCount}
          trend={stats.trend}
          icon={<TrendingUpIcon color="primary" />}
          info={`Average ${stats.dailyAverage} earthquakes per day`}
        />
        <StatCard
          title="Average Magnitude"
          value={stats.avgMagnitude}
          icon={<WarningIcon color="warning" />}
          info={`${stats.magnitudeDistribution.low} low, ${stats.magnitudeDistribution.medium} medium, ${stats.magnitudeDistribution.high} high magnitude earthquakes`}
        />
        <StatCard
          title="Highest Magnitude"
          value={stats.maxMagnitude}
          icon={<WarningIcon color="error" />}
          info="Highest recorded magnitude in the selected period"
        />
        <StatCard
          title="Last 24 Hours"
          value={stats.recentCount}
          icon={<TrendingUpIcon color="info" />}
          info="Number of earthquakes in the last 24 hours"
        />
      </Box>

      {/* Main Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        {/* Magnitude Distribution */}
        <Paper sx={{ p: 2, height: "100%", minHeight: 400 }}>
          <Typography variant="h6" gutterBottom>
            Magnitude Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={magnitudeData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="count"
                fill="#8884d8"
                name="Number of Earthquakes"
                onClick={handleMagnitudeClick}
                cursor="pointer"
                animationDuration={1500}
              />
              {selectedMagnitude && (
                <ReferenceLine
                  x={selectedMagnitude}
                  stroke="red"
                  strokeDasharray="3 3"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Time Series */}
        <Paper sx={{ p: 2, height: "100%", minHeight: 400 }}>
          <Typography variant="h6" gutterBottom>
            Earthquake Activity Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={timeSeriesData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="count"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
                name="Number of Earthquakes"
                animationDuration={1500}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgMagnitude"
                stroke="#ff7300"
                name="Average Magnitude"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="maxMagnitude"
                stroke="#ff0000"
                name="Max Magnitude"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
              <Brush
                dataKey="date"
                height={30}
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Depth vs Magnitude */}
        <Paper
          sx={{
            p: 2,
            minHeight: 400,
            gridColumn: { xs: "1", md: "1 / -1" },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Depth vs Magnitude Correlation
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="depth"
                name="Depth"
                unit="km"
                label={{ value: "Depth (km)", position: "bottom" }}
              />
              <YAxis
                type="number"
                dataKey="magnitude"
                name="Magnitude"
                label={{ value: "Magnitude", angle: -90, position: "left" }}
              />
              <ZAxis type="number" dataKey="size" range={[50, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          border: "1px solid #ccc",
                        }}
                      >
                        <Typography variant="subtitle2">
                          Date: {data.date}
                        </Typography>
                        <Typography variant="body2">
                          Depth: {data.depth} km
                        </Typography>
                        <Typography variant="body2">
                          Magnitude: {data.magnitude}
                        </Typography>
                      </Paper>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Earthquakes"
                data={depthMagnitudeData}
                fill="#8884d8"
                animationDuration={1500}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Paper>

        {/* Recent Significant Earthquakes */}
        <Paper
          sx={{
            p: 2,
            height: "100%",
            minHeight: 400,
            gridColumn: { xs: "1", md: "1 / -1" },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Recent Significant Earthquakes
          </Typography>
          <Stack spacing={2}>
            {recentSignificant.map((eq, index) => (
              <Card key={`${eq.date_time}-${index}`} variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" component="div">
                      {eq.title}
                    </Typography>
                    <Chip
                      label={`M${eq.mag}`}
                      color={
                        eq.mag >= 6 ? "error" : eq.mag >= 5 ? "warning" : "info"
                      }
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format(parseISO(eq.date_time), "MMM dd, yyyy HH:mm")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Depth: {eq.depth} km
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default EarthquakeAnalytics;
