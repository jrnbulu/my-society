import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import { getParkingSlots, updateParkingSlot } from "../services/firestoreService";
import { useForm, Controller } from "react-hook-form";

const SLOT_TYPE_ICON = {
  car: <DirectionsCarIcon />,
  bike: <TwoWheelerIcon />,
  other: <LocalParkingIcon />,
};

export default function ParkingPage() {
  const { userProfile } = useAuth();
  const { flats } = useApp();
  const isAdmin = userProfile?.role === "admin";

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSlot, setEditSlot] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset, setValue } = useForm();

  const load = async () => {
    if (!userProfile?.societyId) return;
    setLoading(true);
    const snap = await getParkingSlots(userProfile.societyId);
    setSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userProfile]);

  const openEdit = (slot) => {
    setEditSlot(slot);
    setValue("flatId", slot.flatId || "");
    setValue("vehicleNumber", slot.vehicleNumber || "");
    setValue("type", slot.type || "car");
  };

  const onSave = async (data) => {
    setError("");
    try {
      await updateParkingSlot(editSlot.id, {
        flatId: data.flatId || null,
        vehicleNumber: data.vehicleNumber || "",
        type: data.type,
        status: data.flatId ? "occupied" : "available",
        allocatedBy: userProfile.uid,
      });
      setSuccess("Parking slot updated");
      setEditSlot(null);
      reset();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const mySlots = slots.filter((s) => s.flatId === userProfile?.flatId);
  const displaySlots = isAdmin ? slots : mySlots;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Parking
      </Typography>

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Summary chips for admin */}
      {isAdmin && (
        <Box display="flex" gap={1} mb={3}>
          <Chip
            label={`Total: ${slots.length}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Occupied: ${slots.filter((s) => s.status === "occupied").length}`}
            color="error"
          />
          <Chip
            label={`Available: ${slots.filter((s) => s.status === "available").length}`}
            color="success"
          />
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {displaySlots.map((slot) => {
            const flat = flats.find((f) => f.id === slot.flatId);
            return (
              <Grid item xs={6} sm={4} md={3} key={slot.id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor:
                      slot.status === "occupied" ? "error.main" : "success.main",
                    cursor: isAdmin ? "pointer" : "default",
                  }}
                  onClick={() => isAdmin && openEdit(slot)}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Box
                      sx={{
                        color:
                          slot.status === "occupied" ? "error.main" : "success.main",
                        mb: 1,
                      }}
                    >
                      {SLOT_TYPE_ICON[slot.type] || <LocalParkingIcon />}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {slot.slotNumber}
                    </Typography>
                    <Chip
                      label={slot.status}
                      size="small"
                      color={slot.status === "occupied" ? "error" : "success"}
                      sx={{ mt: 0.5, textTransform: "capitalize" }}
                    />
                    {slot.flatId && (
                      <Typography variant="caption" display="block" mt={0.5}>
                        {flat?.flatNumber || slot.flatId}
                      </Typography>
                    )}
                    {slot.vehicleNumber && (
                      <Typography variant="caption" color="text.secondary">
                        {slot.vehicleNumber}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          {displaySlots.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                {isAdmin ? "No parking slots configured." : "No parking slot assigned to your flat."}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {/* Edit Dialog (admin only) */}
      <Dialog open={!!editSlot} onClose={() => setEditSlot(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Slot {editSlot?.slotNumber}</DialogTitle>
        <form onSubmit={handleSubmit(onSave)}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box display="flex" flexDirection="column" gap={2}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth label="Vehicle Type" {...field}>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="flatId"
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth label="Assign to Flat" {...field}>
                    <MenuItem value="">— Unassign —</MenuItem>
                    {flats.map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.flatNumber}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="vehicleNumber"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Vehicle Number" {...field} />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditSlot(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
