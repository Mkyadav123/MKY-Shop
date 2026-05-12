import type { JSX } from "react";

import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import {
  Home,
  ArrowBack,
} from "@mui/icons-material";

import {
  Link as RouterLink,
} from "react-router-dom";

/* =========================
   COMPONENT
========================= */

export default function NotFoundPage(): JSX.Element {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#0f172a 0%, #111827 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            py: {
              xs: 8,
              md: 10,
            },
            px: {
              xs: 3,
              md: 6,
            },
            borderRadius: "28px",
            background:
              "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            border:
              "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          {/* 404 */}

          <Typography
            sx={{
              fontSize: {
                xs: "5rem",
                md: "8rem",
              },
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-4px",
              background:
                "linear-gradient(90deg,#60a5fa,#c084fc)",
              WebkitBackgroundClip:
                "text",
              WebkitTextFillColor:
                "transparent",
              mb: 2,
            }}
          >
            404
          </Typography>

          {/* Heading */}

          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 800,
              mb: 2,
            }}
          >
            Oops! Page Not Found
          </Typography>

          {/* Description */}

          <Typography
            sx={{
              color:
                "rgba(255,255,255,0.72)",
              fontSize: "1rem",
              lineHeight: 1.8,
              maxWidth: "600px",
              mx: "auto",
              mb: 5,
            }}
          >
            The page you are trying to access
            does not exist or may have been
            moved. Let’s get you back to the
            storefront experience.
          </Typography>

          {/* Actions */}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<Home />}
              sx={{
                px: 4,
                py: 1.4,
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                background:
                  "linear-gradient(90deg,#2563eb,#7c3aed)",
                boxShadow:
                  "0 10px 30px rgba(59,130,246,0.35)",

                "&:hover": {
                  background:
                    "linear-gradient(90deg,#1d4ed8,#6d28d9)",
                },
              }}
            >
              Back to Home
            </Button>

            <Button
              onClick={() =>
                window.history.back()
              }
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{
                px: 4,
                py: 1.4,
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#fff",
                borderColor:
                  "rgba(255,255,255,0.2)",

                "&:hover": {
                  borderColor:
                    "rgba(255,255,255,0.4)",
                  background:
                    "rgba(255,255,255,0.05)",
                },
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
