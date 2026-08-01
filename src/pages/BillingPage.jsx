import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import {
  getBillsByFlat,
  getUnpaidBills,
  createBill,
  flatsCol,
  getUsersBySociety,
} from "../services/firestoreService";
import { formatMonth, currentMonth } from "../utils/billingUtils";
import { format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { Timestamp } from "firebase/firestore";
import { getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { collection } from "firebase/firestore";

const BILL_TYPES = ["Maintenance", "Water", "Electricity", "Ad-hoc", "Penalty"];
const STATUS_COLORS = { paid: "success", unpaid: "error", partial: "warning" };

export default function BillingPage() {
  const { userProfile } = useAuth();
  const { flats } = useApp();
  const isAdmin = userProfile?.role === "admin";

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      flatId: "",
      type: "Maintenance",
      month: currentMonth(),
      baseAmount: "",
      lateFeePct: 10,
      dueDate: "",
      description: "",
    },
  });

  const loadBills = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    try {
      let snap;
      if (isAdmin) {
        snap = await getDocs(
          query(
            collection(db, "bills"),
            where("societyId", "==", userProfile.societyId),
            orderBy("createdAt", "desc")
          )
        );
      } else {
        snap = await getBillsByFlat(userProfile.societyId, userProfile.flatId);
      }
      setBills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [userProfile]);

  const onCreateBill = async (data) => {
    setError("");
    try {
      await createBill({
        societyId: userProfile.societyId,
        flatId: data.flatId,
        type: data.type,
        month: data.month,
        baseAmount: Number(data.baseAmount),
        lateFeePct: Number(data.lateFeePct),
        totalAmount: Number(data.baseAmount),
        status: "unpaid",
        dueDate: data.dueDate
          ? Timestamp.fromDate(new Date(data.dueDate))
          : null,
        description: data.description,
        createdBy: userProfile.uid,
      });
      setSuccess("Bill created successfully");
      setCreateOpen(false);
      reset();
      loadBills();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Billing
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Create Bill
          </Button>
        )}
      </Box>

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                {isAdmin && <TableCell sx={{ color: "white" }}>Flat</TableCell>}
                <TableCell sx={{ color: "white" }}>Type</TableCell>
                <TableCell sx={{ color: "white" }}>Month</TableCell>
                <TableCell sx={{ color: "white" }}>Amount</TableCell>
                <TableCell sx={{ color: "white" }}>Due Date</TableCell>
                <TableCell sx={{ color: "white" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => {
                const flat = flats.find((f) => f.id === bill.flatId);
                return (
                  <TableRow key={bill.id} hover>
                    {isAdmin && (
                      <TableCell>{flat?.flatNumber || bill.flatId}</TableCell>
                    )}
                    <TableCell>{bill.type}</TableCell>
                    <TableCell>{formatMonth(bill.month)}</TableCell>
                    <TableCell>₹{bill.totalAmount?.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      {bill.dueDate?.toDate
                        ? format(bill.dueDate.toDate(), "dd MMM yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bill.status}
                        color={STATUS_COLORS[bill.status] || "default"}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {bills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No bills found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Bill Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Bill</DialogTitle>
        <form onSubmit={handleSubmit(onCreateBill)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="flatId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField select fullWidth label="Flat" {...field}>
                      {flats.map((f) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.flatNumber} – {f.ownerName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Bill Type" {...field}>
                      {BILL_TYPES.map((t) => (
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
                  name="baseAmount"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <TextField fullWidth label="Amount (₹)" type="number" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }} {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Description (optional)" multiline rows={2} {...field} />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
