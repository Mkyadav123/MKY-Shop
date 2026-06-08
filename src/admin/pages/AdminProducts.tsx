import { useState, useEffect } from "react";
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Chip,
  Avatar,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  AddOutlined,
  CloseOutlined,
  Inventory2,
} from "@mui/icons-material";
import { getAdminProducts, saveAdminProducts } from "../mockData";
import type { AdminProduct } from "../mockData";

const emptyProduct: Omit<AdminProduct, "id"> = {
  name: "",
  price: 0,
  stock: 0,
  inStock: true,
  category: "",
  sku: "",
  imageUrl: "",
  description: "",
};

export default function AdminProducts(): JSX.Element {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<Omit<AdminProduct, "id">>(emptyProduct);
  const [toast, setToast] = useState<{ msg: string; sev: "success" | "error" } | null>(null);

  useEffect(() => {
    setProducts(getAdminProducts());
  }, []);

  const persist = (updated: AdminProduct[]) => {
    setProducts(updated);
    saveAdminProducts(updated);
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditTarget(p);
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock,
      inStock: p.inStock,
      category: p.category,
      sku: p.sku,
      imageUrl: p.imageUrl,
      description: p.description,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setToast({ msg: "Product name is required.", sev: "error" });
      return;
    }
    if (editTarget) {
      persist(
        products.map((p) =>
          p.id === editTarget.id ? { ...form, id: editTarget.id } : p
        )
      );
      setToast({ msg: "Product updated.", sev: "success" });
    } else {
      const newProduct: AdminProduct = {
        ...form,
        id: `prod_${Date.now()}`,
      };
      persist([...products, newProduct]);
      setToast({ msg: "Product added.", sev: "success" });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    persist(products.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setToast({ msg: "Product deleted.", sev: "success" });
  };

  const toggleStock = (id: string) => {
    persist(
      products.map((p) =>
        p.id === id ? { ...p, inStock: !p.inStock } : p
      )
    );
  };

  const field = (
    label: string,
    key: keyof Omit<AdminProduct, "id" | "inStock">,
    type: "text" | "number" = "text"
  ) => (
    <TextField
      label={label}
      type={type}
      size="small"
      fullWidth
      value={form[key]}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          [key]: type === "number" ? Number(e.target.value) : e.target.value,
        }))
      }
    />
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            Products
          </Typography>
          <Typography sx={{ color: "#64748b" }}>
            Add, edit, and manage your product catalogue
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={openAdd}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1.2,
            background: "linear-gradient(90deg,#3b82f6,#8b5cf6)",
            boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
            "&:hover": { background: "linear-gradient(90deg,#2563eb,#7c3aed)" },
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Stat */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3,1fr)" }, gap: 2, mb: 4 }}>
        {[
          { label: "Total Products", value: products.length, color: "linear-gradient(135deg,#3b82f6,#2563eb)" },
          { label: "In Stock", value: products.filter((p) => p.inStock).length, color: "linear-gradient(135deg,#10b981,#059669)" },
          { label: "Out of Stock", value: products.filter((p) => !p.inStock).length, color: "linear-gradient(135deg,#ef4444,#dc2626)" },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{ p: 3, borderRadius: "20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 2 }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <Inventory2 />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>
                {s.value}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: "20px", border: "1px solid #e2e8f0" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#475569" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "0.15s" }}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      src={p.imageUrl}
                      variant="rounded"
                      sx={{ width: 44, height: 44, bgcolor: "#f1f5f9" }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                        {p.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {p.category}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={p.sku} size="small" sx={{ fontFamily: "monospace", bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2563eb" }}>₹{p.price}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{p.stock}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Switch
                      size="small"
                      checked={p.inStock}
                      onChange={() => toggleStock(p.id)}
                      color="success"
                    />
                    <Chip
                      label={p.inStock ? "In Stock" : "Out of Stock"}
                      size="small"
                      color={p.inStock ? "success" : "error"}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: "#3b82f6" }}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteId(p.id)} sx={{ color: "#ef4444" }}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                  No products yet. Click "Add Product" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "20px" } } }}
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}
        >
          {editTarget ? "Edit Product" : "Add Product"}
          <IconButton onClick={() => setDialogOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {field("Product Name *", "name")}
            <Stack direction="row" spacing={2}>
              {field("Price (₹)", "price", "number")}
              {field("Stock Quantity", "stock", "number")}
            </Stack>
            <Stack direction="row" spacing={2}>
              {field("SKU", "sku")}
              {field("Category", "category")}
            </Stack>
            {field("Image URL", "imageUrl")}
            <TextField
              label="Description"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.inStock}
                  onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                  color="success"
                />
              }
              label="In Stock"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(90deg,#3b82f6,#8b5cf6)",
              "&:hover": { background: "linear-gradient(90deg,#2563eb,#7c3aed)" },
            }}
          >
            {editTarget ? "Save Changes" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        slotProps={{ paper: { sx: { borderRadius: "20px", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This action cannot be undone. The product will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 2, pr: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteId(null)}
            variant="outlined"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast?.sev} sx={{ borderRadius: "12px" }}>
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
