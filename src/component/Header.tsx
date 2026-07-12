import type { JSX } from "react";

import {
  Link as RouterLink,
} from "react-router-dom";

import {
  Box,
  Typography,
  Badge,
  IconButton,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

/* =========================
   TYPES
========================= */

interface HeaderProps {
  cartCount: number;
}

/* =========================
   COMPONENT
========================= */

export default function Header({
  cartCount,
}: HeaderProps): JSX.Element {
  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        background: "#000",
        borderBottom:
          "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: {
            xs: 2,
            md: 4,
          },
          py: 2,
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1fr",
          alignItems: "center",
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "flex-start",
            alignItems: "center",
          }}
        >
          <RouterLink
            to="/"
            style={{
              color: "#fff",
              textDecoration:
                "none",
              fontWeight: 800,
              fontSize: "2rem",
              letterSpacing: "1px",
            }}
          >
            MKY
          </RouterLink>
        </Box>

        {/* CENTER */}
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
          }}
        >
          <RouterLink
            to="/products"
            style={{
              color: "#fff",
              textDecoration:
                "none",
              fontWeight: 600,
              fontSize: "1.05rem",
              opacity: 0.92,
            }}
          >
            Products
          </RouterLink>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "flex-end",
            alignItems: "center",
          }}
        >
          <IconButton
            component={
              RouterLink
            }
            to="/cart"
            sx={{
              background:
                "#fff",
              borderRadius:
                "14px",
              px: 2,
              py: 1,
              gap: 1,

              "&:hover": {
                background:
                  "#f4f4f4",
              },
            }}
          >
            <Badge
              badgeContent={
                cartCount
              }
              color="error"
            >
              <ShoppingCartIcon
                sx={{
                  color:
                    "#111",
                  fontSize: 24,
                }}
              />
            </Badge>

            <Typography
              sx={{
                color:
                  "#111",
                fontWeight: 700,
                fontSize:
                  "0.95rem",
              }}
            >
              Cart
            </Typography>
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}