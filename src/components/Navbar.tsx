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
  InputBase,
  Badge,
  Avatar,
  Tooltip,
  Switch,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(90deg, #000000 0%, #1a1a1a 100%)"
      : "linear-gradient(90deg, #ffffff 0%, #f5f5f5 100%)",
  boxShadow: "none",
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(90deg, #0070f3 0%, #00a3ff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
  letterSpacing: "-0.5px",
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.mode === "dark" ? "#fff" : "#000",
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.1),
  },
  "&.active": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.mode === "dark" ? "#fff" : "#666",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.mode === "dark" ? "#fff" : "#000",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

interface NavbarProps {
  darkMode: boolean;
  onThemeChange: () => void;
}

const Navbar = ({ darkMode, onThemeChange }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
    handleDrawerToggle();
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
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #000000 0%, #1a1a1a 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)",
        height: "100%",
        color: theme.palette.mode === "dark" ? "#fff" : "#000",
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component="a"
            href={item.href}
            onClick={() => handleLinkClick(item.href)}
            sx={{
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.1),
              },
              color:
                activeLink === item.href
                  ? theme.palette.primary.main
                  : "inherit",
              fontWeight: activeLink === item.href ? 600 : 400,
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
            <GradientText variant="h6" sx={{ flexGrow: 0 }}>
              Shake Tracker
            </GradientText>

            {!isMobile && (
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search earthquakes..."
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {menuItems.map((item) => (
                  <NavButton
                    key={item.text}
                    href={item.href}
                    onClick={() => setActiveLink(item.href)}
                    className={activeLink === item.href ? "active" : ""}
                    sx={{ textTransform: "none" }}
                  >
                    {item.text}
                  </NavButton>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
              <Tooltip title="Toggle theme">
                <IconButton onClick={onThemeChange} color="inherit">
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton color="inherit">
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Profile">
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                </IconButton>
              </Tooltip>

              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
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
