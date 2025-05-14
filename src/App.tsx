import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { getEarthquakes } from "./services/earthquakeService";
import type { Earthquake } from "./types/earthquake";
import EarthquakeList from "./components/EarthquakeList";
import EarthquakeMap from "./components/EarthquakeMap";
import EarthquakeAnalytics from "./components/EarthquakeAnalytics";
import EarthquakeSurvey from "./components/EarthquakeSurvey";
import Navbar from "./components/Navbar";
import RefreshIcon from "@mui/icons-material/Refresh";

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
}));

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

function AppContent() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<Earthquake[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEarthquakeId, setSelectedEarthquakeId] = useState<
    string | null
  >(null);
  const [darkMode, setDarkMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const location = useLocation();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#0070f3",
      },
      background: {
        default: darkMode ? "#000" : "#fafafa",
        paper: darkMode ? "#1a1a1a" : "#fff",
      },
    },
  });

  const fetchEarthquakes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEarthquakes();
      setEarthquakes(response.result);
      setFilteredEarthquakes(response.result);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarthquakes();

    // Set up automatic refresh
    const intervalId = setInterval(fetchEarthquakes, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchEarthquakes]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredEarthquakes(earthquakes);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = earthquakes.filter((earthquake) => {
      return (
        earthquake.title.toLowerCase().includes(searchTerm) ||
        earthquake.location_properties.closestCity.name
          .toLowerCase()
          .includes(searchTerm) ||
        earthquake.mag.toString().includes(searchTerm)
      );
    });
    setFilteredEarthquakes(filtered);
  };

  const handleEarthquakeSelect = (id: string) => {
    setSelectedEarthquakeId(id === selectedEarthquakeId ? null : id);
  };

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const formatLastRefresh = () => {
    return lastRefresh.toLocaleTimeString();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Navbar
          darkMode={darkMode}
          onThemeChange={handleThemeChange}
          earthquakes={earthquakes}
          onSearch={handleSearch}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            px: 2,
            pt: 1,
            pb: 0,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Last updated: {formatLastRefresh()}
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchEarthquakes} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <StyledContainer maxWidth="lg">
          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <EarthquakeSurvey />

                      <StyledPaper>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            letterSpacing: "-0.5px",
                          }}
                        >
                          Live Earthquake Map
                        </Typography>
                        <EarthquakeMap
                          earthquakes={filteredEarthquakes}
                          selectedEarthquakeId={selectedEarthquakeId}
                          onEarthquakeSelect={handleEarthquakeSelect}
                        />
                      </StyledPaper>

                      <StyledPaper>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            letterSpacing: "-0.5px",
                          }}
                        >
                          Recent Earthquakes
                        </Typography>
                        <EarthquakeList
                          earthquakes={filteredEarthquakes}
                          selectedEarthquakeId={selectedEarthquakeId}
                          onEarthquakeSelect={handleEarthquakeSelect}
                        />
                      </StyledPaper>
                    </>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <EarthquakeAnalytics earthquakes={filteredEarthquakes} />
                  }
                />
              </Routes>
            </Box>
          )}
        </StyledContainer>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
