import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useAuth } from "../contexts/AuthContext";
import {
  getNotifications,
  markNotificationRead,
} from "../services/firestoreService";
import { format } from "date-fns";

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!currentUser) return;
    const snap = await getNotifications(currentUser.uid);
    setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [currentUser]);

  const markRead = async (id) => {
    await markNotificationRead(id);
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
        {notifs.some((n) => !n.read) && (
          <IconButton onClick={markAllRead} title="Mark all read">
            <DoneAllIcon />
          </IconButton>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : notifs.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
          No notifications.
        </Typography>
      ) : (
        <List>
          {notifs.map((n) => (
            <Box key={n.id}>
              <ListItem
                sx={{ bgcolor: n.read ? "transparent" : "action.hover", borderRadius: 2 }}
                secondaryAction={
                  !n.read && (
                    <IconButton size="small" onClick={() => markRead(n.id)} title="Mark read">
                      <DoneAllIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" gap={1} alignItems="center">
                      {!n.read && (
                        <Chip label="New" color="primary" size="small" />
                      )}
                      <Typography
                        variant="body2"
                        fontWeight={n.read ? 400 : 700}
                      >
                        {n.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      {n.body}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {n.createdAt?.toDate
                          ? format(n.createdAt.toDate(), "dd MMM yyyy HH:mm")
                          : ""}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
}
