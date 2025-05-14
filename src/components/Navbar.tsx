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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import type { Earthquake } from "../types/earthquake";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(18, 18, 18, 0.8)"
      : "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(8px)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 4px 20px rgba(0, 0, 0, 0.3)"
      : "0 4px 20px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
  color: theme.palette.text.primary,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
}));

const NavButton = styled(Button)<{
  component?: React.ElementType;
  to?: string;
}>(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateY(-1px)",
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
            }}
          >
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
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/");
                    handleMobileMenuClose();
                  }}
                  selected={isActive("/")}
                >
                  Home
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/analytics");
                    handleMobileMenuClose();
                  }}
                  selected={isActive("/analytics")}
                >
                  Analytics
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <NavButton
                onClick={() => navigate("/")}
                sx={{
                  backgroundColor: isActive("/")
                    ? theme.palette.action.selected
                    : "transparent",
                }}
              >
                Home
              </NavButton>
              <NavButton
                onClick={() => navigate("/analytics")}
                sx={{
                  backgroundColor: isActive("/analytics")
                    ? theme.palette.action.selected
                    : "transparent",
                }}
              >
                Analytics
              </NavButton>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search earthquakes..."
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                "& fieldset": {
                  borderColor: theme.palette.divider,
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
            }}
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
                transition: "transform 0.2s ease-in-out",
                color: theme.palette.text.primary,
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: theme.palette.action.hover,
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
                transition: "transform 0.2s ease-in-out",
                color: theme.palette.text.primary,
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: theme.palette.action.hover,
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
                transition: "transform 0.2s ease-in-out",
                color: theme.palette.text.primary,
                "&:hover": {
                  transform: "rotate(180deg)",
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </StyledToolbar>

      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                : "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <MenuItem onClick={handleMobileMenuClose}>
          <SettingsIcon sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem onClick={handleMobileMenuClose}>
          <InfoIcon sx={{ mr: 1 }} /> About
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMobileMenuClose}>
          <DarkModeIcon sx={{ mr: 1 }} /> Theme Settings
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                : "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
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
                borderBottom: `1px solid ${theme.palette.divider}`,
                "&:last-child": {
                  borderBottom: "none",
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
      </Menu>
    </StyledAppBar>
  );
};

export default Navbar;
