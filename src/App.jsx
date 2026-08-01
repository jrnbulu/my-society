import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { PrivateRoute, RoleRoute } from "./components/common/ProtectedRoutes";
import AppLayout from "./components/common/AppLayout";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import BillingPage from "./pages/BillingPage";
import PaymentsPage from "./pages/PaymentsPage";
import UtilitiesPage from "./pages/UtilitiesPage";
import ParkingPage from "./pages/ParkingPage";
import ExpensesPage from "./pages/ExpensesPage";
import SalaryPage from "./pages/SalaryPage";
import MeetingsPage from "./pages/MeetingsPage";
import NoticesPage from "./pages/NoticesPage";
import NotificationsPage from "./pages/NotificationsPage";
import UsersPage from "./pages/UsersPage";
import { Box, Typography, Button } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#0288d1" },
    background: { default: "#f5f7fa" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: "0 2px 12px rgba(0,0,0,0.08)" } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: "none" } } },
  },
});

function PendingApproval() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h6" mb={1}>⏳ Awaiting Approval</Typography>
      <Typography variant="body2" color="text.secondary">
        Your account is pending admin approval. Please contact your society admin.
      </Typography>
    </Box>
  );
}

function Unauthorized() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h6" mb={1}>🚫 Access Denied</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        You don't have permission to view this page.
      </Typography>
      <Button variant="contained" onClick={() => window.history.back()}>Go Back</Button>
    </Box>
  );
}

function LayoutRoute({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<LayoutRoute><DashboardPage /></LayoutRoute>} />
                <Route path="/billing" element={<LayoutRoute><BillingPage /></LayoutRoute>} />
                <Route path="/payments" element={<LayoutRoute><PaymentsPage /></LayoutRoute>} />
                <Route path="/utilities" element={<LayoutRoute><UtilitiesPage /></LayoutRoute>} />
                <Route path="/parking" element={<LayoutRoute><ParkingPage /></LayoutRoute>} />
                <Route path="/meetings" element={<LayoutRoute><MeetingsPage /></LayoutRoute>} />
                <Route path="/notices" element={<LayoutRoute><NoticesPage /></LayoutRoute>} />
                <Route path="/notifications" element={<LayoutRoute><NotificationsPage /></LayoutRoute>} />

                {/* Admin-only routes */}
                <Route element={<RoleRoute roles={["admin"]} />}>
                  <Route path="/expenses" element={<LayoutRoute><ExpensesPage /></LayoutRoute>} />
                  <Route path="/salaries" element={<LayoutRoute><SalaryPage /></LayoutRoute>} />
                  <Route path="/users" element={<LayoutRoute><UsersPage /></LayoutRoute>} />
                </Route>
              </Route>

              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
