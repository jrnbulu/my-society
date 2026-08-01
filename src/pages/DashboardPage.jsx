import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import {
  getBillsByFlat,
  getMeetings,
  getNotices,
} from "../services/firestoreService";
import { formatMonth } from "../utils/billingUtils";
import { format } from "date-fns";

function StatCard({ icon, label, value, color }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              display: "flex",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { society } = useApp();
  const [bills, setBills] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.societyId) return;
    Promise.all([
      getBillsByFlat(userProfile.societyId, userProfile.flatId).then((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      ),
      getMeetings(userProfile.societyId).then((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      ),
      getNotices(userProfile.societyId).then((snap) =>
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      ),
    ]).then(([b, m, n]) => {
      setBills(b);
      setMeetings(m);
      setNotices(n);
      setLoading(false);
    });
  }, [userProfile]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  const unpaidBills = bills.filter((b) => b.status === "unpaid");
  const totalDue = unpaidBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const paidThisMonth = bills
    .filter((b) => b.status === "paid")
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const upcomingMeeting = meetings.find(
    (m) => m.scheduledAt?.toDate?.() > new Date()
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Welcome back 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {society?.name || "My Society"} · Flat {userProfile?.flatNumber}
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccountBalanceWalletIcon />}
            label="Total Due"
            value={`₹${totalDue.toLocaleString("en-IN")}`}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ReceiptLongIcon />}
            label="Unpaid Bills"
            value={unpaidBills.length}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Paid This Month"
            value={`₹${paidThisMonth.toLocaleString("en-IN")}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventIcon />}
            label="Upcoming Meeting"
            value={
              upcomingMeeting
                ? format(upcomingMeeting.scheduledAt.toDate(), "dd MMM")
                : "None"
            }
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Bills */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Pending Bills
              </Typography>
              {unpaidBills.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  All bills paid ✅
                </Typography>
              ) : (
                <List disablePadding>
                  {unpaidBills.slice(0, 5).map((bill) => (
                    <Box key={bill.id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary={`${bill.type} – ${formatMonth(bill.month)}`}
                          secondary={`Due: ${
                            bill.dueDate?.toDate
                              ? format(bill.dueDate.toDate(), "dd MMM yyyy")
                              : "—"
                          }`}
                        />
                        <Chip
                          label={`₹${bill.totalAmount}`}
                          color="error"
                          size="small"
                        />
                      </ListItem>
                      <Divider />
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Notices */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Latest Notices
              </Typography>
              {notices.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No notices yet.
                </Typography>
              ) : (
                <List disablePadding>
                  {notices.slice(0, 5).map((n) => (
                    <Box key={n.id}>
                      <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemText
                          primary={n.title}
                          secondary={
                            n.createdAt?.toDate
                              ? format(n.createdAt.toDate(), "dd MMM yyyy")
                              : ""
                          }
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                      </ListItem>
                      <Divider />
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
