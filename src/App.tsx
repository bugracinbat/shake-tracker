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
  borderRadius: "16px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.1)",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(26, 26, 26, 0.8)"
      : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 6px 24px rgba(0, 0, 0, 0.4)"
        : "0 6px 24px rgba(0, 0, 0, 0.15)",
  },
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
        main: darkMode ? "#90caf9" : "#1976d2",
        light: darkMode ? "#e3f2fd" : "#42a5f5",
        dark: darkMode ? "#1565c0" : "#1565c0",
        contrastText: "#fff",
      },
      secondary: {
        main: darkMode ? "#f48fb1" : "#9c27b0",
        light: darkMode ? "#fce4ec" : "#ba68c8",
        dark: darkMode ? "#c2185b" : "#7b1fa2",
        contrastText: "#fff",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      error: {
        main: darkMode ? "#ef5350" : "#d32f2f",
      },
      warning: {
        main: darkMode ? "#ffb74d" : "#ed6c02",
      },
      info: {
        main: darkMode ? "#29b6f6" : "#0288d1",
      },
      success: {
        main: darkMode ? "#66bb6a" : "#2e7d32",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: "-0.5px",
      },
      h2: {
        fontWeight: 700,
        letterSpacing: "-0.5px",
      },
      h3: {
        fontWeight: 600,
        letterSpacing: "-0.5px",
      },
      h4: {
        fontWeight: 600,
        letterSpacing: "-0.5px",
      },
      h5: {
        fontWeight: 600,
        letterSpacing: "-0.5px",
      },
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.5px",
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: "-0.25px",
      },
      subtitle2: {
        fontWeight: 500,
        letterSpacing: "-0.25px",
      },
      body1: {
        letterSpacing: "-0.25px",
      },
      body2: {
        letterSpacing: "-0.25px",
      },
      button: {
        fontWeight: 500,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 16px",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode
              ? "0 4px 20px rgba(0, 0, 0, 0.3)"
              : "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
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
          transition: "background-color 0.3s ease-in-out",
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
            <IconButton
              onClick={fetchEarthquakes}
              disabled={loading}
              sx={{
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "rotate(180deg)",
                },
              }}
            >
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
            <Alert
              severity="error"
              sx={{
                my: 2,
                borderRadius: 2,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
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
