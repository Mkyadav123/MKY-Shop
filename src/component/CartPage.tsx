import React from "react";
import type { JSX } from "react";

import { useNavigate } from "react-router-dom";

import {
  Container,
  Card,
  Typography,
  Button,
  Box,
  IconButton,
  Divider,
  CardMedia,
} from "@mui/material";

import {
  DeleteOutlined,
  Add,
  Remove,
  LockOutlined,
  ShoppingCartOutlined,
  ArrowBack,
} from "@mui/icons-material";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import type {
  CartItem,
} from "../types/cart";

/* =========================
   TYPES
========================= */

interface CartPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<
    React.SetStateAction<CartItem[]>
  >;
}

/* =========================
   COMPONENT
========================= */

export default function CartPage({
  cart,
  setCart,
}: CartPageProps): JSX.Element {
  const navigate = useNavigate();

  /* =========================
     QUANTITY CONTROLS
  ========================= */

  const increaseQty = (
    id: number | string
  ): void => {
    setCart(
      cart.map((item: CartItem) =>
        item.id === id
          ? {
              ...item,
              qty: item.qty + 1,
            }
          : item
      )
    );
  };

  const decreaseQty = (
    id: number | string
  ): void => {
    setCart(
      cart
        .map((item: CartItem) =>
          item.id === id
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item
        )
        .filter(
          (item: CartItem) => item.qty > 0
        )
    );
  };

  const removeItem = (
    id: number | string
  ): void => {
    setCart(
      cart.filter(
        (item: CartItem) =>
          item.id !== id
      )
    );
  };

  /* =========================
     TOTALS
  ========================= */

  const subtotal: number = cart.reduce(
    (
      acc: number,
      item: CartItem
    ) =>
      acc +
      item.qty * item.price.amount,
    0
  );

  const grandTotal: number = subtotal;

  /* =========================
     EMPTY CART
  ========================= */

  if (cart.length === 0) {
    return (
      <Box
        sx={{
          bgcolor: "#f9fafb",
          minHeight: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 12,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <Card
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: "24px",
                boxShadow:
                  "0 20px 40px rgba(0,0,0,0.04)",
                border:
                  "1px solid #edf2f7",
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "#edf2f7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  mx: "auto",
                  mb: 4,
                }}
              >
                <ShoppingCartOutlined
                  sx={{
                    fontSize: 50,
                    color: "#a0aec0",
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#2d3748",
                  mb: 2,
                }}
              >
                Your cart is empty
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#718096",
                  mb: 4,
                }}
              >
                It looks like you
                haven't added anything
                to your cart yet.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() =>
                  navigate("/products")
                }
                sx={{
                  bgcolor: "#1a202c",
                  color: "white",
                  px: 6,
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: 700,
                  textTransform:
                    "none",

                  "&:hover": {
                    bgcolor: "#2d3748",
                  },
                }}
              >
                Return to Shop
              </Button>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  /* =========================
     MAIN RENDER
  ========================= */

  return (
    <Box
      sx={{
        bgcolor: "#f9fafb",
        py: {
          xs: 6,
          md: 6,
        },
      }}
    >
      <Container maxWidth="lg">
        {/* TITLE */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#1a202c",
            mb: 1,
            textAlign: "center",
          }}
        >
          Your Cart
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            color: "#718096",
            mb: 6,
            textAlign: "center",
          }}
        >
          Review your items and
          proceed to secure checkout.
        </Typography>

        {/* GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "7fr 5fr",
            },
            gap: 4,
            alignItems: "start",
          }}
        >
          {/* LEFT PANEL */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <AnimatePresence>
              {cart.map(
                (item: CartItem) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                  >
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                        },
                        p: 2,
                        borderRadius:
                          "16px",
                        boxShadow:
                          "0 4px 6px rgba(0,0,0,0.02)",
                        border:
                          "1px solid #edf2f7",
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                      }}
                    >
                      {/* IMAGE */}
                      <Box
                        sx={{
                          width: {
                            xs: "100%",
                            sm: 120,
                          },
                          height: 120,
                          bgcolor:
                            "#f7fafc",
                          borderRadius:
                            "12px",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          overflow:
                            "hidden",
                          mr: {
                            sm: 3,
                          },
                          mb: {
                            xs: 2,
                            sm: 0,
                          },
                          flexShrink: 0,
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={
                            item
                              .images?.[0]
                              ?.url ||
                            "https://dummyimage.com/150x150"
                          }
                          alt={item.name}
                          sx={{
                            height:
                              "100%",
                            objectFit:
                              "contain",
                            p: 1,
                          }}
                        />
                      </Box>

                      {/* INFO */}
                      <Box
                        sx={{
                          flexGrow: 1,
                          minWidth: 0,
                          pr: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color:
                              "#2d3748",
                            mb: 0.5,
                          }}
                        >
                          {item.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 800,
                            color:
                              "#4a5568",
                          }}
                        >
                          ₹
                          {
                            item.price
                              .amount
                          }
                        </Typography>
                      </Box>

                      {/* ACTIONS */}
                      <Box
                        sx={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 3,
                          mt: {
                            xs: 3,
                            sm: 0,
                          },
                          width: {
                            xs: "100%",
                            sm: "auto",
                          },
                          justifyContent:
                            {
                              xs: "space-between",
                              sm: "flex-end",
                            },
                        }}
                      >
                        {/* QUANTITY */}
                        <Box
                          sx={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            bgcolor:
                              "#f7fafc",
                            border:
                              "1px solid #e2e8f0",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              decreaseQty(
                                item.id
                              )
                            }
                          >
                            <Remove fontSize="small" />
                          </IconButton>

                          <Typography
                            sx={{
                              px: 2,
                              fontWeight: 700,
                            }}
                          >
                            {item.qty}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() =>
                              increaseQty(
                                item.id
                              )
                            }
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="subtitle1" 
                        sx={{ fontWeight: 800, color: "#1a202c", width: "40px", textAlign: "right" }}>
                          ₹{item.qty * item.price.amount}
                        </Typography>

                        {/* REMOVE */}
                        <IconButton
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          sx={{
                            color:
                              "#e53e3e",
                            bgcolor:
                              "#fff5f5",

                            "&:hover":
                              {
                                bgcolor:
                                  "#fed7d7",
                              },
                          }}
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </Box>
                    </Card>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* BACK BUTTON */}
            <Button
              variant="contained"
              onClick={() =>
                navigate("/products")
              }
              startIcon={<ArrowBack />}
              sx={{
                width: "fit-content",
                px: 3,
                py: 1,
                borderRadius: "12px",
                bgcolor: "#1a202c",
                fontWeight: 700,
                textTransform: "none",

                "&:hover": {
                  bgcolor: "#2d3748",
                },
              }}
            >
              Back to Product
            </Button>
          </Box>

          {/* RIGHT PANEL */}
          <Box
            sx={{
              position: "sticky",
              top: "100px",
            }}
          >
            <Card
              sx={{
                p: 4,
                borderRadius: "20px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,0.05)",
                border:
                  "1px solid #edf2f7",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#1a202c",
                  mb: 3,
                }}
              >
                Order Summary
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  mb: 2,
                }}
              >
                <Typography>
                  Subtotal
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  ₹{subtotal}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  mb: 4,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Grand Total
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#2b6cb0",
                  }}
                >
                  ₹{grandTotal}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  navigate("/checkout")
                }
                startIcon={
                  <LockOutlined />
                }
                sx={{
                  py: 2,
                  borderRadius: "12px",
                  bgcolor: "#1a202c",
                  fontWeight: 800,
                  textTransform:
                    "none",
                  fontSize: "1.1rem",

                  "&:hover": {
                    bgcolor: "#2d3748",
                  },

                  mb: 2,
                }}
              >
                Proceed to Checkout
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  color: "#a0aec0",
                  fontWeight: 600,
                }}
              >
                Secure SSL Encrypted
                Checkout
              </Typography>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}