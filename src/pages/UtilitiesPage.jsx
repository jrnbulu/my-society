import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/AuthContext";
import {
  addUtilityReading,
  getUtilityReadings,
} from "../services/firestoreService";
import {
  calculateElectricityBill,
  DEFAULT_ELECTRICITY_SLABS,
  calculateWaterBill,
  formatMonth,
  currentMonth,
  previousMonth,
} from "../utils/billingUtils";
import { useForm, Controller } from "react-hook-form";

const UTILITY_TYPES = ["Electricity", "Water", "Gas"];

export default function UtilitiesPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      type: "Electricity",
      month: currentMonth(),
      previousReading: "",
      currentReading: "",
      ratePerUnit: "",
    },
  });

  const utilType = watch("type");
  const prevR = watch("previousReading");
  const currR = watch("currentReading");
  const rate = watch("ratePerUnit");
  const units = Math.max(0, Number(currR) - Number(prevR));
  const estBill =
    units > 0 && rate
      ? utilType === "Electricity"
        ? calculateElectricityBill(units, DEFAULT_ELECTRICITY_SLABS)
        : calculateWaterBill(units, Number(rate))
      : 0;

  const load = async () => {
    if (!userProfile?.societyId || !userProfile?.flatId) return;
    setLoading(true);
    const snap = await getUtilityReadings(
      userProfile.societyId,
      userProfile.flatId,
      selectedMonth
    );
    setReadings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile, selectedMonth]);

  const onSubmit = async (data) => {
    setError("");
    const units = Math.max(0, Number(data.currentReading) - Number(data.previousReading));
    const bill =
      data.type === "Electricity"
        ? calculateElectricityBill(units, DEFAULT_ELECTRICITY_SLABS)
        : calculateWaterBill(units, Number(data.ratePerUnit));
    try {
      await addUtilityReading({
        societyId: userProfile.societyId,
        flatId: userProfile.flatId,
        type: data.type,
        month: data.month,
        previousReading: Number(data.previousReading),
        currentReading: Number(data.currentReading),
        unitsConsumed: units,
        ratePerUnit: Number(data.ratePerUnit),
        calculatedAmount: bill,
        recordedBy: userProfile.uid,
      });
      setSuccess("Reading saved");
      setAddOpen(false);
      reset();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Utility Readings
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
          >
            Add Reading
          </Button>
        )}
      </Box>

      {/* Month filter */}
      <TextField
        select
        size="small"
        label="Month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        sx={{ mb: 2, minWidth: 180 }}
      >
        {[0, 1, 2, 3].map((offset) => {
          const d = new Date();
          d.setMonth(d.getMonth() - offset);
          const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          return (
            <MenuItem key={val} value={val}>
              {formatMonth(val)}
            </MenuItem>
          );
        })}
      </TextField>

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white" }}>Type</TableCell>
                <TableCell sx={{ color: "white" }}>Previous</TableCell>
                <TableCell sx={{ color: "white" }}>Current</TableCell>
                <TableCell sx={{ color: "white" }}>Units</TableCell>
                <TableCell sx={{ color: "white" }}>Rate</TableCell>
                <TableCell sx={{ color: "white" }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {readings.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Chip label={r.type} size="small" />
                  </TableCell>
                  <TableCell>{r.previousReading}</TableCell>
                  <TableCell>{r.currentReading}</TableCell>
                  <TableCell>{r.unitsConsumed}</TableCell>
                  <TableCell>₹{r.ratePerUnit}/unit</TableCell>
                  <TableCell fontWeight={700}>
                    ₹{r.calculatedAmount?.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              {readings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No readings for {formatMonth(selectedMonth)}.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Reading Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Utility Reading</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Type" {...field}>
                      {UTILITY_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Month (YYYY-MM)" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="previousReading"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Previous Reading" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="currentReading"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Current Reading" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="ratePerUnit"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Rate / Unit (₹)" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Estimated Bill"
                  value={`₹${estBill.toLocaleString("en-IN")}`}
                  InputProps={{ readOnly: true }}
                  helperText={`${units} units consumed`}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
