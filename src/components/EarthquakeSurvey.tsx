import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
  Rating,
  TextField,
  CircularProgress,
  Chip,
  Collapse,
  IconButton,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CommentIcon from "@mui/icons-material/Comment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: "12px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 12px rgba(0,0,0,0.45)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : "rgba(255, 255, 255, 0.8)",
  color: theme.palette.text.primary,
  backdropFilter: theme.palette.mode === "dark" ? undefined : "blur(8px)",
  width: '100%',
  maxWidth: '100%', // Make survey full width
  margin: 0, // Remove auto margin
  boxSizing: 'border-box',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  },
}));

const ResponseCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  transition: "transform 0.2s ease-in-out",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : "#fff",
  color: theme.palette.text.primary,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 2px 8px rgba(0,0,0,0.35)"
      : "0 4px 8px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 16px rgba(0,0,0,0.5)"
        : "0 4px 8px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    borderRadius: 6,
  },
}));

const SurveyHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.action.hover,
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.paper
        : theme.palette.action.selected,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    borderRadius: 6,
  },
}));

interface SurveyResponse {
  felt: boolean;
  intensity: number;
  location: string;
  comments: string;
  timestamp: string;
}

const STORAGE_KEY = "earthquake_survey_responses";
const MAX_COMMENT_LENGTH = 500;

const EarthquakeSurvey = () => {
  const [felt, setFelt] = useState<boolean | null>(null);
  const [intensity, setIntensity] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [comments, setComments] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load responses from localStorage on component mount
  useEffect(() => {
    const savedResponses = localStorage.getItem(STORAGE_KEY);
    if (savedResponses) {
      try {
        setResponses(JSON.parse(savedResponses));
      } catch (error) {
        console.error("Error loading saved responses:", error);
      }
    }
  }, []);

  // Save responses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  }, [responses]);

  const handleSubmit = async () => {
    if (felt === null || (felt && intensity === 0)) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newResponse: SurveyResponse = {
      felt,
      intensity,
      location,
      comments,
      timestamp: new Date().toISOString(),
    };

    setResponses([...responses, newResponse]);
    setShowSuccess(true);
    resetForm();
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFelt(null);
    setIntensity(0);
    setLocation("");
    setComments("");
  };

  const clearResponses = () => {
    setResponses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getIntensityLabel = (value: number) => {
    const labels = [
      "Not felt",
      "Barely noticeable",
      "Weak",
      "Light",
      "Moderate",
      "Strong",
      "Very strong",
      "Severe",
      "Violent",
      "Extreme",
    ];
    return labels[value - 1] || "";
  };

  return (
    <StyledPaper>
      <SurveyHeader onClick={() => setIsExpanded(!isExpanded)}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 22 } }}>
            Earthquake Experience Survey
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: 14, sm: 16 } }}>
            Help us understand the impact of recent earthquakes in your area
          </Typography>
        </Box>
        <IconButton>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </SurveyHeader>
      <Collapse in={isExpanded}>
        <Box sx={{ mt: 2, width: '100%' }}>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
            <Typography variant="subtitle1" sx={{ mb: { xs: 1, sm: 0 }, fontWeight: 600, fontSize: { xs: 15, sm: 17 } }}>
              Did you feel a recent earthquake?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={felt === true ? "contained" : "outlined"}
                onClick={() => setFelt(true)}
                sx={{ minWidth: 80, fontSize: { xs: 13, sm: 15 } }}
              >
                Yes
              </Button>
              <Button
                variant={felt === false ? "contained" : "outlined"}
                onClick={() => setFelt(false)}
                sx={{ minWidth: 80, fontSize: { xs: 13, sm: 15 } }}
              >
                No
              </Button>
            </Box>
          </Box>
          {felt && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography component="legend" sx={{ mb: 1, fontWeight: 600, fontSize: { xs: 15, sm: 17 } }}>
                  How strong was it?
                </Typography>
                <Rating
                  value={intensity}
                  onChange={(_, newValue) => setIntensity(newValue || 0)}
                  max={10}
                  sx={{ mb: 1, fontSize: { xs: 20, sm: 28 } }}
                />
                {intensity > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 13, sm: 15 } }}>
                    {getIntensityLabel(intensity)}
                  </Typography>
                )}
              </Box>
              <TextField
                fullWidth
                label="Your Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ mb: 2, fontSize: { xs: 13, sm: 15 } }}
                InputProps={{
                  startAdornment: (
                    <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                inputProps={{ style: { fontSize: 14 } }}
              />
              <TextField
                fullWidth
                label="Additional Comments"
                multiline
                rows={3}
                value={comments}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_COMMENT_LENGTH) {
                    setComments(e.target.value);
                  }
                }}
                sx={{ mb: 1, fontSize: { xs: 13, sm: 15 } }}
                helperText={`${comments.length}/${MAX_COMMENT_LENGTH} characters`}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </>
          )}
          <Box
            sx={{
              mt: 3,
              mb: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={felt === null || (felt && intensity === 0) || isSubmitting}
              sx={{
                fontSize: { xs: 14, sm: 16 },
                minWidth: 120,
                flex: { xs: 1, sm: 'unset' },
                order: { xs: 1, sm: 1 },
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Submitting...
                </>
              ) : (
                "Submit Response"
              )}
            </Button>
            {responses.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={clearResponses}
                sx={{
                  fontSize: { xs: 14, sm: 16 },
                  minWidth: 120,
                  flex: { xs: 1, sm: 'unset' },
                  order: { xs: 2, sm: 2 },
                }}
              >
                Clear All Responses
              </Button>
            )}
          </Box>
        </Box>
      </Collapse>
      {/* Responsive: Recent Responses */}
      {responses.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: 16, sm: 18 } }}>
            Recent Responses
          </Typography>
          <Stack spacing={1}>
            {responses.slice(-3).map((response, index) => (
              <ResponseCard key={index}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={response.felt ? "Felt" : "Not Felt"}
                    color={response.felt ? "primary" : "default"}
                    size="small"
                    sx={{ mr: 1, fontSize: { xs: 12, sm: 14 } }}
                  />
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>
                    {new Date(response.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                {response.felt && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1, fontSize: { xs: 12, sm: 14 } }}>
                        Intensity:
                      </Typography>
                      <Rating value={response.intensity} readOnly size="small" sx={{ fontSize: { xs: 16, sm: 20 } }} />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: { xs: 12, sm: 14 } }}>
                        ({getIntensityLabel(response.intensity)})
                      </Typography>
                    </Box>
                    {response.location && (
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 } }}>
                          {response.location}
                        </Typography>
                      </Box>
                    )}
                    {response.comments && (
                      <Box sx={{ display: "flex", alignItems: "flex-start", mt: 1, flexWrap: 'wrap', gap: 1 }}>
                        <CommentIcon sx={{ fontSize: 16, mr: 0.5, mt: 0.5, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 } }}>
                          {response.comments}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </ResponseCard>
            ))}
          </Stack>
        </Box>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Thank you for your response! Your input helps us understand earthquake
          impacts better.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          Please provide all required information before submitting.
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default EarthquakeSurvey;
