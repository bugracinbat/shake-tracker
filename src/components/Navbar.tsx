import { AppBar, Toolbar, Typography, Box, Container } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  boxShadow: "none",
}));

const Navbar = () => {
  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: "#000",
              letterSpacing: "-0.5px",
            }}
          >
            Türkiye Earthquake Tracker
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: "0.875rem",
            }}
          >
            Real-time earthquake data from Kandilli Observatory
          </Typography>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;
