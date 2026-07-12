import {
  useEffect,
  useState,
  useMemo,
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
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  ArrowBack,
  CheckCircle,
  Cancel,
  LocalShipping,
  Warning,
  ErrorOutlined,
  AddShoppingCart,
  MyLocation,
} from "@mui/icons-material";

import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import { motion } from "framer-motion";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import type { CartItem } from "../types/cart";
import type { ShippingCheckResult } from "../types/shipping";
import { checkShippingEligibility } from "../services/shippingApi";

/* =========================  TYPES  ========================= */

interface CheckoutPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

interface RazorpayResponse { razorpay_payment_id: string; }
interface EmailResponse    { status: string; message?: string; }

declare global { interface Window { Razorpay: any; } }

/* =========================  COMPONENT  ========================= */

export default function CheckoutPage({ cart, setCart }: CheckoutPageProps): JSX.Element {
  const [form, setForm] = useState<CheckoutForm>({
    name: "", email: "", phone: "", address: "", city: "", pincode: "",
  });
  const [errors,          setErrors]          = useState<FormErrors>({});
  const [razorpayKeyId,   setRazorpayKeyId]   = useState("");
  const [storeName,       setStoreName]       = useState("MKY Store");
  const [currency,        setCurrency]        = useState("INR");
  const [,                setKeyIdLoading]    = useState(true);
  const [isEnabled,       setIsEnabled]       = useState(false);
  const [snackbarOpen,    setSnackbarOpen]    = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity,setSnackbarSeverity]= useState<"error"|"warning"|"success"|"info">("error");

  /* ── Shipping state ── */
  const [shippingResult,  setShippingResult]  = useState<ShippingCheckResult | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const [, setIsPaymentSuccessful] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.qty * item.price.amount, 0);

  /* ─── Razorpay config ─── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/razorpay-config");
        if (res.ok) {
          const data = await res.json();
          if (data.data?.keyId) {
            setRazorpayKeyId(data.data.keyId);
            setStoreName(data.data.storeName || "MKY Store");
            setCurrency(data.data.currency || "INR");
            setIsEnabled(data.data.isEnabled);
          }
        }
      } catch (e) { console.error("Razorpay config:", e); }
      finally   { setKeyIdLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!cart || cart.length === 0) navigate("/products", { replace: true });
  }, [cart, navigate]);

  /* ─── Shipping auto-check (debounced) ───
     Fires whenever address / city / pincode change.
     Sends city + pincode separately so PHP can use them as fallback
     geocoding candidates when the full street address isn't in Nominatim.
  ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const ready = form.address.trim() && form.city.trim() && form.pincode.trim();
    if (!ready) { setShippingResult(null); return; }

    const timer = setTimeout(async () => {
      const fullAddress =
        `${form.address.trim()}, ${form.city.trim()}, ${form.pincode.trim()}, India`;
      setShippingLoading(true);
      try {
        const result = await checkShippingEligibility({
          deliveryAddress: fullAddress,
          orderAmount:     total,
          city:            form.city.trim(),
          pincode:         form.pincode.trim(),
        });
        setShippingResult(result);
      } catch (err) {
        console.error("Shipping check network error:", err);
        setShippingResult({
          success: false, eligible: false, geocodingError: true,
          distanceKm: null, matchedTier: null, requiredAmount: null,
          geocodedLat: null, geocodedLng: null,
          deliveryAddress: fullAddress,
          message: "Could not reach the delivery check service. Please verify your connection.",
        });
      } finally { setShippingLoading(false); }
    }, 900);

    return () => clearTimeout(timer);
  }, [form.address, form.city, form.pincode, total]);

  /* ─── Form helpers ─── */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim())    errs.name    = "Name is required";
    if (!form.email.trim())   errs.email   = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email))
                              errs.email   = "Invalid email address";
    if (!form.phone.trim())   errs.phone   = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
                              errs.phone   = "Enter valid 10-digit number";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim())    errs.city    = "City is required";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(form.pincode))
                              errs.pincode = "Enter valid 6-digit pincode";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const showSnackbar = (sev: "error"|"warning"|"success"|"info", msg: string) => {
    setSnackbarSeverity(sev); setSnackbarMessage(msg); setSnackbarOpen(true);
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return; }  // already loaded — skip re-injection
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true); s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const generateOrderId = () => {
    const n = new Date();
    const d = n.getFullYear() + String(n.getMonth()+1).padStart(2,"0") + String(n.getDate()).padStart(2,"0");
    return `MKY-${d}-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
  };
  // useMemo with [] ensures the ID is generated once per mount, not on every render
  const orderId = useMemo(() => generateOrderId(), []);

  /* ─── Place Order — gated on shipping check ─── */
  const handlePlaceOrder = async (): Promise<void> => {
    if (!razorpayKeyId) { showSnackbar("error","Razorpay config not loaded. Try again."); return; }
    if (!validate()) return;
    if (!isEnabled)  { showSnackbar("error","Payment module is disabled. Contact the store."); return; }

    /* Run a fresh check on submit so the result is never stale */
    const fullAddress =
      `${form.address.trim()}, ${form.city.trim()}, ${form.pincode.trim()}, India`;
    setShippingLoading(true);

    let freshCheck: ShippingCheckResult;
    try {
      freshCheck = await checkShippingEligibility({
        deliveryAddress: fullAddress,
        orderAmount:     total,
        city:            form.city.trim(),
        pincode:         form.pincode.trim(),
      });
    } catch {
      setShippingLoading(false);
      showSnackbar("error","Could not reach delivery check service. Check your connection.");
      return;
    }
    setShippingResult(freshCheck);
    setShippingLoading(false);

    if (freshCheck.geocodingError) { showSnackbar("warning", freshCheck.message); return; }
    if (!freshCheck.eligible)      { showSnackbar("warning", freshCheck.message); return; }

    /* Proceed to Razorpay */
    const loaded = await loadRazorpayScript();
    if (!loaded) { showSnackbar("error","Razorpay SDK failed to load. Refresh and try again."); return; }

    const options = {
      key: razorpayKeyId, amount: currency, name: storeName, orderId,
      description: "Secure Order Fulfillment",
      method: { upi: true },
      prefill: { name: form.name, email: form.email, contact: form.phone },
      config: {
        display: {
          blocks: { upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] } },
          sequence: ["block.upi"], preferences: { show_default_blocks: true },
        },
      },
      notes: {
        address: form.address, city: form.city, pincode: form.pincode,
        distanceKm: freshCheck.distanceKm, deliveryZone: freshCheck.matchedTier?.label,
      },
      theme: { color: "#1a202c" },
      handler: async (response: RazorpayResponse) => {
        try {
          setIsPaymentSuccessful(true);
          navigate("/order-success", {
            replace: true,
            state: {
              paymentId: response.razorpay_payment_id, amount: total,
              customer: form.name, email: form.email, phone: form.phone,
              address: form.address, city: form.city, pincode: form.pincode,
              orderId, items: cart,
            },
          });
          setTimeout(() => { setCart([]); localStorage.removeItem("cart"); }, 1500);
          try {
            await fetch("/api/save-order", {
              method: "POST", headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ ...form, items: cart, total,
                paymentId: response.razorpay_payment_id, orderId }),
            });
          } catch (e) { console.error("Save order:", e); }
          const emailRes = await fetch("/api/send-email", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, items: cart, total,
              paymentId: response.razorpay_payment_id, orderId }),
          });
          const raw = await emailRes.text();
          if (!raw) return;
          try {
            const d: EmailResponse = JSON.parse(raw);
            if (d.status === "success")
              setForm({ name:"",email:"",phone:"",address:"",city:"",pincode:"" });
          } catch { console.error("Email JSON parse:", raw); }
        } catch (e) { console.error("Checkout error:", e); }
      },
    };
    const rp = new window.Razorpay(options);
    rp.on("payment.failed", (r: unknown) => console.error(r));
    rp.open();
  };

  /* ─── Derived ─── */
  const shortage =
    shippingResult?.matchedTier && !shippingResult.eligible
      ? shippingResult.matchedTier.minOrderAmount - total : 0;

  /* ─── Shipping status badge ─── */
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

    /* Address not found / geocoding error */
    if (shippingResult.geocodingError) return (
      <Box sx={{ mt:1.5, p:2, borderRadius:"14px",
                 background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.3)" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:0.5 }}>
          <ErrorOutlined sx={{ color:"#d97706", fontSize:18 }} />
          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#d97706" }}>
            Address could not be verified
          </Typography>
        </Box>
        <Typography sx={{ fontSize:"0.79rem", color:"#92400e", lineHeight:1.5 }}>
          {shippingResult.message}
        </Typography>
        <Typography sx={{ fontSize:"0.79rem", color:"#92400e", mt:0.5, fontStyle:"italic" }}>
          Order placement is blocked until the address is confirmed.
        </Typography>
      </Box>
    );

    /* Beyond all zones */
    if (!shippingResult.eligible && !shippingResult.matchedTier) return (
      <Box sx={{ mt:1.5, p:2, borderRadius:"14px",
                 background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.25)" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:0.5 }}>
          <Cancel sx={{ color:"#ef4444", fontSize:18 }} />
          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#dc2626" }}>
            Outside delivery range
          </Typography>
          {shippingResult.distanceKm !== null && (
            <Chip icon={<MyLocation sx={{ fontSize:"13px !important" }} />}
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

    /* In range but amount too low */
    if (!shippingResult.eligible && shippingResult.matchedTier) {
      const pct = Math.min((total / shippingResult.matchedTier.minOrderAmount) * 100, 100);
      return (
        <Box sx={{ mt:1.5, borderRadius:"14px", border:"1px solid rgba(234,179,8,0.35)",
                   overflow:"hidden" }}>
          <Box sx={{ display:"flex", alignItems:"center", gap:1, px:2, pt:1.8, pb:1,
                     background:"rgba(234,179,8,0.08)" }}>
            <Warning sx={{ color:"#ca8a04", fontSize:18 }} />
            <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#854d0e" }}>
              Add ₹{shortage.toLocaleString("en-IN")} more to place this order
            </Typography>
            <Chip icon={<MyLocation sx={{ fontSize:"13px !important" }} />}
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
              Your cart: <strong>₹{total.toLocaleString("en-IN")}</strong>
            </Typography>
            <Typography sx={{ fontSize:"0.76rem", color:"#92400e" }}>
              Minimum for this zone:{" "}
              <strong>₹{shippingResult.matchedTier.minOrderAmount.toLocaleString("en-IN")}</strong>
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
          <CheckCircle sx={{ color:"#16a34a", fontSize:18 }} />
          <Typography sx={{ fontSize:"0.84rem", fontWeight:700, color:"#15803d" }}>
            Delivery available ✓
          </Typography>
          <Chip icon={<MyLocation sx={{ fontSize:"13px !important" }} />}
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

  /* ─── Render ─── */
  return (
    <Box sx={{ minHeight:"100vh",
               background:"linear-gradient(180deg,#0f172a 0%,#111827 35%,#f8fafc 35%)",
               py:{ xs:4, md:8 } }}>
      <Container maxWidth="xl">

        {/* TOP BAR */}
        <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                   mb:6, flexWrap:"wrap", gap:2 }}>
          <Box>
            <Typography sx={{ color:"#94A3B8", fontWeight:600, mb:1 }}>Secure Checkout</Typography>
            <Typography variant="h3" sx={{ color:"#fff", fontWeight:800 }}>Complete Your Order</Typography>
          </Box>
          <Button component={RouterLink} to="/cart" startIcon={<ArrowBack />} variant="outlined"
            sx={{ borderColor:"rgba(255,255,255,0.2)", color:"#fff", borderRadius:"14px",
                  px:3, py:1, textTransform:"none",
                  "&:hover":{ borderColor:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.05)" } }}>
            Back to Cart
          </Button>
        </Box>

        <Grid container spacing={4}>

          {/* LEFT — Customer details */}
          <Grid size={{ xs:12, lg:7 }}>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
              <Card sx={{ borderRadius:"30px", p:{ xs:3, md:5 },
                          border:"1px solid rgba(255,255,255,0.06)",
                          boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
                <Box sx={{ mb:5, pb:3, borderBottom:"1px solid rgba(15,23,42,0.06)" }}>
                  <Typography sx={{ color:"#64748B", fontWeight:700, mb:1, letterSpacing:"0.3px" }}>
                    Customer Information
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight:900, color:"#0F172A" }}>
                    Personal Details
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs:12, md:6 }}>
                    <TextField fullWidth label="Full Name" name="name"
                      value={form.name} onChange={handleChange}
                      error={!!errors.name} helperText={errors.name} />
                  </Grid>
                  <Grid size={{ xs:12, md:6 }}>
                    <TextField fullWidth label="Email Address" name="email"
                      value={form.email} onChange={handleChange}
                      error={!!errors.email} helperText={errors.email} />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Phone Number" name="phone"
                      value={form.phone} onChange={handleChange}
                      error={!!errors.phone} helperText={errors.phone} />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Shipping Address" name="address"
                      value={form.address} onChange={handleChange}
                      error={!!errors.address} helperText={errors.address} />
                  </Grid>
                  <Grid size={{ xs:12, md:6 }}>
                    <TextField fullWidth label="City" name="city"
                      value={form.city} onChange={handleChange}
                      error={!!errors.city} helperText={errors.city} />
                  </Grid>
                  <Grid size={{ xs:12, md:6 }}>
                    <TextField fullWidth label="Pincode" name="pincode"
                      value={form.pincode} onChange={handleChange}
                      error={!!errors.pincode} helperText={errors.pincode} />
                  </Grid>

                  {/* SHIPPING STATUS BADGE */}
                  <Grid size={12}><ShippingStatusBadge /></Grid>
                </Grid>
              </Card>
            </motion.div>
          </Grid>

          {/* RIGHT — Order Summary */}
          <Grid size={{ xs:12, lg:5 }}>
            <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}>
              <Card sx={{ borderRadius:"30px", overflow:"hidden", position:"sticky", top:"30px",
                          background:"linear-gradient(135deg,#111827,#1E293B)", color:"#fff",
                          border:"1px solid rgba(255,255,255,0.06)",
                          boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>

                <Box sx={{ p:4, borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  <Typography variant="h5" sx={{ fontWeight:800 }}>Order Summary</Typography>
                </Box>

                <Box sx={{ p:4 }}>
                  <Stack spacing={3}>
                    {cart.map(item => (
                      <Box key={item.id} sx={{ display:"flex", gap:2, alignItems:"center" }}>
                        <CardMedia component="img"
                          image={item.images?.[0]?.url || "https://dummyimage.com/120x120"}
                          alt={item.name}
                          sx={{ width:80, height:80, borderRadius:"18px", background:"#fff",
                                objectFit:"contain", p:1 }} />
                        <Box sx={{ flex:1 }}>
                          <Typography sx={{ fontWeight:700, mb:0.5 }}>{item.name}</Typography>
                          <Typography sx={{ color:"rgba(255,255,255,0.6)" }}>Qty: {item.qty}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight:800 }}>₹{item.price.amount}</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my:3, borderColor:"rgba(255,255,255,0.08)" }} />

                  {/* Sub Total */}
                  <Box sx={{ display:"flex", justifyContent:"space-between", mb:1.5 }}>
                    <Typography sx={{ color:"rgba(255,255,255,0.7)" }}>Sub Total</Typography>
                    <Typography sx={{ fontWeight:800 }}>₹{total.toLocaleString("en-IN")}</Typography>
                  </Box>

                  {/* Delivery row */}
                  <Box sx={{ display:"flex", justifyContent:"space-between", alignItems:"center", mb:1 }}>
                    <Typography sx={{ color:"rgba(255,255,255,0.7)" }}>Delivery</Typography>
                    {shippingLoading ? (
                      <CircularProgress size={14} sx={{ color:"#94a3b8" }} />
                    ) : shippingResult ? (
                      shippingResult.eligible ? (
                        <Chip icon={<LocalShipping sx={{ fontSize:"14px !important" }} />}
                              label="Available — Free" size="small"
                              sx={{ bgcolor:"rgba(22,163,74,0.2)", color:"#4ade80",
                                    fontWeight:700, fontSize:"0.74rem" }} />
                      ) : (
                        <Chip icon={<Cancel sx={{ fontSize:"14px !important" }} />}
                              label={shippingResult.geocodingError ? "Address error" : "Not available"}
                              size="small"
                              sx={{ bgcolor:"rgba(239,68,68,0.2)", color:"#f87171",
                                    fontWeight:700, fontSize:"0.74rem" }} />
                      )
                    ) : (
                      <Typography sx={{ fontWeight:800, color:"#4ade80" }}>Free</Typography>
                    )}
                  </Box>

                  {/* Zone details panel */}
                  {shippingResult && shippingResult.distanceKm !== null && (
                    <Box sx={{ mt:1.5, p:1.5, borderRadius:"10px",
                               background:"rgba(255,255,255,0.05)",
                               border:"1px solid rgba(255,255,255,0.08)" }}>
                      <Typography sx={{ fontSize:"0.77rem", color:"rgba(255,255,255,0.6)" }}>
                        Distance from store:{" "}
                        <strong style={{ color:"#e2e8f0" }}>{shippingResult.distanceKm} km</strong>
                      </Typography>
                      {shippingResult.matchedTier && (<>
                        <Typography sx={{ fontSize:"0.77rem", color:"rgba(255,255,255,0.6)", mt:0.3 }}>
                          Zone:{" "}
                          <strong style={{ color:"#e2e8f0" }}>{shippingResult.matchedTier.label}</strong>
                        </Typography>
                        <Typography sx={{ fontSize:"0.77rem", color:"rgba(255,255,255,0.6)", mt:0.3 }}>
                          Min order:{" "}
                          <strong style={{ color:"#e2e8f0" }}>
                            ₹{shippingResult.matchedTier.minOrderAmount.toLocaleString("en-IN")}
                          </strong>
                        </Typography>
                      </>)}
                      {/* "Add more" nudge inside the summary panel */}
                      {!shippingResult.eligible && shippingResult.matchedTier && (
                        <Box sx={{ mt:1, p:1, borderRadius:"8px",
                                   background:"rgba(234,179,8,0.15)",
                                   border:"1px solid rgba(234,179,8,0.2)",
                                   display:"flex", alignItems:"center", gap:1 }}>
                          <AddShoppingCart sx={{ color:"#fbbf24", fontSize:15 }} />
                          <Typography sx={{ fontSize:"0.76rem", color:"#fbbf24", fontWeight:700 }}>
                            Add ₹{shortage.toLocaleString("en-IN")} more to qualify
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my:3, borderColor:"rgba(255,255,255,0.08)" }} />

                  {/* Grand Total */}
                  <Box sx={{ display:"flex", justifyContent:"space-between",
                             alignItems:"center", mb:4 }}>
                    <Typography sx={{ color:"rgba(255,255,255,0.7)" }}>Grand Total</Typography>
                    <Typography variant="h4" sx={{ fontWeight:900 }}>
                      ₹{total.toLocaleString("en-IN")}
                    </Typography>
                  </Box>

                  {/* PLACE ORDER BUTTON */}
                  <Button fullWidth size="large"
                    startIcon={shippingLoading
                      ? <CircularProgress size={18} sx={{ color:"#fff" }} />
                      : <ShoppingCartCheckoutIcon sx={{ fontSize:18 }} />}
                    onClick={handlePlaceOrder}
                    disabled={shippingLoading}
                    sx={{
                      py:2, borderRadius:"18px", fontWeight:800, fontSize:"1rem",
                      textTransform:"none", transition:"all 0.2s", color:"#fff",
                      background: shippingResult && !shippingResult.eligible
                        ? "linear-gradient(135deg,#4b5563,#374151)"
                        : "linear-gradient(135deg,#2563EB,#4F46E5)",
                      "&:hover": {
                        background: shippingResult && !shippingResult.eligible
                          ? "linear-gradient(135deg,#374151,#1f2937)"
                          : "linear-gradient(135deg,#1D4ED8,#4338CA)",
                        transform: shippingResult && !shippingResult.eligible ? "none" : "translateY(-1px)",
                      },
                      "&.Mui-disabled": { color:"rgba(255,255,255,0.4)" },
                    }}>
                    {shippingLoading
                      ? "Checking delivery…"
                      : shippingResult && !shippingResult.eligible
                        ? shippingResult.geocodingError
                          ? "Address unverified — fix above"
                          : shortage > 0
                            ? `Add ₹${shortage.toLocaleString("en-IN")} more to order`
                            : "Delivery not available"
                        : "Place Order"}
                  </Button>

                  <Typography sx={{ textAlign:"center", mt:3,
                                    color:"rgba(255,255,255,0.45)", fontSize:"0.85rem" }}>
                    SSL secured checkout powered by Razorpay
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <Snackbar open={snackbarOpen} autoHideDuration={7000}
                  onClose={() => setSnackbarOpen(false)}
                  anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
          <Alert severity={snackbarSeverity} variant="filled"
                 onClose={() => setSnackbarOpen(false)}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
