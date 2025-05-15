import { useState, useEffect, useCallback, useRef } from "react";
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
  alpha,
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
import type { EarthquakeMapHandle } from "./components/EarthquakeMap";
import EarthquakeAnalytics from "./components/EarthquakeAnalytics";
import EarthquakeSurvey from "./components/EarthquakeSurvey";
import Navbar from "./components/Navbar";
import RefreshIcon from "@mui/icons-material/Refresh";
import NProgress from 'nprogress';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  maxWidth: "1400px",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "24px",
  boxShadow:
    theme.palette.mode === "dark"
      ? `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`
      : `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "blur(12px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 12px 48px ${alpha(theme.palette.common.black, 0.5)}`
        : `0 12px 48px ${alpha(theme.palette.common.black, 0.12)}`,
    transform: "translateY(-2px)",
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
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    return stored ? stored === "true" : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const location = useLocation();
  const mapRef = useRef<EarthquakeMapHandle>(null);

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
        default: darkMode ? "#0a0a0a" : "#fafafa",
        paper: darkMode ? "#1a1a1a" : "#ffffff",
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
        fontWeight: 800,
        letterSpacing: "-1px",
        fontSize: "3.5rem",
      },
      h2: {
        fontWeight: 700,
        letterSpacing: "-0.75px",
        fontSize: "2.75rem",
      },
      h3: {
        fontWeight: 700,
        letterSpacing: "-0.5px",
        fontSize: "2.25rem",
      },
      h4: {
        fontWeight: 600,
        letterSpacing: "-0.5px",
        fontSize: "1.75rem",
      },
      h5: {
        fontWeight: 600,
        letterSpacing: "-0.25px",
        fontSize: "1.5rem",
      },
      h6: {
        fontWeight: 600,
        letterSpacing: "-0.25px",
        fontSize: "1.25rem",
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: "-0.25px",
        fontSize: "1.1rem",
      },
      subtitle2: {
        fontWeight: 500,
        letterSpacing: "-0.25px",
        fontSize: "0.9rem",
      },
      body1: {
        letterSpacing: "-0.25px",
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        letterSpacing: "-0.25px",
        fontSize: "0.875rem",
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: "-0.25px",
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 20px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: `0 8px 24px ${alpha(
                darkMode ? "#000" : "#1976d2",
                0.25
              )}`,
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
            borderRadius: 24,
            boxShadow: darkMode
              ? `0 8px 32px ${alpha("#000", 0.4)}`
              : `0 8px 32px ${alpha("#000", 0.08)}`,
            border: `1px solid ${alpha(darkMode ? "#fff" : "#000", 0.1)}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: alpha(darkMode ? "#fff" : "#000", 0.04),
              },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode
              ? `0 4px 20px ${alpha("#000", 0.3)}`
              : `0 4px 20px ${alpha("#000", 0.1)}`,
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

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
    // Animate body background for smooth transition
    document.body.style.transition = 'background 0.4s cubic-bezier(0.4,0,0.2,1)';
  }, [darkMode]);

  // Show nprogress bar on route/data loading
  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  // Animate nprogress on route change
  useEffect(() => {
    NProgress.start();
    NProgress.set(0.4);
    const timeout = setTimeout(() => NProgress.done(), 400);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

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
    const eq = earthquakes.find((e) => e._id === id);
    if (eq && mapRef.current) {
      mapRef.current.flyToEarthquake(eq);
      // Scroll to map section
      const mapSection = document.getElementById("earthquake-map-section");
      if (mapSection) {
        mapSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleThemeChange = () => {
    setDarkMode((prev) => !prev);
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
          transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundImage: darkMode
            ? "radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 50%)"
            : "radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0) 50%)",
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
            px: 3,
            pt: 2,
            pb: 1,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            Last updated: {formatLastRefresh()}
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={fetchEarthquakes}
              disabled={loading}
              sx={{
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "rotate(180deg)",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {/* HERO SECTION - Only show on home page */}
        {location.pathname === "/" && (
          <Box
            sx={{
              width: "100%",
              minHeight: { xs: 300, md: 380 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              // Fix hero background for dark mode
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(120deg, ${alpha(
                      theme.palette.background.paper,
                      0.96
                    )} 0%, ${alpha(theme.palette.primary.dark, 0.7)} 100%)`
                  : `linear-gradient(120deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
              borderRadius: 6,
              mb: 5,
              boxShadow:
                theme.palette.mode === "dark"
                  ? `0 12px 48px ${alpha(theme.palette.common.black, 0.7)}`
                  : `0 12px 48px ${alpha(theme.palette.primary.main, 0.08)}`,
              p: { xs: 4, md: 8 },
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated background element for hero */}
            <Box
              sx={{
                position: "absolute",
                top: "-60px",
                right: "-60px",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background:
                  theme.palette.mode === "dark"
                    ? `radial-gradient(circle, ${alpha(
                        theme.palette.primary.dark,
                        0.5
                      )} 0%, ${alpha(theme.palette.secondary.dark, 0.3)} 100%)`
                    : `radial-gradient(circle, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                opacity: 0.18,
                filter: "blur(8px)",
                zIndex: 0,
                animation: "pulseHero 4s infinite alternate",
                "@keyframes pulseHero": {
                  from: { transform: "scale(1)" },
                  to: { transform: "scale(1.08)" },
                },
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.light
                    : theme.palette.primary.dark,
                mb: 2,
                textShadow:
                  theme.palette.mode === "dark"
                    ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
                    : `0 2px 8px ${alpha(theme.palette.primary.main, 0.09)}`,
                letterSpacing: "-1.5px",
                textAlign: "center",
              }}
            >
              Shake Tracker
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.primary,
                mb: 2,
                fontWeight: 500,
                textAlign: "center",
                maxWidth: 600,
              }}
            >
              Real-time earthquake monitoring, analytics, and community
              reporting. Stay safe and informed.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
                textAlign: "center",
                maxWidth: 500,
              }}
            >
              Explore recent seismic activity, view analytics, and share your
              experience with the community.
            </Typography>
            {/* Quick Analytics Section - improved card style */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                mb: 4,
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  minWidth: 140,
                  textAlign: "center",
                  p: 2,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.85)
                      : "background.paper",
                  boxShadow: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span role="img" aria-label="total">
                  📊
                </span>
                <Typography variant="h6" color="primary.main" fontWeight={700}>
                  {earthquakes.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Earthquakes
                </Typography>
              </Box>
              <Box
                sx={{
                  minWidth: 140,
                  textAlign: "center",
                  p: 2,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.85)
                      : "background.paper",
                  boxShadow: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span role="img" aria-label="strongest">
                  💥
                </span>
                <Typography variant="h6" color="error.main" fontWeight={700}>
                  {earthquakes.length > 0
                    ? Math.max(...earthquakes.map((e) => e.mag)).toFixed(1)
                    : "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Strongest Magnitude
                </Typography>
              </Box>
              <Box
                sx={{
                  minWidth: 140,
                  textAlign: "center",
                  p: 2,
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.85)
                      : "background.paper",
                  boxShadow: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <span role="img" aria-label="recent">
                  ⏰
                </span>
                <Typography variant="h6" color="info.main" fontWeight={700}>
                  {
                    earthquakes.filter((e) => {
                      const now = new Date();
                      const eqDate = new Date(e.date_time);
                      return (
                        now.getTime() - eqDate.getTime() < 24 * 60 * 60 * 1000
                      );
                    }).length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 24h
                </Typography>
              </Box>
            </Box>
            <Box>
              <button
                onClick={() => {
                  const mapSection = document.getElementById(
                    "earthquake-map-section"
                  );
                  if (mapSection) {
                    mapSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                style={{
                  background: theme.palette.primary.main,
                  color: "#fff",
                  border: "none",
                  borderRadius: 24,
                  padding: "12px 32px",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  cursor: "pointer",
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )}`,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  zIndex: 1,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    theme.palette.primary.dark)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    theme.palette.primary.main)
                }
              >
                <span role="img" aria-label="map">
                  🗺️
                </span>{" "}
                View Live Map
              </button>
            </Box>
          </Box>
        )}

        <StyledContainer
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: "1400px" },
            px: { xs: 0.5, sm: 2, md: 4 },
            boxSizing: "border-box",
          }}
        >
          {loading && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
              sx={{ width: "100%" }}
            >
              <CircularProgress size={40} thickness={4} />
            </Box>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                my: 3,
                borderRadius: 3,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? `0 8px 32px ${alpha("#000", 0.3)}`
                    : `0 8px 32px ${alpha("#000", 0.1)}`,
                width: "100%",
                maxWidth: 600,
                mx: "auto",
              }}
            >
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 3, md: 6 },
                width: "100%",
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      {/* Live Earthquake Map Section */}
                      <StyledPaper
                        id="earthquake-map-section"
                        sx={{
                          mb: { xs: 2, md: 4 },
                          p: { xs: 1, sm: 2, md: 4 },
                          width: "100%",
                          minWidth: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <span role="img" aria-label="map">
                            🗺️
                          </span>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                              letterSpacing: "-0.5px",
                              textAlign: "left",
                            }}
                          >
                            Live Earthquake Map
                          </Typography>
                        </Box>
                        <EarthquakeMap
                          ref={mapRef}
                          earthquakes={filteredEarthquakes}
                          selectedEarthquakeId={selectedEarthquakeId}
                          onEarthquakeSelect={handleEarthquakeSelect}
                        />
                      </StyledPaper>

                      {/* Survey Section */}
                      <Box sx={{ width: "100%", minWidth: 0 }}>
                        <EarthquakeSurvey />
                      </Box>

                      {/* Recent Earthquakes Section */}
                      <StyledPaper
                        sx={{
                          mt: { xs: 2, md: 4 },
                          p: { xs: 1, sm: 2, md: 4 },
                          width: "100%",
                          minWidth: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <span role="img" aria-label="earthquake">
                            🌐
                          </span>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                              letterSpacing: "-0.5px",
                              textAlign: "left",
                            }}
                          >
                            Recent Earthquakes
                          </Typography>
                        </Box>
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
                    <Box sx={{ width: "100%", minWidth: 0 }}>
                      <EarthquakeAnalytics earthquakes={filteredEarthquakes} />
                    </Box>
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
