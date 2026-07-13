import { useEffect, useState } from "react";
import type { JSX } from "react";
import { useNavigate, useLocation, Navigate, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { adminLogout, checkAdminSession } from "./adminAuth";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  { label: "Orders", icon: <ShoppingBagIcon />, path: "/admin/orders" },
  { label: "Customers", icon: <PeopleIcon />, path: "/admin/customers" },
  { label: "Products", icon: <Inventory2Icon />, path: "/admin/products" },
  { label: "Configuration", icon: <SettingsIcon />, path: "/admin/config" },
];

export default function AdminLayout(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "authed" | "denied">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;
    checkAdminSession().then((loggedIn) => {
      if (!cancelled) setAuthState(loggedIn ? "authed" : "denied");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (authState === "checking") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (authState === "denied") {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    adminLogout();
    navigate("/admin");
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg,#0f172a,#1e293b)",
        color: "#fff",
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AdminPanelSettingsIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
            MKY Admin
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            Management Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* Nav */}
      <List sx={{ px: 2, pt: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path + item.label}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: "12px",
                mb: 0.5,
                px: 2,
                py: 1.2,
                background: active
                  ? "linear-gradient(90deg,rgba(59,130,246,0.2),rgba(139,92,246,0.15))"
                  : "transparent",
                border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                "&:hover": {
                  background: "rgba(255,255,255,0.06)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? "#60a5fa" : "rgba(255,255,255,0.5)",
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      color: active ? "#fff" : "rgba(255,255,255,0.65)",
                      fontWeight: active ? 700 : 500,
                      fontSize: "0.9rem",
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      {/* User / Logout */}
      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          A
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
            Admin
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)" }}>
            Super Admin
          </Typography>
        </Box>
        <IconButton
          onClick={handleLogout}
          size="small"
          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#ef4444" } }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            background: "#0f172a",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 800, color: "#fff" }}>
              MKY Admin
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none" } }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              border: "none",
              boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: isMobile ? 8 : 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
