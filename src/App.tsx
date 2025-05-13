import { useState, useEffect } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { getEarthquakes } from "./services/earthquakeService";
import type { Earthquake } from "./types/earthquake";
import EarthquakeList from "./components/EarthquakeList";
import EarthquakeMap from "./components/EarthquakeMap";
import Navbar from "./components/Navbar";

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
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

function App() {
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

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const response = await getEarthquakes();
        setEarthquakes(response.result);
        setFilteredEarthquakes(response.result);
        setError(null);
      } catch (err) {
        setError("Failed to fetch earthquake data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
    const interval = setInterval(fetchEarthquakes, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

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
            </Box>
          )}
        </StyledContainer>
      </Box>
    </ThemeProvider>
  );
}

export default App;
