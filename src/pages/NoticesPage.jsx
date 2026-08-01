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
  MenuItem,
  Alert,
  Grid,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/AuthContext";
import { createNotice, getNotices } from "../services/firestoreService";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";

const NOTICE_TYPES = ["General", "Maintenance", "Emergency", "Event", "Rule Change"];
const TYPE_COLORS = {
  General: "default",
  Maintenance: "warning",
  Emergency: "error",
  Event: "success",
  "Rule Change": "info",
};

export default function NoticesPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === "admin";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      body: "",
      type: "General",
    },
  });

  const load = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    const snap = await getNotices(userProfile.societyId);
    setNotices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile]);

  const onSubmit = async (data) => {
    setError("");
    try {
      await createNotice({
        societyId: userProfile.societyId,
        title: data.title,
        body: data.body,
        type: data.type,
        createdBy: userProfile.uid,
      });
      setSuccess("Notice posted");
      setCreateOpen(false);
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
          Notices
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Post Notice
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
        <Grid container spacing={2}>
          {notices.map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n.id}>
              <Card elevation={2} sx={{ borderRadius: 3, height: "100%" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Chip
                      label={n.type}
                      size="small"
                      color={TYPE_COLORS[n.type] || "default"}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {n.createdAt?.toDate
                        ? format(n.createdAt.toDate(), "dd MMM yyyy")
                        : ""}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    {n.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {n.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {notices.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                No notices yet.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Notice Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Post Notice</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Title" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Type" {...field}>
                      {NOTICE_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="body"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField fullWidth label="Content" multiline rows={5} {...field} />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Post</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
