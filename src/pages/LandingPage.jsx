import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import BoltIcon from "@mui/icons-material/Bolt";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const FEATURES = [
  {
    icon: <ReceiptIcon fontSize="large" />,
    title: "Billing",
    description: "Generate and manage maintenance bills for every flat automatically.",
  },
  {
    icon: <PaymentIcon fontSize="large" />,
    title: "Payments",
    description: "Track payment history and collect dues via UPI with instant receipts.",
  },
  {
    icon: <BoltIcon fontSize="large" />,
    title: "Utilities",
    description: "Record meter readings and split electricity & water charges fairly.",
  },
  {
    icon: <LocalParkingIcon fontSize="large" />,
    title: "Parking",
    description: "Assign and manage parking slots for residents and visitors.",
  },
  {
    icon: <EventIcon fontSize="large" />,
    title: "Meetings",
    description: "Schedule society meetings and share agendas with all residents.",
  },
  {
    icon: <CampaignIcon fontSize="large" />,
    title: "Notices",
    description: "Publish important announcements and circulars to the entire society.",
  },
  {
    icon: <PeopleIcon fontSize="large" />,
    title: "User Management",
    description: "Approve residents, assign roles, and manage flat occupancy.",
  },
  {
    icon: <NotificationsIcon fontSize="large" />,
    title: "Notifications",
    description: "Stay informed with real-time push notifications for every activity.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1565c0 0%, #0288d1 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          px: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight={800} gutterBottom>
          🏘 My Society
        </Typography>
        <Typography
          variant="h6"
          sx={{ opacity: 0.9, maxWidth: 520, mx: "auto", mb: 4 }}
        >
          A complete society management portal — billing, payments, utilities,
          notices, and more, all in one place.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(currentUser ? "/dashboard" : "/login")}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              fontWeight: 700,
              px: 4,
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            {currentUser ? "Go to Dashboard" : "Get Started"}
          </Button>
          {!currentUser && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{ borderColor: "white", color: "white", px: 4 }}
            >
              Sign In
            </Button>
          )}
        </Stack>
      </Box>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          mb={1}
        >
          Everything your society needs
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={6}
        >
          Manage every aspect of residential society operations from a single dashboard.
        </Typography>

        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      mb: 1.5,
                      color: "primary.main",
                      display: "inline-flex",
                      p: 1,
                      borderRadius: 2,
                      bgcolor: "primary.50",
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 6, md: 8 },
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={2}>
          Ready to simplify your society management?
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(currentUser ? "/dashboard" : "/login")}
          sx={{
            bgcolor: "white",
            color: "primary.main",
            fontWeight: 700,
            px: 5,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          {currentUser ? "Open Dashboard" : "Sign In Now"}
        </Button>
      </Box>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} My Society · All rights reserved
        </Typography>
      </Box>
    </Box>
  );
}
