import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Avatar,
  CircularProgress,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import {
  getUsersBySociety,
  updateUser,
  flatsCol,
} from "../services/firestoreService";
import { useForm, Controller } from "react-hook-form";

const ROLES = ["owner", "tenant", "admin", "pending"];

export default function UsersPage() {
  const { userProfile } = useAuth();
  const { flats, invalidateCache } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, setValue } = useForm();

  const load = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    const snap = await getUsersBySociety(userProfile.societyId);
    setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile]);

  const openEdit = (user) => {
    setEditUser(user);
    setValue("name", user.name || "");
    setValue("role", user.role);
    setValue("flatId", user.flatId || "");
    setValue("flatNumber", user.flatNumber || "");
    setValue("email", user.email || "");
  };

  const onSave = async (data) => {
    setError("");
    const flat = flats.find((f) => f.id === data.flatId);
    try {
      await updateUser(editUser.id, {
        name: data.name,
        role: data.role,
        flatId: data.flatId,
        flatNumber: flat?.flatNumber || data.flatNumber,
        email: data.email,
        societyId: userProfile.societyId,
      });
      setSuccess("User updated");
      setEditUser(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const roleColor = {
    admin: "error",
    owner: "primary",
    tenant: "success",
    pending: "warning",
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        User Management
      </Typography>

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
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white" }}>User</TableCell>
                <TableCell sx={{ color: "white" }}>Phone</TableCell>
                <TableCell sx={{ color: "white" }}>Flat</TableCell>
                <TableCell sx={{ color: "white" }}>Role</TableCell>
                <TableCell sx={{ color: "white" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
                        {(u.name || u.phone || "U")[0].toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {u.name || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {u.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>{u.flatNumber || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      size="small"
                      color={roleColor[u.role] || "default"}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEdit(u)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <form onSubmit={handleSubmit(onSave)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Full Name" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Email" type="email" {...field} />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Role" {...field}>
                      {ROLES.map((r) => (
                        <MenuItem key={r} value={r} sx={{ textTransform: "capitalize" }}>
                          {r}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="flatId"
                  control={control}
                  render={({ field }) => (
                    <TextField select fullWidth label="Flat" {...field}>
                      <MenuItem value="">— None —</MenuItem>
                      {flats.map((f) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.flatNumber}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
