import { useEffect, useState } from "react";
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
  Skeleton,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { Order } from "../../types/cart";
import { fetchAdminProducts } from "../../services/productApi";
import type { AdminProduct } from "../../types/product";

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

export default function AdminDashboard(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [ordersRes, productList] = await Promise.all([
          fetch("/api/orders", { credentials: "include" }).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }),
          fetchAdminProducts(),
        ]);

        if (cancelled) return;

        const orderList: Order[] = Array.isArray(ordersRes)
          ? ordersRes
          : ordersRes.data ?? [];

        setOrders(orderList);
        setProducts(productList);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load dashboard data."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.amount), 0);
  const completed = orders.filter((o) => o.payment_status === "PAID").length;
  const pending = orders.filter((o) => o.payment_status === "PENDING").length;
  const outOfStock = products.filter((p) => !p.inStock || p.stock === 0).length;

  const recentOrders = [...orders]
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
        Dashboard
      </Typography>
      <Typography sx={{ color: "#64748b", mb: 4 }}>
        A quick overview of your store's performance
      </Typography>

      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "14px",
            border: "1px solid #fecaca",
            bgcolor: "#fef2f2",
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {error}
        </Paper>
      )}

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5,1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={92} sx={{ borderRadius: "20px" }} />
          ))
        ) : (
          <>
            <StatCard
              label="Total Orders"
              value={orders.length}
              icon={<ShoppingBagIcon />}
              color="linear-gradient(135deg,#3b82f6,#2563eb)"
            />
            <StatCard
              label="Revenue"
              value={`₹${totalRevenue}`}
              icon={<ShoppingBagIcon />}
              color="linear-gradient(135deg,#10b981,#059669)"
            />
            <StatCard
              label="Completed"
              value={completed}
              icon={<CheckCircleIcon />}
              color="linear-gradient(135deg,#8b5cf6,#7c3aed)"
            />
            <StatCard
              label="Pending"
              value={pending}
              icon={<HourglassEmptyIcon />}
              color="linear-gradient(135deg,#f59e0b,#d97706)"
            />
            <StatCard
              label="Products"
              value={products.length}
              icon={<Inventory2Icon />}
              color="linear-gradient(135deg,#06b6d4,#0891b2)"
            />
          </>
        )}
      </Box>

      {outOfStock > 0 && !loading && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: "14px",
            border: "1px solid #fde68a",
            bgcolor: "#fffbeb",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <WarningAmberIcon sx={{ color: "#d97706" }} />
          <Typography sx={{ fontWeight: 600, color: "#92400e", fontSize: "0.9rem" }}>
            {outOfStock} product{outOfStock > 1 ? "s" : ""} out of stock — check the
            Products page.
          </Typography>
        </Paper>
      )}

      {/* Recent Orders */}
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5 }}>
        Recent Orders
      </Typography>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: "20px", border: "1px solid #e2e8f0" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              {["Order ID", "Date", "Customer", "Amount", "Status"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#475569" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              recentOrders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "0.15s" }}
                >
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                    {order.order_id}
                  </TableCell>
                  <TableCell sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {order.customer_name}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#2563eb" }}>
                    ₹{order.amount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.payment_status}
                      size="small"
                      color={order.payment_status === "PAID" ? "success" : "warning"}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && recentOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
