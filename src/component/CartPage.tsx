import React, { useEffect, useState } from "react";
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
  TextField,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@mui/material";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import type { CartItem } from "../types/cart";
import type { ShippingCheckResult } from "../types/shipping";
import { checkShippingEligibility } from "../services/shippingApi";

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
     SHIPPING ELIGIBILITY CHECK
  ========================= */

  const [pincode,         setPincode]         = useState("");
  const [shippingResult,  setShippingResult]  = useState<ShippingCheckResult | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Auto-check whenever a full 6-digit pincode is typed
  useEffect(() => {
    const cleaned = pincode.replace(/\D/g, "");
    if (cleaned.length !== 6) { setShippingResult(null); return; }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setShippingLoading(true);
      try {
        const result = await checkShippingEligibility({
          deliveryAddress: `${cleaned}, India`,
          orderAmount:     grandTotal,
          pincode:         cleaned,
        });
        if (!cancelled) setShippingResult(result);
      } catch {
        if (!cancelled) setShippingResult({
          success: false, eligible: false, geocodingError: true,
          distanceKm: null, matchedTier: null, requiredAmount: null,
          geocodedLat: null, geocodedLng: null,
          deliveryAddress: cleaned,
          message: "Could not reach the delivery check service. Please try again.",
        });
      } finally {
        if (!cancelled) setShippingLoading(false);
      }
    }, 600);

    return () => { cancelled = true; clearTimeout(timer); };
  // Re-run whenever pincode OR cart total changes (adding items may unlock eligibility)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode, grandTotal]);

  const shortage =
    shippingResult?.matchedTier && !shippingResult.eligible
      ? shippingResult.matchedTier.minOrderAmount - grandTotal : 0;

  /* Shipping status banner — mirrors CheckoutPage */
  const ShippingStatusBadge = (): JSX.Element | null => {
    if (shippingLoading) return (
      <Box sx={{ display:"flex", alignItems:"center", gap:1.5, mt:1.5, p:1.5,
                 borderRadius:"12px", background:"rgba(59,130,246,0.07)",
                 border:"1px solid rgba(59,130,246,0.18)" }}>
        <CircularProgress size={16} sx={{ color:"#3b82f6" }} />
        <Typography sx={{ fontSize:"0.82rem", color:"#3b82f6" }}>
          Checking delivery availability…
        </Typography>
      </Box>
    );

    if (!shippingResult) return null;

    /* Geocoding / address error */
    if (shippingResult.geocodingError) return (
      <Box sx={{ mt:1.5, p:2, borderRadius:"14px",
                 background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:0.5 }}>
          <ErrorOutlinedIcon sx={{ color:"#d97706", fontSize:18 }} />
          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#d97706" }}>
            Pincode could not be verified
          </Typography>
        </Box>
        <Typography sx={{ fontSize:"0.79rem", color:"#92400e", lineHeight:1.5 }}>
          {shippingResult.message}
        </Typography>
      </Box>
    );

    /* Outside all delivery zones */
    if (!shippingResult.eligible && !shippingResult.matchedTier) return (
      <Box sx={{ mt:1.5, p:2, borderRadius:"14px",
                 background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.25)" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:0.5 }}>
          <CancelIcon sx={{ color:"#ef4444", fontSize:18 }} />
          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#dc2626" }}>
            Outside delivery range
          </Typography>
          {shippingResult.distanceKm !== null && (
            <Chip icon={<MyLocationIcon sx={{ fontSize:"13px !important" }} />}
                  label={`${shippingResult.distanceKm} km away`} size="small"
                  sx={{ ml:"auto", bgcolor:"rgba(239,68,68,0.12)", color:"#dc2626",
                        fontWeight:700, fontSize:"0.72rem" }} />
          )}
        </Box>
        <Typography sx={{ fontSize:"0.79rem", color:"#7f1d1d", lineHeight:1.5 }}>
          {shippingResult.message}
        </Typography>
      </Box>
    );

    /* In range but cart total too low — progress bar toward minimum */
    if (!shippingResult.eligible && shippingResult.matchedTier) {
      const pct = Math.min((grandTotal / shippingResult.matchedTier.minOrderAmount) * 100, 100);
      return (
        <Box sx={{ mt:1.5, borderRadius:"14px", border:"1px solid rgba(234,179,8,0.35)",
                   overflow:"hidden" }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1, px:2, pt:1.8, pb:1,
                     background:"rgba(234,179,8,0.08)" }}>
            <WarningIcon sx={{ color:"#ca8a04", fontSize:18 }} />
            <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#854d0e" }}>
              Add ₹{shortage.toLocaleString("en-IN")} more to unlock delivery
            </Typography>
            <Chip icon={<MyLocationIcon sx={{ fontSize:"13px !important" }} />}
                  label={`${shippingResult.distanceKm} km · ${shippingResult.matchedTier.label}`}
                  size="small"
                  sx={{ ml:"auto", bgcolor:"rgba(234,179,8,0.15)", color:"#92400e",
                        fontWeight:600, fontSize:"0.7rem" }} />
          </Box>
          <Box sx={{ px:2, pt:0.5, pb:0.5, background:"rgba(234,179,8,0.08)" }}>
            <LinearProgress variant="determinate" value={pct}
              sx={{ height:6, borderRadius:3, bgcolor:"rgba(234,179,8,0.2)",
                    "& .MuiLinearProgress-bar": {
                      background:"linear-gradient(90deg,#f59e0b,#ca8a04)", borderRadius:3 } }} />
          </Box>
          <Box sx={{ px:2, pt:0.5, pb:1.8, background:"rgba(234,179,8,0.08)",
                     display:"flex", justifyContent:"space-between" }}>
            <Typography sx={{ fontSize:"0.76rem", color:"#92400e" }}>
              Your cart: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
            </Typography>
            <Typography sx={{ fontSize:"0.76rem", color:"#92400e" }}>
              Minimum: <strong>₹{shippingResult.matchedTier.minOrderAmount.toLocaleString("en-IN")}</strong>
            </Typography>
          </Box>
        </Box>
      );
    }

    /* Eligible ✅ */
    return (
      <Box sx={{ mt:1.5, p:2, borderRadius:"14px",
                 background:"rgba(22,163,74,0.07)", border:"1px solid rgba(22,163,74,0.25)" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          <CheckCircleIcon sx={{ color:"#16a34a", fontSize:18 }} />
          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#15803d" }}>
            Delivery available ✓
          </Typography>
          <Chip icon={<MyLocationIcon sx={{ fontSize:"13px !important" }} />}
                label={`${shippingResult.distanceKm} km · ${shippingResult.matchedTier?.label}`}
                size="small"
                sx={{ ml:"auto", bgcolor:"rgba(22,163,74,0.12)", color:"#15803d",
                      fontWeight:600, fontSize:"0.7rem" }} />
        </Box>
        <Typography sx={{ fontSize:"0.79rem", color:"#166534", mt:0.5 }}>
          {shippingResult.message}
        </Typography>
      </Box>
    );
  };

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
                <ShoppingCartOutlinedIcon
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
                            <RemoveIcon fontSize="small" />
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
                            <AddIcon fontSize="small" />
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
                          <DeleteOutlinedIcon />
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
              startIcon={<ArrowBackIcon />}
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
                  mb: 3,
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

              {/* ── Delivery check ── */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LocalShippingIcon sx={{ fontSize: 16, color: "#718096" }} />
                  <Typography
                    sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.5px" }}
                  >
                    Check Delivery
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter pincode (e.g. 400601)"
                  value={pincode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPincode(v);
                  }}
                  slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6, }, }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: "0.9rem",
                    },
                  }}
                />
                <ShippingStatusBadge />
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  navigate("/checkout")
                }
                startIcon={
                  <LockOutlinedIcon />
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