import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Chip,
  Box,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  Breadcrumbs,
} from "@mui/material";
import { ShoppingCart, CheckCircleOutlined, ArrowBackOutlined } from "@mui/icons-material";
import { fetchStoreProductById } from "../services/productApi";
import type { Product } from "../types/product";
import type { CartItem } from "../types/cart";

interface ProductDetailPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function ProductDetailPage({
  setCart,
}: ProductDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [toastOpen, setToastOpen] = useState(false);
  const [addedItemName, setAddedItemName] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setLoadError("");
        const data = await fetchStoreProductById(id);
        setProduct(data);
        if (!data) {
          setLoadError("Product not found.");
        }
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Could not load product from server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = (item: Product) => {
    if (!item.inventory.inStock) return;

    setCart((prevCart) => {
      const existing = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...prevCart, { ...item, qty: 1 }];
    });

    setAddedItemName(item.name);
    setToastOpen(true);
    navigate("/cart");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {loadError || "Product not found."}
        </Typography>
        <Button
          component={RouterLink}
          to="/products"
          startIcon={<ArrowBackOutlined />}
          variant="outlined"
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Container
        maxWidth={false}
        sx={{ maxWidth: "1520px", px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Breadcrumbs sx={{ mt: 3, mb: 2 }}>
          <Button
            component={RouterLink}
            to="/products"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Products
          </Button>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
            gap: { xs: 4, md: 14 },
            alignItems: "center",
            background: "#fff",
            p: { xs: 3, md: 6 },
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
            borderRadius: "20px",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg,#f8fafc,#edf2f7)",
              p: 5,
              borderRadius: "24px",
              textAlign: "center",
            }}
          >
            <img
              src={product.images[0]?.url || "https://dummyimage.com/400x400"}
              alt={product.name}
              style={{ maxWidth: "100%", height: "480px", objectFit: "contain" }}
            />
          </Box>

          <Box>
            <Chip
              label={product.inventory.inStock ? "In Stock" : "Out of Stock"}
              color={product.inventory.inStock ? "success" : "error"}
              sx={{ mb: 2, fontWeight: 700 }}
            />

            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
              {product.name}
            </Typography>

            <Typography sx={{ color: "#718096", mb: 2 }}>
              {product.shortDescription || product.description}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: "#111" }}>
              ₹{product.price.amount}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              {product.tags?.map((tag, i) => (
                <Chip key={i} label={tag} />
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              disabled={!product.inventory.inStock}
              startIcon={<ShoppingCart />}
              onClick={() => handleAddToCart(product)}
              sx={{
                px: 5,
                py: 1.8,
                borderRadius: "14px",
                fontWeight: 700,
                textTransform: "none",
                bgcolor: "#111",
                fontSize: "1rem",
                "&:hover": { bgcolor: "#222" },
              }}
            >
              {product.inventory.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 4,
              textAlign: "center",
            }}
          >
            Product Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                bgcolor: "#ffffff",
                border: "1px solid #cfe3ff",
                boxShadow: "0 6px 18px rgba(43,108,176,0.08)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: "#38a169" }}>
                Specifications
              </Typography>

              {Object.entries(product.attributes ?? {}).map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom: "1px dashed #e2e8f0",
                  }}
                >
                  <Typography sx={{ color: "#4a5568", fontWeight: 500 }}>{key}</Typography>
                  <Typography sx={{ fontWeight: 550 }}>{String(value)}</Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                bgcolor: "#ffffff",
                border: "1px solid #c6f6d5",
                boxShadow: "0 6px 18px rgba(56,161,105,0.08)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: "#38a169" }}>
                Dimensions & Info
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px dashed #e2e8f0" }}>
                <Typography sx={{ color: "#4a5568" }}>Dimensions</Typography>
                <Typography sx={{ fontWeight: 550 }}>
                  {product.dimensions?.length ?? 0} × {product.dimensions?.width ?? 0} ×{" "}
                  {product.dimensions?.height ?? 0} {product.dimensions?.unit ?? "cm"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px dashed #e2e8f0" }}>
                <Typography sx={{ color: "#4a5568" }}>Category</Typography>
                <Typography sx={{ fontWeight: 550 }}>{product.category?.name}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px dashed #e2e8f0" }}>
                <Typography sx={{ color: "#4a5568" }}>SKU</Typography>
                <Typography sx={{ fontWeight: 550 }}>{product.sku}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                <Typography sx={{ color: "#4a5568" }}>Availability</Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: product.inventory.inStock ? "#38a169" : "#e53e3e",
                  }}
                >
                  {product.inventory.inStock ? "In Stock" : "Out of Stock"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />
      </Container>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" icon={<CheckCircleOutlined />}>
          {addedItemName} added to cart!
        </Alert>
      </Snackbar>
    </Box>
  );
}
