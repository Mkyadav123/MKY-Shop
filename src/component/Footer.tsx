import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";

import type { JSX } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import FavoriteIcon from "@mui/icons-material/Favorite";

import {
  FontAwesomeIcon,
} from "@fortawesome/react-fontawesome";

import {
  faGithub,
  faLinkedin,
  faWhatsapp,
  faFacebook,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import AcceptPayment from "./AcceptPayment";

/* =========================
   TYPES
========================= */

interface SocialLink {
  id: number;
  url: string;
  label: string;
  icon: JSX.Element;
  color: string;
}

/* =========================
   CONSTANTS
========================= */

const phoneNumber: string = "9699654508";

const message: string =
  "Hello, I need assistance!";

const whatsappLink: string =
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

const socialLinks: SocialLink[] = [
  {
    id: 1,
    url: "https://www.linkedin.com/in/mky786",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <FontAwesomeIcon icon={faLinkedin} />
    ),
  },

  {
    id: 2,
    url: "https://x.com/MANOJKU00772742",
    label: "Twitter",
    color: "#ffffff",
    icon: (
      <FontAwesomeIcon icon={faXTwitter} />
    ),
  },

  {
    id: 3,
    url: "https://github.com/Mkyadav123",
    label: "GitHub",
    color: "#ffffff",
    icon: (
      <FontAwesomeIcon icon={faGithub} />
    ),
  },

  {
    id: 4,
    url: "https://www.facebook.com/MKYTechSolutions",
    label: "Facebook",
    color: "#1877F2",
    icon: (
      <FontAwesomeIcon icon={faFacebook} />
    ),
  },

  {
    id: 5,
    url: whatsappLink,
    label: "WhatsApp",
    color: "#25D366",
    icon: (
      <FontAwesomeIcon icon={faWhatsapp} />
    ),
  },

  {
    id: 6,
    url: "https://www.youtube.com/@MKYTechSolution",
    label: "YouTube",
    color: "#FF0000",
    icon: (
      <FontAwesomeIcon icon={faYoutube} />
    ),
  },
];

/* =========================
   COMPONENT
========================= */

export default function Footer(): JSX.Element {
  const [
    recaptchaToken,
    setRecaptchaToken,
  ] = useState<string | null>(null);

  /* =========================
     HANDLERS
  ========================= */

  const handleRecaptchaChange = (
    value: string | null
  ): void => {
    setRecaptchaToken(value);
  };

  /* =========================
     EFFECTS
  ========================= */

  useEffect(() => {
    if (recaptchaToken) {
      console.log(
        "Recaptcha token:",
        recaptchaToken
      );
    }
  }, [recaptchaToken]);

  /* =========================
     RENDER
  ========================= */

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        background:
          "linear-gradient(135deg,#0f172a,#111827)",
        color: "#fff",
        borderTop:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Accept Payment Section */}
      <AcceptPayment />
      <Container
        maxWidth={false}
        sx={{
          px: {
            xs: 3,
            md: 6,
            lg: 8,
          },
          py: {
            xs: 5,
            md: 7,
          },
        }}
      >
        {/* TOP */}
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            justifyContent: "space-between",
            alignItems: {
              xs: "center",
              md: "flex-start",
            },
            gap: 5,
          }}
        >
          {/* LEFT */}
          <Box
            sx={{
              maxWidth: "540px",
              textAlign: {
                xs: "center",
                md: "left",
              },
            }}
          >
            {/* Logo */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: "1px",
                mb: 2,
              }}
            >
              MKY Store
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                color:
                  "rgba(255,255,255,0.72)",
                lineHeight: 1.8,
                fontSize: "1rem",
              }}
            >
              Premium ecommerce experience
              powered by modern technologies - 
              architecture, secure payment
              infrastructure and scalable
              storefront engineering.
            </Typography>
          </Box>

          {/* RIGHT */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: {
                xs: "center",
                md: "flex-end",
              },
              justifyContent: "center",
              gap: 2,
            }}
          >
            {/* Social Icons */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {socialLinks.map(
                (social: SocialLink) => (
                  <IconButton
                    key={social.id}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "16px",
                      background:
                        "rgba(255,255,255,0.06)",
                      color: social.color,
                      backdropFilter:
                        "blur(12px)",
                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      "&:hover": {
                        transform:
                          "translateY(-4px)",
                        background:
                          "rgba(255,255,255,0.12)",
                      },

                      transition:
                        "all 0.25s ease",
                    }}
                  >
                    {social.icon}
                  </IconButton>
                )
              )}
            </Stack>

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

         {/* Bottom */}
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Copyright */}
          <Typography
            sx={{
              color:
                "rgba(255,255,255,0.65)",
              fontSize: "0.95rem",
            }}
          >
            © 2026 Manojkumar Yadav. All Rights
            Reserved.
          </Typography>

          {/* Brand Link */}
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color:
                "rgba(255,255,255,0.75)",
              fontSize: "0.95rem",
            }}
          >
            Built with
            <FavoriteIcon
              sx={{
                color: "#ef4444",
                fontSize: 18,
              }}
            />
            by{" "}
            <a
              href="https://mky.co.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#fff",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              MKY
            </a>
          </Typography>
        </Stack>
      </Container>

      {/* Invisible reCAPTCHA */}
      <ReCAPTCHA
        sitekey="6LdHdrkqAAAAAKLeU9o1MDvElcMX3DLwe1d0vTiA"
        onChange={handleRecaptchaChange}
        size="invisible"
      />
    </Box>
  );
}