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
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import type { Earthquake } from "../types/earthquake";

interface EarthquakeAnalyticsProps {
  earthquakes: Earthquake[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const EarthquakeAnalytics = ({ earthquakes }: EarthquakeAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("7d");

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
  };

  const filteredEarthquakes = useMemo(() => {
    const now = new Date();
    const days = parseInt(timeRange);
    const startDate = subDays(now, days);
    return earthquakes.filter((eq) => parseISO(eq.date_time) >= startDate);
  }, [earthquakes, timeRange]);

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

  // Time Series Data
  const timeSeriesData = useMemo(() => {
    const dailyData = new Map();
    filteredEarthquakes.forEach((eq) => {
      const date = format(parseISO(eq.date_time), "MMM dd");
      dailyData.set(date, (dailyData.get(date) || 0) + 1);
    });

    return Array.from(dailyData.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }, [filteredEarthquakes]);

  // Depth Distribution Data
  const depthData = useMemo(() => {
    const ranges = {
      "0-10": 0,
      "10-20": 0,
      "20-30": 0,
      "30-40": 0,
      "40+": 0,
    };

    filteredEarthquakes.forEach((eq) => {
      const depth = eq.depth;
      if (depth < 10) ranges["0-10"]++;
      else if (depth < 20) ranges["10-20"]++;
      else if (depth < 30) ranges["20-30"]++;
      else if (depth < 40) ranges["30-40"]++;
      else ranges["40+"]++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count,
    }));
  }, [filteredEarthquakes]);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Earthquake Analytics
        </Typography>
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
      </Box>

      <Grid container spacing={3}>
        {/* Magnitude Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Magnitude Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={magnitudeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#8884d8"
                  name="Number of Earthquakes"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Time Series */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Earthquake Frequency Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#82ca9d"
                  name="Number of Earthquakes"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Depth Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Depth Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={depthData}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {depthData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EarthquakeAnalytics;
