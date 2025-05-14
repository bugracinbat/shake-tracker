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
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "12px",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
}));

interface SurveyResponse {
  felt: boolean;
  intensity: number;
  location: string;
  comments: string;
  timestamp: string;
}

const STORAGE_KEY = "earthquake_survey_responses";

const EarthquakeSurvey = () => {
  const [felt, setFelt] = useState<boolean | null>(null);
  const [intensity, setIntensity] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [comments, setComments] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

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

  const handleSubmit = () => {
    if (felt === null || (felt && intensity === 0)) {
      return;
    }

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

  return (
    <StyledPaper>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Did you feel a recent earthquake?
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant={felt === true ? "contained" : "outlined"}
          onClick={() => setFelt(true)}
          sx={{ mr: 2 }}
        >
          Yes
        </Button>
        <Button
          variant={felt === false ? "contained" : "outlined"}
          onClick={() => setFelt(false)}
        >
          No
        </Button>
      </Box>

      {felt && (
        <>
          <Typography component="legend" sx={{ mb: 1 }}>
            How strong was it?
          </Typography>
          <Rating
            value={intensity}
            onChange={(_, newValue) => setIntensity(newValue || 0)}
            max={10}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Your Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Additional Comments"
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={felt === null || (felt && intensity === 0)}
        sx={{ mr: 2 }}
      >
        Submit Response
      </Button>

      {responses.length > 0 && (
        <>
          <Button variant="outlined" color="error" onClick={clearResponses}>
            Clear All Responses
          </Button>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Responses
            </Typography>
            {responses.slice(-3).map((response, index) => (
              <Paper key={index} sx={{ p: 2, mb: 1 }}>
                <Typography variant="body2">
                  {new Date(response.timestamp).toLocaleString()}
                </Typography>
                <Typography>
                  {response.felt
                    ? "Felt the earthquake"
                    : "Did not feel the earthquake"}
                </Typography>
                {response.felt && (
                  <>
                    <Typography>Intensity: {response.intensity}/10</Typography>
                    {response.location && (
                      <Typography>Location: {response.location}</Typography>
                    )}
                    {response.comments && (
                      <Typography>Comments: {response.comments}</Typography>
                    )}
                  </>
                )}
              </Paper>
            ))}
          </Box>
        </>
      )}

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Thank you for your response!
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default EarthquakeSurvey;
