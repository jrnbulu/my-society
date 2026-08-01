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
  Alert,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import { useAuth } from "../contexts/AuthContext";
import {
  getBillsByFlat,
  getPaymentsByFlat,
  markBillPaid,
} from "../services/firestoreService";
import {
  buildUPIUrl,
  generateTxnId,
  openUPIIntent,
} from "../services/upiService";
import { formatMonth } from "../utils/billingUtils";
import { format } from "date-fns";
import { serverTimestamp } from "firebase/firestore";

const STEPS = ["Select Bill", "UPI Payment", "Confirm Transaction"];

export default function PaymentsPage() {
  const { userProfile } = useAuth();
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payDialog, setPayDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [step, setStep] = useState(0);
  const [txnRef, setTxnRef] = useState("");
  const [txnId, setTxnId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirming, setConfirming] = useState(false);

  const load = async () => {
    if (!userProfile?.societyId || !userProfile?.flatId) return;
    setLoading(true);
    const [bSnap, pSnap] = await Promise.all([
      getBillsByFlat(userProfile.societyId, userProfile.flatId),
      getPaymentsByFlat(userProfile.societyId, userProfile.flatId),
    ]);
    setBills(bSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setPayments(pSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile]);

  const startPayment = (bill) => {
    setSelectedBill(bill);
    const id = generateTxnId();
    setTxnId(id);
    setStep(0);
    setTxnRef("");
    setError("");
    setPayDialog(true);
  };

  const initiateUPI = async () => {
    const upiUrl = buildUPIUrl({
      vpa: import.meta.env.VITE_UPI_VPA || "society@upi",
      name: "My Society",
      amount: selectedBill.totalAmount,
      txnNote: `Bill: ${selectedBill.type} ${selectedBill.month}`,
      txnId,
    });
    await openUPIIntent(upiUrl);
    setStep(2);
  };

  const confirmPayment = async () => {
    if (!txnRef.trim()) {
      setError("Please enter the UPI transaction reference number");
      return;
    }
    setConfirming(true);
    setError("");
    try {
      await markBillPaid(selectedBill.id, {
        societyId: userProfile.societyId,
        flatId: userProfile.flatId,
        uid: userProfile.uid,
        amount: selectedBill.totalAmount,
        billType: selectedBill.type,
        month: selectedBill.month,
        upiTxnId: txnId,
        upiRef: txnRef.trim(),
        method: "UPI",
        paidAt: serverTimestamp(),
      });
      setSuccess(`Payment recorded for ${selectedBill.type}`);
      setPayDialog(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setConfirming(false);
    }
  };

  const unpaidBills = bills.filter((b) => b.status === "unpaid");

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Payments
      </Typography>

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
        <Grid container spacing={3}>
          {/* Pending Bills to Pay */}
          <Grid item xs={12} md={7}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Pending Bills
                </Typography>
                {unpaidBills.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No pending bills 🎉
                  </Typography>
                ) : (
                  unpaidBills.map((bill) => (
                    <Box
                      key={bill.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {bill.type} – {formatMonth(bill.month)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due:{" "}
                          {bill.dueDate?.toDate
                            ? format(bill.dueDate.toDate(), "dd MMM yyyy")
                            : "—"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={700}>
                          ₹{bill.totalAmount?.toLocaleString("en-IN")}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PaymentIcon />}
                          onClick={() => startPayment(bill)}
                        >
                          Pay
                        </Button>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment History */}
          <Grid item xs={12} md={5}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Payment History
                </Typography>
                {payments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No payments yet.
                  </Typography>
                ) : (
                  payments.slice(0, 10).map((p) => (
                    <Box
                      key={p.id}
                      sx={{
                        py: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">{p.billType}</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          ₹{p.amount?.toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {p.paidAt?.toDate
                          ? format(p.paidAt.toDate(), "dd MMM yyyy HH:mm")
                          : "—"}{" "}
                        · {p.method}
                      </Typography>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pay Dialog */}
      <Dialog open={payDialog} onClose={() => setPayDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pay Bill</DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {step === 0 && selectedBill && (
            <Box>
              <Typography variant="body1" fontWeight={600} mb={1}>
                {selectedBill.type} – {formatMonth(selectedBill.month)}
              </Typography>
              <Typography variant="h5" color="primary" fontWeight={700}>
                ₹{selectedBill.totalAmount?.toLocaleString("en-IN")}
              </Typography>
              {selectedBill.description && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {selectedBill.description}
                </Typography>
              )}
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="body2" mb={2}>
                Complete the payment in your UPI app and enter the transaction reference number below.
              </Typography>
              <TextField
                fullWidth
                label="UPI Transaction Reference / UTR Number"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. 407123456789"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog(false)}>Cancel</Button>
          {step === 0 && (
            <Button variant="contained" onClick={() => setStep(1)}>
              Proceed to Pay
            </Button>
          )}
          {step === 1 && (
            <Button variant="contained" color="success" onClick={initiateUPI}>
              Open UPI App
            </Button>
          )}
          {step === 2 && (
            <Button
              variant="contained"
              onClick={confirmPayment}
              disabled={confirming}
            >
              {confirming ? <CircularProgress size={20} /> : "Confirm Payment"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
