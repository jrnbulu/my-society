import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  Alert,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (val) => {
    // Ensure +91 prefix for Indian numbers
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 10) return digits;
    return digits.slice(-10);
  };

  const handleSendOTP = async () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await sendOTP(`+91${digits}`, "recaptcha-container");
      setStep("otp");
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(otp);
      navigate("/dashboard");
    } catch (e) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1565c0 0%, #0288d1 100%)",
        px: 2,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, maxWidth: 400, width: "100%", borderRadius: 3 }}>
        {/* Logo / Title */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={700} color="primary">
            🏘 My Society
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Society Management Portal
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === "phone" ? (
          <>
            <TextField
              fullWidth
              label="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              inputProps={{ maxLength: 10, inputMode: "numeric" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      +91
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <div id="recaptcha-container" />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              OTP sent to +91 {phone}
            </Typography>
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerifyOTP}
              disabled={loading}
              sx={{ mb: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
            </Button>
            <Button
              fullWidth
              variant="text"
              size="small"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
            >
              Change number
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
