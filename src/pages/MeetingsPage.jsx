import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import { useAuth } from "../contexts/AuthContext";
import { createMeeting, getMeetings, updateMeeting } from "../services/firestoreService";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export default function MeetingsPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      scheduledAt: "",
      venue: "",
      agenda: "",
    },
  });

  const load = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    const snap = await getMeetings(userProfile.societyId);
    setMeetings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile]);

  const onSubmit = async (data) => {
    setError("");
    try {
      await createMeeting({
        societyId: userProfile.societyId,
        title: data.title,
        scheduledAt: Timestamp.fromDate(new Date(data.scheduledAt)),
        venue: data.venue,
        agenda: data.agenda,
        status: "scheduled",
        createdBy: userProfile.uid,
      });
      setSuccess("Meeting scheduled");
      setCreateOpen(false);
      reset();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const upcoming = meetings.filter(
    (m) => m.scheduledAt?.toDate?.() >= new Date() && m.status !== "cancelled"
  );
  const past = meetings.filter((m) => m.scheduledAt?.toDate?.() < new Date());

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Meetings
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Schedule Meeting
          </Button>
        )}
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
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Upcoming Meetings
                </Typography>
                {upcoming.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming meetings.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {upcoming.map((m) => (
                      <Box key={m.id}>
                        <ListItem disablePadding sx={{ py: 1.5 }}>
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: "primary.light",
                              borderRadius: 2,
                              mr: 2,
                              color: "primary.main",
                            }}
                          >
                            <EventIcon />
                          </Box>
                          <ListItemText
                            primary={m.title}
                            secondary={
                              <>
                                {m.scheduledAt?.toDate
                                  ? format(m.scheduledAt.toDate(), "dd MMM yyyy, hh:mm a")
                                  : "—"}
                                {m.venue && ` · ${m.venue}`}
                              </>
                            }
                          />
                          <Chip label="Upcoming" color="primary" size="small" />
                        </ListItem>
                        {m.agenda && (
                          <Typography variant="body2" color="text.secondary" pl={7} pb={1}>
                            {m.agenda}
                          </Typography>
                        )}
                        <Divider />
                      </Box>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Past Meetings
                </Typography>
                {past.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No past meetings.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {past.slice(0, 8).map((m) => (
                      <Box key={m.id}>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemText
                            primary={m.title}
                            secondary={
                              m.scheduledAt?.toDate
                                ? format(m.scheduledAt.toDate(), "dd MMM yyyy")
                                : "—"
                            }
                          />
                          <Chip label="Completed" color="default" size="small" />
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
      )}

      {/* Create Meeting Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Meeting</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Meeting Title" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="scheduledAt"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Date & Time"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      {...field}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="venue"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Venue" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="agenda"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Agenda"
                      multiline
                      rows={3}
                      {...field}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Schedule</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
