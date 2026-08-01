import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Badge,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import BoltIcon from "@mui/icons-material/Bolt";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import HandymanIcon from "@mui/icons-material/Handyman";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", roles: ["owner", "tenant", "admin"] },
  { label: "Billing", icon: <ReceiptIcon />, path: "/billing", roles: ["owner", "tenant", "admin"] },
  { label: "Payments", icon: <PaymentIcon />, path: "/payments", roles: ["owner", "tenant", "admin"] },
  { label: "Utilities", icon: <BoltIcon />, path: "/utilities", roles: ["owner", "tenant", "admin"] },
  { label: "Parking", icon: <LocalParkingIcon />, path: "/parking", roles: ["owner", "tenant", "admin"] },
  { label: "Expenses", icon: <HandymanIcon />, path: "/expenses", roles: ["admin"] },
  { label: "Salaries", icon: <PeopleIcon />, path: "/salaries", roles: ["admin"] },
  { label: "Users", icon: <PeopleIcon />, path: "/users", roles: ["admin"] },
  { label: "Meetings", icon: <EventIcon />, path: "/meetings", roles: ["owner", "tenant", "admin"] },
  { label: "Notices", icon: <CampaignIcon />, path: "/notices", roles: ["owner", "tenant", "admin"] },
];

export default function AppLayout({ children }) {
  const { userProfile, logout } = useAuth();
  const { unreadNotifications } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const role = userProfile?.role || "tenant";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {userProfile?.name?.[0] || userProfile?.phone?.[3] || "U"}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {userProfile?.name || userProfile?.phone}
          </Typography>
          <Typography variant="caption" color="text.secondary" textTransform="capitalize">
            {role}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {visibleItems.map((item) => (
          <ListItem
            key={item.path}
            button
            selected={location.pathname.startsWith(item.path)}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              "&.Mui-selected": { bgcolor: "primary.light", color: "primary.contrastText" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={logout}
          sx={{ borderRadius: 2, mx: 1, mb: 1, color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
        elevation={1}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🏘 My Society
          </Typography>
          <IconButton color="inherit" onClick={() => navigate("/notifications")}>
            <Badge badgeContent={unreadNotifications} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", mt: "64px" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: "64px",
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "grey.50",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
