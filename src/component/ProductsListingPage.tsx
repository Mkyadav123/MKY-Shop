import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { motion } from "framer-motion";
import { fetchStoreProducts } from "../services/productApi";
import type { Product } from "../types/product";
import type { CartItem } from "../types/cart";

interface ProductsListingPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export default function ProductsListingPage({
  setCart,
}: ProductsListingPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await fetchStoreProducts();
        setProducts(data);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Could not load products from server."
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!product.inventory.inStock) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);

      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 6 }}>
      {loadError && (
        <Alert severity="error" sx={{ borderRadius: 0 }}>
          {loadError}
        </Alert>
      )}

      <Container maxWidth="lg" sx={{ pt: 5, pb: 2 }}>
        <Typography
          variant="h3"
          component={motion.h1}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ fontWeight: 800, textAlign: "center", mb: 1 }}
        >
          Our Products
        </Typography>
        <Typography
          sx={{ textAlign: "center", color: "#718096", mb: 5 }}
        >
          Browse everything available in our store.
        </Typography>

        {products.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              px: 3,
              bgcolor: "#fff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No products available
            </Typography>
            <Typography color="text.secondary">
              Check back soon — new items are added from the admin panel.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {products.map((product, index) => (
              <Card
                key={product.id}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <CardMedia
                  component={RouterLink}
                  to={`/product/${product.id}`}
                  sx={{
                    height: 220,
                    bgcolor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                    textDecoration: "none",
                  }}
                  image={
                    product.images[0]?.url ||
                    "https://dummyimage.com/400x400/e2e8f0/94a3b8&text=No+Image"
                  }
                  title={product.name}
                />

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
                    <Chip
                      label={product.inventory.inStock ? "In Stock" : "Out of Stock"}
                      size="small"
                      color={product.inventory.inStock ? "success" : "error"}
                      sx={{ fontWeight: 700 }}
                    />
                    {product.category?.name && (
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                        {product.category.name}
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    component={RouterLink}
                    to={`/product/${product.id}`}
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: "#0f172a",
                      textDecoration: "none",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1,
                      "&:hover": { color: "#2563eb" },
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "0.875rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 2,
                      minHeight: "2.5rem",
                    }}
                  >
                    {product.shortDescription || product.description}
                  </Typography>

                  <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#111" }}>
                    ₹{product.price.amount}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
                  <Button
                    component={RouterLink}
                    to={`/product/${product.id}`}
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityOutlinedIcon />}
                    sx={{
                      flex: 1,
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={!product.inventory.inStock}
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                    sx={{
                      flex: 1,
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#111",
                      "&:hover": { bgcolor: "#222" },
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
