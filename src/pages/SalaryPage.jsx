import { useEffect, useState } from "react";
import {
  Box,
  Typography,
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
import { addSalaryRecord, getSalaries } from "../services/firestoreService";
import { currentMonth, formatMonth } from "../utils/billingUtils";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

const STAFF_ROLES = [
  "Security Guard",
  "Housekeeping",
  "Gardener",
  "Electrician",
  "Plumber",
  "Driver",
  "Manager",
];

export default function SalaryPage() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      staffName: "",
      staffRole: "Security Guard",
      basicSalary: "",
      bonus: "",
      deductions: "",
      paidDate: new Date().toISOString().slice(0, 10),
      paymentMode: "Cash",
    },
  });

  const load = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    const snap = await getSalaries(userProfile.societyId, selectedMonth);
    setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile, selectedMonth]);

  const onSubmit = async (data) => {
    setError("");
    const net =
      Number(data.basicSalary) +
      Number(data.bonus || 0) -
      Number(data.deductions || 0);
    try {
      await addSalaryRecord({
        societyId: userProfile.societyId,
        staffName: data.staffName,
        staffRole: data.staffRole,
        basicSalary: Number(data.basicSalary),
        bonus: Number(data.bonus || 0),
        deductions: Number(data.deductions || 0),
        netSalary: net,
        paidDate: Timestamp.fromDate(new Date(data.paidDate)),
        month: selectedMonth,
        paymentMode: data.paymentMode,
        recordedBy: userProfile.uid,
      });
      setSuccess("Salary recorded");
      setAddOpen(false);
      reset();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const totalPaid = records.reduce((s, r) => s + (r.netSalary || 0), 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Salaries
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
        >
          Record Salary
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField
          select
          size="small"
          label="Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{ minWidth: 160 }}
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
        <Chip
          label={`Total: ₹${totalPaid.toLocaleString("en-IN")}`}
          color="primary"
          variant="outlined"
        />
      </Box>

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
                <TableCell sx={{ color: "white" }}>Staff Name</TableCell>
                <TableCell sx={{ color: "white" }}>Role</TableCell>
                <TableCell sx={{ color: "white" }}>Basic</TableCell>
                <TableCell sx={{ color: "white" }}>Bonus</TableCell>
                <TableCell sx={{ color: "white" }}>Deduction</TableCell>
                <TableCell sx={{ color: "white" }}>Net</TableCell>
                <TableCell sx={{ color: "white" }}>Paid On</TableCell>
                <TableCell sx={{ color: "white" }}>Mode</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.staffName}</TableCell>
                  <TableCell>{r.staffRole}</TableCell>
                  <TableCell>₹{r.basicSalary?.toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{r.bonus?.toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{r.deductions?.toLocaleString("en-IN")}</TableCell>
                  <TableCell fontWeight={700}>
                    ₹{r.netSalary?.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {r.paidDate?.toDate
                      ? format(r.paidDate.toDate(), "dd MMM yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>{r.paymentMode}</TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No salary records for {formatMonth(selectedMonth)}.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Salary Payment</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="staffName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Staff Name" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="staffRole"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Role" {...field}>
                      {STAFF_ROLES.map((r) => (
                        <MenuItem key={r} value={r}>{r}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="basicSalary"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Basic (₹)" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="bonus"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Bonus (₹)" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="deductions"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Deductions (₹)" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="paidDate"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Paid Date" type="date" InputLabelProps={{ shrink: true }} {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="paymentMode"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Payment Mode" {...field}>
                      {["Cash", "UPI", "Bank Transfer", "Cheque"].map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </TextField>
                  )}
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
