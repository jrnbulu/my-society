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
import { addExpense, getExpenses } from "../services/firestoreService";
import { currentMonth, formatMonth } from "../utils/billingUtils";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CATEGORIES = [
  "Maintenance",
  "Cleaning",
  "Security",
  "Electricity",
  "Water",
  "Garden",
  "Repair",
  "Equipment",
  "Miscellaneous",
];

export default function ExpensesPage() {
  const { userProfile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      category: "Maintenance",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      vendor: "",
      description: "",
      receiptUrl: "",
    },
  });

  const load = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    const snap = await getExpenses(userProfile.societyId, selectedMonth);
    setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile, selectedMonth]);

  const onSubmit = async (data) => {
    setError("");
    try {
      await addExpense({
        societyId: userProfile.societyId,
        category: data.category,
        amount: Number(data.amount),
        date: Timestamp.fromDate(new Date(data.date)),
        month: selectedMonth,
        vendor: data.vendor,
        description: data.description,
        receiptUrl: data.receiptUrl,
        recordedBy: userProfile.uid,
      });
      setSuccess("Expense added");
      setAddOpen(false);
      reset();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Group by category for chart
  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.amount > 0);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
        >
          Add Expense
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
          label={`Total: ₹${totalExpenses.toLocaleString("en-IN")}`}
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
        <Grid container spacing={3}>
          {categoryTotals.length > 0 && (
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Expense Breakdown
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={categoryTotals}>
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} />
                      <Bar dataKey="amount" fill="#1565c0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12}>
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main" }}>
                    <TableCell sx={{ color: "white" }}>Date</TableCell>
                    <TableCell sx={{ color: "white" }}>Category</TableCell>
                    <TableCell sx={{ color: "white" }}>Vendor</TableCell>
                    <TableCell sx={{ color: "white" }}>Description</TableCell>
                    <TableCell sx={{ color: "white" }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>
                        {e.date?.toDate
                          ? format(e.date.toDate(), "dd MMM yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell>{e.vendor || "—"}</TableCell>
                      <TableCell>{e.description || "—"}</TableCell>
                      <TableCell fontWeight={700}>
                        ₹{e.amount?.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No expenses for {formatMonth(selectedMonth)}.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Category" {...field}>
                      {CATEGORIES.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <TextField fullWidth label="Amount (₹)" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="vendor"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Vendor" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Description" multiline rows={2} {...field} />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
