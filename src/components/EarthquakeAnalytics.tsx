import { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Tooltip as MuiTooltip,
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
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Brush,
} from "recharts";
import { format, subDays, parseISO, differenceInHours } from "date-fns";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import type { Earthquake } from "../types/earthquake";
import { alpha, useTheme } from "@mui/material/styles";

interface EarthquakeAnalyticsProps {
  earthquakes: Earthquake[];
}

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

// Fix CustomTooltip to return React.ReactElement or null
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: string | number; color: string }>;
  label?: string;
}
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload = [],
  label,
}) => {
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
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState("7");
  const [selectedMagnitude, setSelectedMagnitude] = useState<string | null>(
    null
  );

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const handleMagnitudeClick = (data: { range: string }) => {
    setSelectedMagnitude(data.range === selectedMagnitude ? null : data.range);
  };

  // Filtered earthquakes with magnitude and depth
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
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        borderRadius: 6,
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(120deg, ${alpha(
                theme.palette.primary.main,
                0.35
              )} 0%, ${alpha(theme.palette.secondary.main, 0.25)} 100%)`
            : `linear-gradient(120deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 12px 48px ${alpha(theme.palette.primary.main, 0.45)}`
            : `0 12px 48px ${alpha(theme.palette.primary.main, 0.08)}`,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(18px) saturate(1.2)",
        border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
        animation: "fadeInAnalytics 0.8s cubic-bezier(0.4,0,0.2,1)",
        "@keyframes fadeInAnalytics": {
          from: { opacity: 0, filter: "blur(10px)" },
          to: { opacity: 1, filter: "none" },
        },
      }}
    >
      {/* Floating Stats Bar - responsive grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 4,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Add glassy effect to stat cards */}
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 4,
            minWidth: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.85)
                : "rgba(255,255,255,0.85)",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.getContrastText(theme.palette.primary.main)
                : theme.palette.text.primary,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                : "0 4px 24px rgba(33,150,243,0.10)",
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
            "@keyframes fadeInCard": {
              from: { opacity: 0, filter: "blur(6px)" },
              to: { opacity: 1, filter: "none" },
            },
          }}
        >
          <span role="img" aria-label="total">
            📊
          </span>
          <Typography
            variant="h6"
            color="primary.main"
            fontWeight={700}
            sx={{ lineHeight: 1 }}
          >
            {stats.totalCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total
          </Typography>
        </Paper>
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 4,
            minWidth: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.85)
                : "rgba(255,255,255,0.85)",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.getContrastText(theme.palette.primary.main)
                : theme.palette.text.primary,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                : "0 4px 24px rgba(33,150,243,0.10)",
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
            "@keyframes fadeInCard": {
              from: { opacity: 0, filter: "blur(6px)" },
              to: { opacity: 1, filter: "none" },
            },
          }}
        >
          <span role="img" aria-label="avg">
            📈
          </span>
          <Typography
            variant="h6"
            color="warning.main"
            fontWeight={700}
            sx={{ lineHeight: 1 }}
          >
            {stats.avgMagnitude}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Magnitude
          </Typography>
        </Paper>
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 4,
            minWidth: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.85)
                : "rgba(255,255,255,0.85)",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.getContrastText(theme.palette.primary.main)
                : theme.palette.text.primary,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                : "0 4px 24px rgba(33,150,243,0.10)",
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
            "@keyframes fadeInCard": {
              from: { opacity: 0, filter: "blur(6px)" },
              to: { opacity: 1, filter: "none" },
            },
          }}
        >
          <span role="img" aria-label="max">
            💥
          </span>
          <Typography
            variant="h6"
            color="error.main"
            fontWeight={700}
            sx={{ lineHeight: 1 }}
          >
            {stats.maxMagnitude}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Max Magnitude
          </Typography>
        </Paper>
        <Paper
          elevation={6}
          sx={{
            p: 2,
            borderRadius: 4,
            minWidth: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.85)
                : "rgba(255,255,255,0.85)",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.getContrastText(theme.palette.primary.main)
                : theme.palette.text.primary,
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 4px 24px ${alpha(theme.palette.primary.main, 0.25)}`
                : "0 4px 24px rgba(33,150,243,0.10)",
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
            "@keyframes fadeInCard": {
              from: { opacity: 0, filter: "blur(6px)" },
              to: { opacity: 1, filter: "none" },
            },
          }}
        >
          <span role="img" aria-label="recent">
            ⏰
          </span>
          <Typography
            variant="h6"
            color="info.main"
            fontWeight={700}
            sx={{ lineHeight: 1 }}
          >
            {stats.recentCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last 24h
          </Typography>
        </Paper>
      </Box>

      {/* Responsive: Title/Time Range controls */}
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
          sx={{ mb: { xs: 1, sm: 0 }, textAlign: { xs: "center", sm: "left" } }}
        >
          Earthquake Analytics
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <FormControl sx={{ minWidth: 120, width: { xs: "100%", sm: 120 } }}>
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
        </Box>
      </Box>

      {/* Key Statistics - responsive grid */}
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

      {/* Main Charts - responsive grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            p: 2,
            height: "100%",
            minHeight: 400,
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
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
        <Paper
          sx={{
            p: 2,
            height: "100%",
            minHeight: 400,
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
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
              <Scatter
                yAxisId="right"
                type="monotone"
                dataKey="avgMagnitude"
                stroke="#ff7300"
                name="Average Magnitude"
                strokeWidth={2}
                animationDuration={1500}
              />
              <Scatter
                yAxisId="right"
                type="monotone"
                dataKey="maxMagnitude"
                stroke="#ff0000"
                name="Max Magnitude"
                strokeWidth={2}
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
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
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
            backdropFilter: "blur(10px)",
            border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
            animation: "fadeInCard 0.7s cubic-bezier(0.4,0,0.2,1)",
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
