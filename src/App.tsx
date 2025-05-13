import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const response = await getEarthquakes();
        setEarthquakes(response.result);
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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <Navbar />
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
                  color: "#000",
                  letterSpacing: "-0.5px",
                }}
              >
                Live Earthquake Map
              </Typography>
              <EarthquakeMap earthquakes={earthquakes} />
            </StyledPaper>

            <StyledPaper>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: "#000",
                  letterSpacing: "-0.5px",
                }}
              >
                Recent Earthquakes
              </Typography>
              <EarthquakeList earthquakes={earthquakes} />
            </StyledPaper>
          </Box>
        )}
      </StyledContainer>
    </Box>
  );
}

export default App;
