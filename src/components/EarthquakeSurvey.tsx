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
  Divider,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CommentIcon from "@mui/icons-material/Comment";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
}));

const ResponseCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
          Earthquake Experience Survey
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Help us understand the impact of recent earthquakes in your area. Your
          responses contribute to our understanding of earthquake effects.
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Did you feel a recent earthquake?
        </Typography>
        <Button
          variant={felt === true ? "contained" : "outlined"}
          onClick={() => setFelt(true)}
          sx={{ mr: 2, minWidth: 100 }}
        >
          Yes
        </Button>
        <Button
          variant={felt === false ? "contained" : "outlined"}
          onClick={() => setFelt(false)}
          sx={{ minWidth: 100 }}
        >
          No
        </Button>
      </Box>

      {felt && (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              How strong was it?
            </Typography>
            <Rating
              value={intensity}
              onChange={(_, newValue) => setIntensity(newValue || 0)}
              max={10}
              sx={{ mb: 1 }}
            />
            {intensity > 0 && (
              <Typography variant="body2" color="text.secondary">
                {getIntensityLabel(intensity)}
              </Typography>
            )}
          </Box>

          <TextField
            fullWidth
            label="Your Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <LocationOnIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
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
            sx={{ mb: 1 }}
            helperText={`${comments.length}/${MAX_COMMENT_LENGTH} characters`}
          />
        </>
      )}

      <Box sx={{ mt: 3, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={felt === null || (felt && intensity === 0) || isSubmitting}
          sx={{ mr: 2 }}
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
          <Button variant="outlined" color="error" onClick={clearResponses}>
            Clear All Responses
          </Button>
        )}
      </Box>

      {responses.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Responses
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {responses.slice(-3).map((response, index) => (
            <ResponseCard key={index}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Chip
                  label={response.felt ? "Felt" : "Not Felt"}
                  color={response.felt ? "primary" : "default"}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <AccessTimeIcon
                  sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {new Date(response.timestamp).toLocaleString()}
                </Typography>
              </Box>
              {response.felt && (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Intensity:
                    </Typography>
                    <Rating value={response.intensity} readOnly size="small" />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({getIntensityLabel(response.intensity)})
                    </Typography>
                  </Box>
                  {response.location && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationOnIcon
                        sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {response.location}
                      </Typography>
                    </Box>
                  )}
                  {response.comments && (
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mt: 1 }}
                    >
                      <CommentIcon
                        sx={{
                          fontSize: 16,
                          mr: 0.5,
                          mt: 0.5,
                          color: "text.secondary",
                        }}
                      />
                      <Typography variant="body2">
                        {response.comments}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </ResponseCard>
          ))}
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
