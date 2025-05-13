import { useState, useRef } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
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
  Divider,
  ListItemIcon,
  Fade,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { styled, alpha } from "@mui/material/styles";
import type { Earthquake } from "../types/earthquake";

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

const NavLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.mode === "dark" ? "#fff" : "#000",
  textDecoration: "none",
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    background: alpha(theme.palette.primary.main, 0.1),
  },
  "&.active": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

interface NavbarProps {
  darkMode: boolean;
  onThemeChange: () => void;
  earthquakes: Earthquake[];
  onSearch: (query: string) => void;
}

const NotificationItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const Navbar = ({
  darkMode,
  onThemeChange,
  earthquakes,
  onSearch,
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New earthquake detected",
      message: "Magnitude 4.5 earthquake near Istanbul",
      time: "2 minutes ago",
    },
    {
      id: 2,
      title: "System update",
      message: "New features have been added",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Data refresh",
      message: "Earthquake data has been updated",
      time: "2 hours ago",
    },
  ]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const notificationsAnchorRef = useRef<HTMLButtonElement>(null);
  const profileAnchorRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleProfileToggle = () => {
    setProfileOpen(!profileOpen);
  };

  const handleCloseNotifications = (event: MouseEvent | TouchEvent) => {
    if (
      notificationsAnchorRef.current &&
      notificationsAnchorRef.current.contains(event.target as Node)
    ) {
      return;
    }
    setNotificationsOpen(false);
  };

  const handleCloseProfile = (event: MouseEvent | TouchEvent) => {
    if (
      profileAnchorRef.current &&
      profileAnchorRef.current.contains(event.target as Node)
    ) {
      return;
    }
    setProfileOpen(false);
  };

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "Analytics", path: "/analytics" },
    { text: "About", path: "/about" },
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
            component={RouterLink}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.1),
              },
              color:
                location.pathname === item.path
                  ? theme.palette.primary.main
                  : "inherit",
              fontWeight: location.pathname === item.path ? 600 : 400,
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
                  value={searchQuery}
                  onChange={handleSearchChange}
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {menuItems.map((item) => (
                  <NavLink
                    key={item.text}
                    to={item.path}
                    className={location.pathname === item.path ? "active" : ""}
                  >
                    {item.text}
                  </NavLink>
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
                <IconButton
                  ref={notificationsAnchorRef}
                  onClick={handleNotificationsToggle}
                  color="inherit"
                >
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Popper
                open={notificationsOpen}
                anchorEl={notificationsAnchorRef.current}
                placement="bottom-end"
                transition
                style={{ zIndex: 1300 }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper
                      sx={{
                        width: 320,
                        maxHeight: 400,
                        overflow: "auto",
                        mt: 1,
                      }}
                    >
                      <ClickAwayListener onClickAway={handleCloseNotifications}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                            Notifications
                          </Typography>
                          {notifications.map((notification) => (
                            <NotificationItem key={notification.id}>
                              <Typography variant="subtitle2">
                                {notification.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {notification.message}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {notification.time}
                              </Typography>
                            </NotificationItem>
                          ))}
                        </Box>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                )}
              </Popper>

              <Tooltip title="Profile">
                <IconButton
                  ref={profileAnchorRef}
                  onClick={handleProfileToggle}
                  sx={{ p: 0 }}
                >
                  <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                </IconButton>
              </Tooltip>

              <Popper
                open={profileOpen}
                anchorEl={profileAnchorRef.current}
                placement="bottom-end"
                transition
                style={{ zIndex: 1300 }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper sx={{ width: 200, mt: 1 }}>
                      <ClickAwayListener onClickAway={handleCloseProfile}>
                        <List>
                          <ListItem
                            component="button"
                            onClick={() => {}}
                            sx={{
                              width: "100%",
                              textAlign: "left",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <ListItemIcon>
                              <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                          </ListItem>
                          <ListItem
                            component="button"
                            onClick={() => {}}
                            sx={{
                              width: "100%",
                              textAlign: "left",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <ListItemIcon>
                              <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                          </ListItem>
                          <Divider />
                          <ListItem
                            component="button"
                            onClick={() => {}}
                            sx={{
                              width: "100%",
                              textAlign: "left",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              },
                            }}
                          >
                            <ListItemIcon>
                              <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                          </ListItem>
                        </List>
                      </ClickAwayListener>
                    </Paper>
                  </Fade>
                )}
              </Popper>

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
