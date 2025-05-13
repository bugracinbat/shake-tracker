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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import type { Earthquake } from "../types/earthquake";

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  marginLeft: theme.spacing(2),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
})) as typeof Button;

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

  const recentEarthquakes = earthquakes
    .filter((eq) => eq.mag >= 4.5)
    .slice(0, 5);

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: "-0.5px",
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
                component={RouterLink}
                to="/"
                onClick={handleMobileMenuClose}
                selected={isActive("/")}
              >
                Home
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/analytics"
                onClick={handleMobileMenuClose}
                selected={isActive("/analytics")}
              >
                Analytics
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <NavButton
              component={RouterLink}
              to="/"
              sx={{
                backgroundColor: isActive("/")
                  ? "action.selected"
                  : "transparent",
                fontWeight: isActive("/") ? 600 : 400,
              }}
            >
              Home
            </NavButton>
            <NavButton
              component={RouterLink}
              to="/analytics"
              sx={{
                backgroundColor: isActive("/analytics")
                  ? "action.selected"
                  : "transparent",
                fontWeight: isActive("/analytics") ? 600 : 400,
              }}
            >
              Analytics
            </NavButton>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{
              backgroundColor: theme.palette.action.hover,
              "&:hover": {
                backgroundColor: theme.palette.action.selected,
              },
              mr: 1,
            }}
          >
            <Badge badgeContent={recentEarthquakes.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={onThemeChange}
            sx={{
              backgroundColor: theme.palette.action.hover,
              "&:hover": {
                backgroundColor: theme.palette.action.selected,
              },
            }}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>

        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            sx: {
              maxHeight: 400,
              width: 360,
            },
          }}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">
              Recent Significant Earthquakes
            </Typography>
          </MenuItem>
          <Divider />
          {recentEarthquakes.length > 0 ? (
            recentEarthquakes.map((eq, index) => (
              <MenuItem
                key={`${eq.date_time}-${index}`}
                onClick={handleNotificationsClose}
              >
                <ListItemText
                  primary={eq.title}
                  secondary={`Magnitude: ${eq.mag}`}
                />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText primary="No significant earthquakes in the last 24 hours" />
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
