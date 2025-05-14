import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  Fade,
  Slide,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import type { Earthquake } from "../types/earthquake";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.9),
  backdropFilter: "blur(12px)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
  minHeight: 64,
}));

const NavButton = styled(Button)<{
  component?: React.ElementType;
  to?: string;
}>(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  transition: "all 0.2s ease-in-out",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: "translateY(-1px)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: 0,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transition: "all 0.3s ease-in-out",
    transform: "translateX(-50%)",
  },
  "&:hover::after": {
    width: "80%",
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.spacing(2),
    marginTop: theme.spacing(1),
    minWidth: 280,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.3)"
        : "0 4px 20px rgba(0, 0, 0, 0.1)",
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    "& .MuiList-root": {
      padding: theme.spacing(1),
    },
    "& .MuiMenuItem-root": {
      borderRadius: theme.spacing(1),
      margin: theme.spacing(0.5, 0),
      padding: theme.spacing(1, 2),
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
      },
    },
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: "blur(8px)",
    transition: "all 0.2s ease-in-out",
    "& fieldset": {
      borderColor: alpha(theme.palette.divider, 0.1),
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputBase-input": {
    color: theme.palette.text.primary,
  },
  "& .MuiInputBase-input::placeholder": {
    color: theme.palette.text.secondary,
    opacity: 0.7,
  },
}));

interface NavbarProps {
  darkMode: boolean;
  onThemeChange: () => void;
  earthquakes: Earthquake[];
  onSearch: (query: string) => void;
}

const Navbar = ({
  darkMode,
  onThemeChange,
  earthquakes,
  onSearch,
}: NavbarProps) => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const recentEarthquakes = earthquakes
    .filter((eq) => eq.mag >= 4.5)
    .slice(0, 5);

  const isActive = (path: string) => location.pathname === path;

  return (
    <StyledAppBar position="sticky">
      <StyledToolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            onClick={() => navigate("/")}
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <LocationIcon color="primary" />
            ShakeTracker
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                onClick={handleMobileMenuOpen}
                sx={{ ml: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <StyledMenu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                TransitionComponent={Fade}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/");
                    handleMobileMenuClose();
                  }}
                  selected={isActive("/")}
                >
                  <ListItemIcon>
                    <HomeIcon color={isActive("/") ? "primary" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText primary="Home" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/analytics");
                    handleMobileMenuClose();
                  }}
                  selected={isActive("/analytics")}
                >
                  <ListItemIcon>
                    <TimelineIcon
                      color={isActive("/analytics") ? "primary" : "inherit"}
                    />
                  </ListItemIcon>
                  <ListItemText primary="Analytics" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>
                <MenuItem onClick={handleMobileMenuClose}>
                  <ListItemIcon>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText primary="About" />
                </MenuItem>
              </StyledMenu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <NavButton
                onClick={() => navigate("/")}
                startIcon={<HomeIcon />}
                sx={{
                  backgroundColor: isActive("/")
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                  color: isActive("/") ? "primary.main" : "inherit",
                }}
              >
                Home
              </NavButton>
              <NavButton
                onClick={() => navigate("/analytics")}
                startIcon={<TimelineIcon />}
                sx={{
                  backgroundColor: isActive("/analytics")
                    ? alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                  color: isActive("/analytics") ? "primary.main" : "inherit",
                }}
              >
                Analytics
              </NavButton>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SearchField
            size="small"
            placeholder="Search earthquakes..."
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Recent Earthquakes">
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{
                transition: "all 0.2s ease-in-out",
                color: theme.palette.text.primary,
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Badge
                badgeContent={recentEarthquakes.length}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={handleMobileMenuOpen}
              sx={{
                transition: "all 0.2s ease-in-out",
                color: theme.palette.text.primary,
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={`Switch to ${darkMode ? "light" : "dark"} mode`}>
            <IconButton
              color="inherit"
              onClick={onThemeChange}
              sx={{
                transition: "all 0.2s ease-in-out",
                color: theme.palette.text.primary,
                "&:hover": {
                  transform: "rotate(180deg)",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </StyledToolbar>

      <StyledMenu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        TransitionComponent={Fade}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Recent Earthquakes
          </Typography>
          {recentEarthquakes.map((earthquake) => (
            <Box
              key={earthquake._id}
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {earthquake.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Magnitude: {earthquake.mag} •{" "}
                {new Date(earthquake.date_time).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </StyledMenu>
    </StyledAppBar>
  );
};

export default Navbar;
