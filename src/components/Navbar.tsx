import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(90deg, #000000 0%, #1a1a1a 100%)",
  boxShadow: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(90deg, #0070f3 0%, #00a3ff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
  letterSpacing: "-0.5px",
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "#fff",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.1)",
  },
}));

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Home", href: "/" },
    { text: "Map", href: "#map" },
    { text: "List", href: "#list" },
    { text: "About", href: "#about" },
  ];

  const drawer = (
    <Box
      sx={{
        background: "linear-gradient(180deg, #000000 0%, #1a1a1a 100%)",
        height: "100%",
        color: "#fff",
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component="a"
            href={item.href}
            onClick={handleDrawerToggle}
            sx={{
              "&:hover": {
                background: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <GradientText variant="h6" sx={{ flexGrow: 1 }}>
              Shake Tracker
            </GradientText>

            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                {menuItems.map((item) => (
                  <NavButton
                    key={item.text}
                    href={item.href}
                    sx={{ textTransform: "none" }}
                  >
                    {item.text}
                  </NavButton>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
