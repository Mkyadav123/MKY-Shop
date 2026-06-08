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
  Avatar,
  TextField,
  Stack,
  Chip,
} from "@mui/material";
import { SearchOutlined, People } from "@mui/icons-material";
import { mockOrders } from "../mockData";

interface Customer {
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
}

function buildCustomers(): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of mockOrders) {
    const existing = map.get(o.email);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += o.amount;
    } else {
      map.set(o.email, {
        name: o.customer_name,
        email: o.email,
        phone: o.phone,
        city: o.city,
        totalOrders: 1,
        totalSpent: o.amount,
      });
    }
  }
  return Array.from(map.values());
}

const customers = buildCustomers();

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const COLORS = [
  "linear-gradient(135deg,#3b82f6,#2563eb)",
  "linear-gradient(135deg,#8b5cf6,#7c3aed)",
  "linear-gradient(135deg,#10b981,#059669)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#ef4444,#dc2626)",
  "linear-gradient(135deg,#06b6d4,#0891b2)",
];

export default function AdminCustomers(): JSX.Element {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
        Customers
      </Typography>
      <Typography sx={{ color: "#64748b", mb: 4 }}>
        All customers who have placed orders
      </Typography>

      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3,1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        {[
          {
            label: "Total Customers",
            value: customers.length,
            color: "linear-gradient(135deg,#3b82f6,#2563eb)",
          },
          {
            label: "Total Revenue",
            value: `₹${customers.reduce((s, c) => s + c.totalSpent, 0)}`,
            color: "linear-gradient(135deg,#10b981,#059669)",
          },
          {
            label: "Avg. Order Value",
            value: `₹${Math.round(
              customers.reduce((s, c) => s + c.totalSpent, 0) /
                customers.reduce((s, c) => s + c.totalOrders, 0)
            )}`,
            color: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
          },
        ].map((stat) => (
          <Paper
            key={stat.label}
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
                background: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <People />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                {stat.label}
              </Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
                {stat.value}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Search */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}
      >
        <Stack direction="row">
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name, email, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchOutlined sx={{ color: "#94a3b8", mr: 1 }} />,
              },
            }}
          />
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
              {["Customer", "Contact", "City", "Orders", "Total Spent"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#475569" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((c, i) => (
              <TableRow
                key={c.email}
                sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "0.15s" }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        background: COLORS[i % COLORS.length],
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {initials(c.name)}
                    </Avatar>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                      {c.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "0.8rem", color: "#475569" }}>
                    {c.email}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {c.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={c.city}
                    size="small"
                    sx={{ fontWeight: 600, bgcolor: "#f1f5f9", color: "#475569" }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  {c.totalOrders}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2563eb" }}>
                  ₹{c.totalSpent}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
