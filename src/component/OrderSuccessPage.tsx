import {
  useEffect,
  type JSX,
} from "react";

import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  Stack,
  Divider,
} from "@mui/material";

import {
  CheckCircleRounded,
  ShoppingBag,
  ReceiptLong,
} from "@mui/icons-material";

import {
  useLocation,
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";

import {
  motion,
} from "framer-motion";

const { default: jsPDF } =
  await import("jspdf");

import type {
  CartItem,
} from "../types/cart";

/* =========================
   TYPES
========================= */

interface OrderSuccessState {
  paymentId?: string;

  orderId?: string;

  customer?: string;

  email?: string;

  phone?: string;

  address?: string;

  city?: string;

  pincode?: string;

  amount?: number;

  items?: CartItem[];
}

/* =========================
   COMPONENT
========================= */

export default function OrderSuccessPage(): JSX.Element {
  const location =
    useLocation();

  const navigate = useNavigate();

  const state =
    location.state as
      | OrderSuccessState
      | undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  
  useEffect(() => {
    if (
      !state ||
      !state.paymentId ||
      !state.orderId
    ) {
      navigate(
        "/products",
        {
          replace: true,
        }
      );
    }
  }, [
    state,
    navigate,
  ]);

  /* =========================
     FALLBACKS
  ========================= */

  const paymentId =
    state?.paymentId ||
    "N/A";

  const customer =
    state?.customer ||
    "Customer";

  const amount =
    state?.amount || 0;

  const orderId =
    state?.orderId || "N/A";

  const email =
    state?.email || "";

  const phone =
    state?.phone || "";

  const address =
    state?.address || "";

  const city =
    state?.city || "";

  const pincode =
    state?.pincode || "";

  const items =
    state?.items || [];

  /* =========================
     Download Receipt Handler
  ========================= */

const handleDownloadReceipt =
  (): void => {
    const doc = new jsPDF();

    /* =========================
       COLORS
    ========================= */

    const dark: [
      number,
      number,
      number
    ] = [15, 23, 42];

    const primary: [
      number,
      number,
      number
    ] = [37, 99, 235];

    const gray: [
      number,
      number,
      number
    ] = [100, 116, 139];

    const light: [
      number,
      number,
      number
    ] = [248, 250, 252];

    /* =========================
       HEADER
    ========================= */

    doc.setFillColor(
      dark[0],
      dark[1],
      dark[2]
    );

    doc.rect(
      0,
      0,
      210,
      42,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(24);

    doc.text(
      "MKY STORE",
      20,
      22
    );

    doc.setFontSize(11);

    doc.setTextColor(
      203,
      213,
      225
    );

    doc.text(
      "Premium Ecommerce Invoice",
      20,
      31
    );

    /* =========================
       TITLE
    ========================= */

    doc.setTextColor(
      dark[0],
      dark[1],
      dark[2]
    );

    doc.setFontSize(22);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "INVOICE",
      150,
      22
    );

    /* =========================
       CUSTOMER CARD
    ========================= */

    doc.setFillColor(
      light[0],
      light[1],
      light[2]
    );

    doc.roundedRect(
      15,
      55,
      180,
      48,
      5,
      5,
      "F"
    );

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.setFontSize(10);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "BILLED TO",
      25,
      68
    );

    doc.setTextColor(
      dark[0],
      dark[1],
      dark[2]
    );

    doc.setFontSize(16);

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      customer,
      25,
      80
    );

    doc.setFontSize(11);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.text(
      `Payment ID: ${paymentId}`,
      25,
      92
    );

    /* STATUS */

    doc.setFillColor(
      34,
      197,
      94
    );

    doc.roundedRect(
      145,
      68,
      32,
      12,
      3,
      3,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(10);

    doc.text(
      "PAID",
      155,
      76
    );

    /* META */

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Invoice Date: ${new Date().toLocaleDateString()}`,
      25,
      114
    );

    doc.text(
      `Order ID: ${orderId}`,
      25,
      124
    );

    /* =========================
       SHIPPING CARD
    ========================= */

    doc.setFillColor(
      light[0],
      light[1],
      light[2]
    );

    doc.roundedRect(
      15,
      135,
      180,
      42,
      5,
      5,
      "F"
    );

    doc.setTextColor(
      dark[0],
      dark[1],
      dark[2]
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(12);

    doc.text(
      "Shipping Address",
      25,
      148
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.text(
      `${address}`,
      25,
      160
    );

    doc.text(
      `${city} - ${pincode}`,
      25,
      168
    );

    doc.text(
      `Phone: ${phone}`,
      115,
      160
    );

    doc.text(
      `Email: ${email}`,
      115,
      168
    );

    /* =========================
       TABLE HEADER
    ========================= */

    doc.setFillColor(
      primary[0],
      primary[1],
      primary[2]
    );

    doc.roundedRect(
      15,
      190,
      180,
      12,
      3,
      3,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(11);

    doc.text(
      "DESCRIPTION",
      25,
      198
    );

    doc.text(
      "AMOUNT",
      155,
      198
    );

    /* =========================
       PRODUCT ROWS
    ========================= */

    let y = 218;

    items.forEach((item) => {
      doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        item.name,
        25,
        y
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setTextColor(
        gray[0],
        gray[1],
        gray[2]
      );

      doc.text(
        `Qty: ${item.qty}`,
        25,
        y + 8
      );

      doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
      );

      doc.text(
        `Rs. ${
          item.qty *
          item.price.amount
        }`,
        155,
        y
      );

      y += 24;
    });

    /* =========================
       DIVIDER
    ========================= */

    doc.setDrawColor(
      226,
      232,
      240
    );

    doc.line(
      15,
      y,
      195,
      y
    );

    /* =========================
       TOTAL
    ========================= */

    y += 18;

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.setFontSize(12);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Grand Total",
      25,
      y - 0.5
    );

    doc.setTextColor(
      primary[0],
      primary[1],
      primary[2]
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(20);

    doc.text(
      `Rs. ${amount}`,
      145,
      y - 1 
    );

    /* =========================
       FOOTER
    ========================= */

    doc.setFontSize(10);

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Thank you for shopping with",
      95,
      275,
      {
        align: "center",
      }
    );

    doc.setTextColor(
      37,
      99,
      235
    );

    doc.textWithLink(
      "MKY Store.",
      127,
      275,
      {
        url: "https://shop.mky.co.in",
        align: "center",
      }
    );

    doc.setTextColor(
      gray[0],
      gray[1],
      gray[2]
    );

    doc.text(
      "Secure payments powered by Razorpay.",
      105,
      285,
      {
        align: "center",
      }
    );

    /* =========================
       SAVE
    ========================= */

    doc.save(
      `MKY-Invoice-${paymentId}.pdf`
    );
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#0F172A 0%,#111827 45%,#F8FAFC 45%)",

        display: "flex",

        alignItems: "center",

        justifyContent:
          "center",

        px: 2,

        py: {
          xs: 4,
          md: 8,
        },
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
        >
          <Card
            sx={{
              borderRadius: "32px",

              overflow: "hidden",

              border:
                "1px solid rgba(255,255,255,0.08)",

              boxShadow:
                "0 25px 80px rgba(0,0,0,0.18)",
            }}
          >
            {/* TOP */}
            <Box
              sx={{
                background:
                  "linear-gradient(135deg,#111827,#1E293B)",

                color: "#fff",

                textAlign: "center",

                px: {
                  xs: 3,
                  md: 6,
                },

                py: {
                  xs: 5,
                  md: 7,
                },
              }}
            >
              {/* SUCCESS ICON */}
              <CheckCircleRounded
                sx={{
                  fontSize: {
                    xs: 80,
                    md: 100,
                  },

                  color: "#22C55E",

                  mb: 3,
                }}
              />

              {/* TITLE */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,

                  mb: 2,

                  fontSize: {
                    xs: "2rem",
                    md: "3rem",
                  },
                }}
              >
                Order Confirmed
              </Typography>

              {/* DESCRIPTION */}
              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.72)",

                  maxWidth: "620px",

                  mx: "auto",

                  lineHeight: 1.8,

                  fontSize: "1rem",
                }}
              >
                Thank you{" "}
                <strong>
                  {customer}
                </strong>
                . Your payment has been
                processed successfully and
                your order is now being
                prepared.
              </Typography>
            </Box>

            {/* CONTENT */}
            <Box
              sx={{
                p: {
                  xs: 3,
                  md: 6,
                },

                background:
                  "linear-gradient(135deg,#FFFFFF,#F8FAFC)",
              }}
            >
              {/* ORDER DETAILS */}
              <Stack
                spacing={3}
              >
                {/* PAYMENT ID */}
                <Box>
                  <Typography
                    sx={{
                      color: "#64748B",

                      mb: 1,

                      fontWeight: 700,
                    }}
                  >
                    Payment ID
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,

                      color: "#0F172A",

                      wordBreak:
                        "break-all",
                    }}
                  >
                    {paymentId}
                  </Typography>
                </Box>

                <Divider />

                {/* TOTAL */}
                <Box
                  sx={{
                    display: "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#64748B",

                      fontWeight: 700,
                    }}
                  >
                    Total Paid
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,

                      color: "#2563EB",
                    }}
                  >
                    ₹{amount}
                  </Typography>
                </Box>

                <Divider />

                {/* STATUS */}
                <Box
                  sx={{
                    display: "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "center",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#64748B",

                      fontWeight: 700,
                    }}
                  >
                    Order Status
                  </Typography>

                  <Typography
                    sx={{
                      color: "#22C55E",

                      fontWeight: 800,
                    }}
                  >
                    Confirmed
                  </Typography>
                </Box>
              </Stack>

              {/* ACTIONS */}
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                sx={{
                  mt: 5,
                }}
              >
                {/* SHOP BUTTON */}
                <Button
                  component={
                    RouterLink
                  }
                  to="/products"
                  fullWidth
                  size="large"
                  startIcon={
                    <ShoppingBag />
                  }
                  sx={{
                    py: 1.8,

                    borderRadius:
                      "18px",

                    background:
                      "linear-gradient(135deg,#2563EB,#4F46E5)",

                    color: "#fff",

                    fontWeight: 800,

                    textTransform:
                      "none",

                    "&:hover": {
                      background:
                        "linear-gradient(135deg,#1D4ED8,#4338CA)",
                    },
                  }}
                >
                  Continue Shopping
                </Button>

                {/* RECEIPT BUTTON */}
                <Button
                  fullWidth
                  size="large"
                  variant="outlined"
                  startIcon={<ReceiptLong />}
                  onClick={
                    handleDownloadReceipt
                  }
                  sx={{
                    py: 1.8,

                    borderRadius: "18px",

                    borderColor: "#CBD5E1",

                    color: "#0F172A",

                    fontWeight: 700,

                    textTransform: "none",

                    "&:hover": {
                      borderColor: "#94A3B8",

                      background: "#F8FAFC",
                    },
                  }}
                >
                  Download Receipt
                </Button>
              </Stack>

              {/* FOOTER */}
              <Typography
                sx={{
                  textAlign: "center",

                  mt: 5,

                  color: "#64748B",

                  fontSize: "0.95rem",

                  lineHeight: 1.8,
                }}
              >
                A confirmation email has
                been sent to your registered
                email address with complete
                order details.
              </Typography>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}