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
  Fade,
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
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(90deg, ${alpha(
          theme.palette.background.paper,
          0.95
        )} 60%, ${alpha(theme.palette.primary.dark, 0.7)} 100%)`
      : `linear-gradient(90deg, ${alpha(
          theme.palette.background.paper,
          0.92
        )} 60%, ${alpha(theme.palette.primary.light, 0.7)} 100%)`,
  backdropFilter: "blur(18px)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0,0,0,0.28)"
      : "0 8px 32px rgba(33,150,243,0.10)",
  borderRadius: 28,
  margin: "24px auto 32px auto",
  maxWidth: "1200px",
  width: "calc(100% - 32px)",
  color: theme.palette.text.primary,
  border: `1.5px solid ${alpha(theme.palette.divider, 0.13)}`,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "sticky",
  top: 16,
  zIndex: 1100,
  overflowX: "hidden", // Prevent horizontal overflow always
  [theme.breakpoints.down("sm")]: {
    margin: "12px 0 16px 0",
    maxWidth: "100vw",
    width: "100vw",
    left: 0,
    right: 0,
    borderRadius: 0,
    minWidth: 0,
    boxSizing: "border-box",
    overflowX: "hidden", // Extra safety for mobile
    transition: "none", // Remove transitions on mobile to prevent overflow
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1.5, 3),
  minHeight: 72,
  overflowX: "hidden", // Prevent horizontal overflow always
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 1),
    minHeight: 56,
    flexWrap: "wrap",
    gap: theme.spacing(1),
    boxSizing: "border-box",
    overflowX: "hidden", // Extra safety for mobile
    transition: "none", // Remove transitions on mobile
    maxWidth: "100vw",
  },
}));

const NavButton = styled(Button)<{
  component?: React.ElementType;
  to?: string;
}>(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(1.1, 2.5),
  borderRadius: theme.spacing(3),
  fontWeight: 600,
  letterSpacing: "0.02em",
  fontSize: 17,
  background: "transparent",
  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  boxShadow: "none",
  "&:hover, &:focus": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    transform: "translateY(-2px) scale(1.04)",
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 2px 8px ${alpha(theme.palette.primary.dark, 0.2)}`
        : `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: "50%",
    width: 0,
    height: 2,
    backgroundColor: theme.palette.primary.main,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "translateX(-50%)",
  },
  "&:hover::after": {
    width: "85%",
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
    <StyledAppBar
      position="sticky"
      role="navigation"
      aria-label="Main Navigation"
    >
      <StyledToolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            flex: 1,
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
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
            tabIndex={0}
            aria-label="Go to home page"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
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
                aria-label="Open navigation menu"
              >
                <MenuIcon />
              </IconButton>
              <StyledMenu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
                TransitionComponent={Fade}
                MenuListProps={{
                  "aria-label": "Mobile navigation menu",
                  autoFocus: true,
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/");
                    handleMobileMenuClose();
                  }}
                  selected={isActive("/")}
                  aria-current={isActive("/") ? "page" : undefined}
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
                  aria-current={isActive("/analytics") ? "page" : undefined}
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
                aria-current={isActive("/") ? "page" : undefined}
                aria-label="Home"
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
                aria-current={isActive("/analytics") ? "page" : undefined}
                aria-label="Analytics"
              >
                Analytics
              </NavButton>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minWidth: 0,
            flex: 1,
            justifyContent: { xs: "flex-end", sm: "flex-end" },
            overflowX: { xs: "auto", sm: "visible" },
          }}
        >
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
              "aria-label": "Search earthquakes",
            }}
            inputProps={{
              "aria-label": "Search earthquakes",
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
              aria-label="Show recent earthquakes"
              aria-haspopup="true"
              aria-controls={
                notificationsAnchor ? "recent-earthquakes-menu" : undefined
              }
              aria-expanded={Boolean(notificationsAnchor)}
            >
              <Badge
                badgeContent={recentEarthquakes.length}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    animation: recentEarthquakes.length
                      ? "pulse 1s infinite"
                      : "none",
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
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
              aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
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
        MenuListProps={{
          "aria-label": "Recent earthquakes",
        }}
        id="recent-earthquakes-menu"
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
