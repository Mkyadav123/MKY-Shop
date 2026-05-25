import {
  useEffect,
  useState,
  type JSX,
  type ChangeEvent,
} from "react";

import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Divider,
  Card,
  CardMedia,
  Stack,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  ArrowBack,
} from "@mui/icons-material";

import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

import {
  motion,
} from "framer-motion";

import { Link as RouterLink } from "react-router-dom";
import {
  useNavigate,
} from "react-router-dom";

import type {
  CartItem,
} from "../types/cart";

/* =========================
   TYPES
========================= */

interface CheckoutPageProps {
  cart: CartItem[];

  setCart: React.Dispatch<
    React.SetStateAction<CartItem[]>
  >;
}

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* =========================
   COMPONENT
========================= */

export default function CheckoutPage({
  cart,
  setCart,
}: CheckoutPageProps): JSX.Element {
  const [form, setForm] =
  useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const total: number = cart.reduce(
    (acc, item) =>
      acc + item.qty * item.price.amount,
    0
  );

  const [
    ,
    setIsPaymentSuccessful,
  ] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !cart ||
      cart.length === 0
    ) {
      navigate(
        "/product",
        {
          replace: true,
        }
      );
    }
  }, [cart, navigate]);

  /* =========================
     HANDLERS
  ========================= */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      /* CLEAR FIELD ERROR */

    if (
      errors[
        name as keyof FormErrors
      ]
    ) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

 /* =========================
   TYPES
========================= */

interface RazorpayResponse {
  razorpay_payment_id: string;
}

interface EmailResponse {
  status: string;
  message?: string;
}

/* =========================
   HANDLER
========================= */

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

const [errors, setErrors] =
  useState<FormErrors>({});

const validate = (): boolean => {
  const newErrors: FormErrors = {};

  /* NAME */

  if (!form.name.trim()) {
    newErrors.name =
      "Name is required";
  }

  /* EMAIL */

  if (!form.email.trim()) {
    newErrors.email =
      "Email is required";
  } else if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
      form.email
    )
  ) {
    newErrors.email =
      "Invalid email address";
  }

  /* PHONE */

  if (!form.phone.trim()) {
    newErrors.phone =
      "Phone number is required";
  } else if (
    !/^[0-9]{10}$/.test(
      form.phone
    )
  ) {
    newErrors.phone =
      "Enter valid 10 digit number";
  }

  /* ADDRESS */

  if (!form.address.trim()) {
    newErrors.address =
      "Address is required";
  }

  /* CITY */

  if (!form.city.trim()) {
    newErrors.city =
      "City is required";
  }

  /* PINCODE */

  if (!form.pincode.trim()) {
    newErrors.pincode =
      "Pincode is required";
  } else if (
    !/^[0-9]{6}$/.test(
      form.pincode
    )
  ) {
    newErrors.pincode =
      "Enter valid pincode";
  }

  setErrors(newErrors);

  return (
    Object.keys(newErrors).length === 0
  );
};

const loadRazorpayScript =
  (): Promise<boolean> => {
    return new Promise(
      (resolve) => {
        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => {
          resolve(true);
        };

        script.onerror = () => {
          resolve(false);
        };

        document.body.appendChild(
          script
        );
      }
    );
  };

// Generates a unique order ID using current date and random string
const generateOrderId =
  (): string => {
  /* DATE */

  const now =
    new Date();

  const year =
    now
      .getFullYear()
      .toString();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const date =
    `${year}${month}${day}`;

  /* RANDOM */

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  /* FINAL */

  return `MKY-${date}-${random}`;
};

const orderId =
  generateOrderId();

const handlePlaceOrder =
  async (): Promise<void> => {
    /* =========================
       VALIDATION
    ========================= */

    if (!validate()) {
      return;
    }

    /* =========================
       RAZORPAY SDK CHECK
    ========================= */

    const razorpayLoaded = await loadRazorpayScript();

    if (!razorpayLoaded) {
      alert(
        "Razorpay SDK failed to load"
      );
      return;
    }

    /* =========================
       RAZORPAY OPTIONS
    ========================= */

    const options = {
      key: "rzp_live_SegYFxOhoLAMON", // Test/Live RAZORPAY KEY

      amount: total * 100,

      currency: "INR",

      name: "MKY Store",

      orderId: orderId,

      description:
        "Secure Order Fulfillment",

      method: {
        upi: true,
      },

      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },

      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay via UPI",

              instruments: [
                {
                  method: "upi",
                },
              ],
            },
          },

          sequence: [
            "block.upi",
          ],

          preferences: {
            show_default_blocks: true,
          },
        },
      },

      notes: {
        address: form.address,
        city: form.city,
        pincode: form.pincode,
      },

      theme: {
        color: "#1a202c",
      },

      /* =========================
         PAYMENT SUCCESS
      ========================= */

      handler: async (
        response: RazorpayResponse
      ): Promise<void> => {
        try {
          /* =========================
             PREVENT REDIRECT LOOP
          ========================= */

          setIsPaymentSuccessful(
            true
          );

          /* =========================
             NAVIGATE SUCCESS
          ========================= */

          navigate(
            "/order-success",
            {
              replace: true,
              state: {
                paymentId:response.razorpay_payment_id,
                amount: total,
                customer: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                city: form.city,
                pincode: form.pincode,
                orderId: orderId,
                items: cart,
              },
            }
          );

           /* =========================
             CLEAR CART
          ========================= */

          setTimeout(() => {
            if (
              typeof setCart ===
              "function"
            ) {
              setCart([]);

              localStorage.removeItem(
                "cart"
              );
            }
          }, 1500);


          /* =========================
              SAVE ORDER
          ========================= */

          try {
            await fetch(
              "/backend/save-order.php",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  ...form,

                  items: cart,

                  total,

                  paymentId:
                    response.razorpay_payment_id,

                  orderId,
                }),
              }
            );
          } catch (error) {
            console.error(
              "Order Save Error:",
              error
            );
          }

          /* =========================
             SEND EMAIL
          ========================= */

          const emailResponse =
            await fetch(
              "/backend/send-email.php",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  ...form,

                  items: cart,

                  total,

                  paymentId:
                    response.razorpay_payment_id,

                  orderId,
                }),
              }
            );

          const rawResponse =
            await emailResponse.text();

          if (!rawResponse) {
            console.warn(
              "Empty backend response"
            );

            return;
          }

          let emailData: EmailResponse;

          try {
            emailData =
              JSON.parse(rawResponse);
          } catch (error) {
            console.error(
              "JSON Parse Error:",
              rawResponse
            );

            return;
          }

          if (
            emailData.status ===
            "success"
          ) {
            setForm({
              name: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              pincode: "",
            });
          } else {
            console.error(
              "Email Error:",
              emailData.message
            );
          }

          /* =========================
             EMAIL SUCCESS
          ========================= */

          if (
            emailData.status ===
            "success"
          ) {
            setForm({
              name: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              pincode: "",
            });
          } else {
            console.error(
              "Email Error:",
              emailData.message
            );
          }
        } catch (error) {
          console.error(
            "Checkout Error:",
            error
          );
        }
      },
    };

    /* =========================
       OPEN RAZORPAY
    ========================= */

    const razorpay =
      new window.Razorpay(
        options
      );

    razorpay.on(
      "payment.failed",
      function (
        response: unknown
      ) {
        console.error(response);
      }
    );

    razorpay.open();
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#0f172a 0%,#111827 35%,#f8fafc 35%)",
        py: {
          xs: 4,
          md: 8,
        },
      }}
    >
      <Container maxWidth="xl">
        {/* TOP */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 6,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#94A3B8",
                fontWeight: 600,
                mb: 1,
              }}
            >
              Secure Checkout
            </Typography>

            <Typography
              variant="h3"
              sx={{
                color: "#fff",
                fontWeight: 800,
              }}
            >
              Complete Your Order
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to="/cart"
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              borderColor:
                "rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "14px",
              px: 3,
              py: 1,
              textTransform: "none",

              '&:hover': {
                borderColor:
                  "rgba(255,255,255,0.35)",
                background:
                  "rgba(255,255,255,0.05)",
              },
            }}
          >
            Back to Cart
          </Button>
        </Box>

        {/* MAIN GRID */}
        <Grid
          container
          spacing={4}
        >
          {/* LEFT SIDE */}
          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <Card
                sx={{
                  borderRadius: "30px",
                  p: {
                    xs: 3,
                    md: 5,
                  },
                  border:
                    "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.15)",
                }}
              >
                <Box
                  sx={{
                    mb: 5,
                    pb: 3,
                    borderBottom:
                      "1px solid rgba(15,23,42,0.06)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#64748B",
                      fontWeight: 700,
                      mb: 1,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Customer Information
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "#0F172A",
                    }}
                  >
                    Personal Details
                  </Typography>
                </Box>

                <Grid
                  container
                  spacing={3}
                >
                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Shipping Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      error={!!errors.city}
                      helperText={errors.city}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      error={!!errors.pincode}
                      helperText={errors.pincode}
                    />
                  </Grid>
                </Grid>
              </Card>
            </motion.div>
          </Grid>

          {/* RIGHT SIDE */}
          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
            >
              <Card
                sx={{
                  borderRadius: "30px",
                  overflow: "hidden",
                  position: "sticky",
                  top: "30px",
                  background:
                    "linear-gradient(135deg,#111827,#1E293B)",
                  color: "#fff",
                  border:
                    "1px solid rgba(255,255,255,0.06)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.2)",
                }}
              >
                {/* HEADER */}
                <Box
                  sx={{
                    p: 4,
                    borderBottom:
                      "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Order Summary
                  </Typography>
                </Box>

                {/* PRODUCTS */}
                <Box
                  sx={{
                    p: 4,
                  }}
                >
                  <Stack spacing={3}>
                    {cart.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={
                            item.images?.[0]
                              ?.url ||
                            "https://dummyimage.com/120x120"
                          }
                          alt={item.name}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "18px",
                            background: "#fff",
                            objectFit: "contain",
                            p: 1,
                          }}
                        />

                        <Box
                          sx={{
                            flex: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              mb: 0.5,
                            }}
                          >
                            {item.name}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                "rgba(255,255,255,0.6)",
                            }}
                          >
                            Qty: {item.qty}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 800,
                          }}
                        >
                          ₹
                          {item.price.amount}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Divider
                    sx={{
                      my: 3,
                      borderColor:
                        "rgba(255,255,255,0.08)",
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          "rgba(255,255,255,0.7)",
                      }}
                    >
                      Sub Total
                    </Typography>

                    <Typography                
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      ₹{total}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          "rgba(255,255,255,0.7)",
                      }}
                    >
                      Delivery
                    </Typography>

                    <Typography                
                      sx={{
                        fontWeight: 800,
                        color: "#00B140",
                      }}
                    >
                      Free
                    </Typography>
                  </Box>

                  <Divider
                    sx={{
                      my: 3,
                      borderColor:
                        "rgba(255,255,255,0.08)",
                    }}
                  />

                  {/* TOTAL */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      mb: 4,
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          "rgba(255,255,255,0.7)",
                      }}
                    >
                      Grand Total
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                      }}
                    >
                      ₹{total}
                    </Typography>
                  </Box>

                  {/* BUTTON */}
                  <Button
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartCheckoutIcon sx={{ fontSize: 18 }} />}
                    onClick={handlePlaceOrder}
                    sx={{
                      py: 2,
                      borderRadius: "18px",
                      background:
                        "linear-gradient(135deg,#2563EB,#4F46E5)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "none",

                      "&:hover": {
                        background:
                          "linear-gradient(135deg,#1D4ED8,#4338CA)",
                      },
                    }}
                  >
                    Place Order
                  </Button>

                  {/* FOOTER TEXT */}
                  <Typography
                    sx={{
                      textAlign: "center",
                      mt: 3,
                      color:
                        "rgba(255,255,255,0.55)",
                      fontSize: "0.92rem",
                    }}
                  >
                    SSL secured checkout powered by Razorpay
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}