import { useState } from "react";
import type { JSX } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Divider,
} from "@mui/material";
import {
  VisibilityOutlined,
  CloseOutlined,
  SearchOutlined,
  ShoppingBag,
  CheckCircle,
  HourglassEmpty,
} from "@mui/icons-material";
import { mockOrders } from "../mockData";
import type { Order } from "../../types/cart";

/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: JSX.Element;
  color: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

/* =========================
   MAIN COMPONENT
========================= */

export default function AdminOrders(): JSX.Element {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" || o.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = mockOrders.reduce((s, o) => s + o.amount, 0);
  const completed = mockOrders.filter((o) => o.payment_status === "Complete").length;
  const pending = mockOrders.filter((o) => o.payment_status === "Pending").length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
        Orders
      </Typography>
      <Typography sx={{ color: "#64748b", mb: 4 }}>
        Manage and track all customer orders
      </Typography>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          label="Total Orders"
          value={mockOrders.length}
          icon={<ShoppingBag />}
          color="linear-gradient(135deg,#3b82f6,#2563eb)"
        />
        <StatCard
          label="Revenue"
          value={`₹${totalRevenue}`}
          icon={<ShoppingBag />}
          color="linear-gradient(135deg,#10b981,#059669)"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={<CheckCircle />}
          color="linear-gradient(135deg,#8b5cf6,#7c3aed)"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={<HourglassEmpty />}
          color="linear-gradient(135deg,#f59e0b,#d97706)"
        />
      </Box>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search by order ID or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: { startAdornment: <SearchOutlined sx={{ color: "#94a3b8", mr: 1 }} /> },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: "20px", border: "1px solid #e2e8f0" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              {["Order ID", "Customer", "Amount", "Date", "Status", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#475569" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((order) => (
              <TableRow
                key={order.id}
                sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "0.15s" }}
              >
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  {order.order_id}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {order.customer_name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {order.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2563eb" }}>
                  ₹{order.amount}
                </TableCell>
                <TableCell sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                  {new Date(order.created_at).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.payment_status}
                    size="small"
                    color={order.payment_status === "Complete" ? "success" : "warning"}
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => setSelected(order)}>
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
      >
        {selected && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 800,
                pb: 1,
              }}
            >
              {selected.order_id}
              <IconButton onClick={() => setSelected(null)}>
                <CloseOutlined />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={1.5}>
                {[
                  ["Customer", selected.customer_name],
                  ["Email", selected.email],
                  ["Phone", selected.phone],
                  ["Address", `${selected.address}, ${selected.city} – ${selected.pincode}`],
                  ["Amount", `₹${selected.amount}`],
                  ["Payment ID", selected.payment_id],
                  ["Status", selected.payment_status],
                  ["Date", new Date(selected.created_at).toLocaleString("en-IN")],
                ].map(([k, v]) => (
                  <Box
                    key={k}
                    sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography sx={{ color: "#64748b", fontSize: "0.875rem", fontWeight: 600 }}>
                      {k}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", textAlign: "right" }}>
                      {v}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </DialogContent>
            <Box sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSelected(null)}
                sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
}
