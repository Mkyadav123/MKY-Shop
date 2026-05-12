import React, { type JSX } from "react";

import {
  Box,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

import type {
  SxProps,
  Theme,
} from "@mui/material/styles";

import {
  CreditCard,
  AccountBalance,
  Payment,
  Security,
} from "@mui/icons-material";

/* =========================
   TYPES
========================= */

interface PaymentMethod {
  id: number;
  label: string;
  icon: React.ReactElement;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

/* =========================
   STYLES
========================= */

const sectionWrapperSx: SxProps<Theme> = {
  width: "100%",
  mt: 0,
  mb: 0,
};

const paymentMethods: PaymentMethod[] = [
  {
    id: 1,
    label: "UPI • GPay • PhonePe • Paytm",
    icon: (
      <Payment
        sx={{
          fontSize: 20,
          color: "#065f46 !important",
        }}
      />
    ),
    bgColor: "#ecfdf5",
    textColor: "#065f46",
    borderColor:
      "rgba(16,185,129,0.15)",
  },

  {
    id: 2,
    label: "Credit & Debit Cards",
    icon: (
      <CreditCard
        sx={{
          fontSize: 20,
          color: "#1d4ed8 !important",
        }}
      />
    ),
    bgColor: "#eff6ff",
    textColor: "#1d4ed8",
    borderColor:
      "rgba(59,130,246,0.15)",
  },

  {
    id: 3,
    label: "Net Banking",
    icon: (
      <AccountBalance
        sx={{
          fontSize: 20,
          color: "#c2410c !important",
        }}
      />
    ),
    bgColor: "#fff7ed",
    textColor: "#c2410c",
    borderColor:
      "rgba(249,115,22,0.15)",
  },
];

/* =========================
   COMPONENT
========================= */

export default function AcceptPayment(): JSX.Element {
  return (
    <Box sx={sectionWrapperSx}>
      <Box
        sx={{
          width: "100%",
          background: "#ffffff",
          border: "1px solid #edf2f7",
          px: {
            xs: 2,
            md: 8,
          },
          py: {
            xs: 4,
            md: 5,
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Security
            sx={{
              color: "#16a34a",
              fontSize: 26,
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Secure Payment Options
          </Typography>
        </Stack>

        {/* Description */}
        <Typography
          sx={{
            textAlign: "center",
            color: "#6b7280",
            mb: 4,
            maxWidth: "720px",
            mx: "auto",
            lineHeight: 1.7,
            fontSize: "1rem",
          }}
        >
          We support secure and trusted payment
          methods for seamless checkout across
          all devices.
        </Typography>

        {/* Payment Chips */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {paymentMethods.map(
            (method: PaymentMethod) => (
              <Chip
                key={method.id}
                icon={method.icon}
                label={method.label}
                sx={{
                  height: "50px",
                  px: 2,
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  bgcolor: method.bgColor,
                  color: method.textColor,
                  border: `1px solid ${method.borderColor}`,
                }}
              />
            )
          )}
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            textAlign: "center",
            mt: 4,
            color: "#6b7280",
            fontWeight: 500,
            fontSize: "0.95rem",
          }}
        >
          🔒 100% Secure Payments powered by{" "}
          <a
            href="https://razorpay.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Razorpay
          </a>
        </Typography>
      </Box>
    </Box>
  );
}