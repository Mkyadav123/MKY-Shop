import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Chip,
  Box,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { ShoppingCart, CheckCircleOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import productData from "../ApiData/productData.json";
import type {
  CartItem,
  ProductImage,
  ProductPrice,
  ProductInventory,
  ProductDimensions,
  ProductCategory,
} from "../types/cart";

/* =========================
   TYPES
========================= */

interface Product {
  id: number | string;
  name: string;
  shortDescription?: string;
  description?: string;
  images: ProductImage[];
  inventory: ProductInventory;
  price: ProductPrice;
  tags?: string[];
  attributes: Record<string, string | number | boolean>;
  dimensions: ProductDimensions;
  category?: ProductCategory;
}

interface ProductListPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

/* =========================
   COMPONENT
========================= */

export default function ProductListPage({
  setCart,
}: ProductListPageProps) {
  const navigate = useNavigate();

  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [addedItemName, setAddedItemName] = useState<string>("");

  const product = productData as Product;

  // Add to cart
  const handleAddToCart = (product: Product) => {
    if (!product.inventory.inStock) return;

    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, qty: 1 }];
    });

    setAddedItemName(product.name);
    setToastOpen(true);

    navigate("/cart");
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1520px",
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* Title */}
        <Typography
          variant="h3"
          component={motion.h3}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            fontWeight: 800,
            mt: 4,
            textAlign: "center",
            background: "#fff",
          }}
        >
          Our Product
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ textAlign: "center", color: "#718096", background: "#fff" }}
        >
          Premium storage solution designed for efficiency.
        </Typography>

        {/* Product Section */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.1fr 1fr",
            },
            gap: { xs: 4, md: 14 },
            alignItems: "center",
            background: "#fff",            
            p: { xs: 3, md: 6 },
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
          }}
        >
          {/* Image */}
          <Box
            sx={{
              flex: 1,
              background:
                "linear-gradient(135deg,#f8fafc,#edf2f7)",
              p: 5,
              borderRadius: "24px",
              textAlign: "center",
            }}
          >
            <img
              src={
                product.images[0]?.url ||
                "https://dummyimage.com/400x400"
              }
              alt={product.name}
              style={{
                maxWidth: "100%",
                height: "480px",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1 }}>
            <Chip
              label={
                product.inventory.inStock
                  ? "In Stock"
                  : "Out of Stock"
              }
              color={
                product.inventory.inStock
                  ? "success"
                  : "error"
              }
              sx={{ mb: 2, fontWeight: 700 }}
            />

            <Typography
              variant="h3"
              sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}
            >
              {product.name}
            </Typography>

            <Typography sx={{ color: "#718096", mb: 2 }}>
              {product.shortDescription ||
                product.description}
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 800, mb: 3, color: "#111" }}
            >
              ₹{product.price.amount}
            </Typography>

            {/* Tags */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              {product.tags?.map((tag, i) => (
                <Chip key={i} label={tag} />
              ))}
            </Box>

            {/* CTA */}
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
                "&:hover": {
                  bgcolor: "#222",
                },
              }}
            >
              {product.inventory.inStock
                ? "Add to Cart"
                : "Out of Stock"}
            </Button>
          </Box>
        </Box>       

        {/* Product Details */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 4,
              textAlign: "center",
              position: "relative",
              display: "inline-block",
              left: "10%",
              transform: "translateX(-50%)",

              "&::after": {
                content: '""',
                display: "block",
                width: "100px",
                height: "3px",
                backgroundColor: "#2b6cb0",
                borderRadius: "2px",
                margin: "8px auto 0",
              },
            }}
          >
            Product Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 4,
            }}
          >
            {/* Specifications */}
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                bgcolor: "#ffffff",
                border: "1px solid #cfe3ff",
                boxShadow:
                  "0 6px 18px rgba(43,108,176,0.08)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: "#38a169",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                📦 Specifications
              </Typography>

              {Object.entries(product.attributes).map(
                ([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        "1px dashed #e2e8f0",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#4a5568",
                        fontWeight: 500,
                      }}
                    >
                      {key}
                    </Typography>

                    <Typography
                      sx={{ fontWeight: 550 }}
                    >
                      {String(value)}
                    </Typography>
                  </Box>
                )
              )}
            </Box>

            {/* Dimensions */}
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                bgcolor: "#ffffff",
                border: "1px solid #c6f6d5",
                boxShadow:
                  "0 6px 18px rgba(56,161,105,0.08)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: "#38a169",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                📏 Dimensions & Info
              </Typography>

              <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        "1px dashed #e2e8f0",
                    }}>
                <Typography sx={{ color: "#4a5568" }}>
                  Dimensions
                </Typography>

                <Typography sx={{ fontWeight: 550 }}>
                  {product.dimensions.length} ×{" "}
                  {product.dimensions.width} ×{" "}
                  {product.dimensions.height}{" "}
                  {product.dimensions.unit}
                </Typography>
              </Box>

              <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        "1px dashed #e2e8f0",
                    }}>
                <Typography sx={{ color: "#4a5568" }}>
                  Category
                </Typography>

                <Typography sx={{ fontWeight: 550 }}>
                  {product.category?.name}
                </Typography>
              </Box>

              <Box sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom:
                        "1px dashed #e2e8f0",
                    }}>
                <Typography sx={{ color: "#4a5568" }}>
                  Availability
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 800,
                    color: product.inventory.inStock
                      ? "#38a169"
                      : "#e53e3e",
                  }}
                >
                  {product.inventory.inStock
                    ? "In Stock"
                    : "Out of Stock"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Divider
          sx={{
            my: 4,
            borderColor:
              "rgba(255,255,255,0.08)",
          }}
        />
      </Container>

      {/* Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="success"
          icon={<CheckCircleOutlined />}
        >
          {addedItemName} added to cart!
        </Alert>
      </Snackbar>
    </Box>
  );
}