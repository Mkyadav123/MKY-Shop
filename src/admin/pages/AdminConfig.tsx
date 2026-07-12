import { useState, useEffect, useCallback } from "react";
import type { JSX } from "react";
import {
  Box, Card, CardContent, CardHeader, TextField, Button, Stack,
  Typography, Switch, FormControlLabel, Alert, CircularProgress,
  Divider, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, Chip, InputAdornment,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StoreIcon from "@mui/icons-material/Store";
import type { RazorpayConfig, RazorpayConfigRequest } from "../../types/razorpayConfig";
import type { DatabaseConfig, DatabaseConfigRequest } from "../../types/databaseConfig";
import type { ShippingTier, StoreConfig } from "../../types/shipping";
import { fetchShippingConfig, saveShippingConfig } from "../../services/shippingApi";

interface TierRow extends Omit<ShippingTier, "id"> { id: number | null; }

export default function AdminConfig(): JSX.Element {

  /* ── Razorpay ── */
  const [config, setConfig] = useState<RazorpayConfig>({
    keyId:"", keySecret:"", isEnabled:false, webhookSecret:"",
    storeName:"MKY Store", currency:"INR",
  });

  /* ── Database ── */
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    dbHost:"localhost", dbPort:3306, dbUser:"root",
    dbPassword:"", dbName:"mky_store", dbCharset:"utf8mb4",
  });

  /* ── Shipping ── */
  const [storeConfig,    setStoreConfig]    = useState<StoreConfig>({
    id:1, storeName:"MKY Store",
    address:"Building 52, Shop No-1/2, Phase II, Vrindavan Society, Thane West, Thane, Maharashtra 400601",
    lat:19.2183, lng:72.9781, updatedAt: new Date().toISOString(),
  });
  const [tiers,          setTiers]          = useState<TierRow[]>([]);
  const [shippingLoading,setShippingLoading]= useState(false);
  const [shippingSaved,  setShippingSaved]  = useState(false);
  const [shippingError,  setShippingError]  = useState("");

  /* ── UI ── */
  const [loading,        setLoading]        = useState(false);
  const [dbLoading,      setDbLoading]      = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [dbSaved,        setDbSaved]        = useState(false);
  const [error,          setError]          = useState("");
  const [dbError,        setDbError]        = useState("");
  const [showSecret,     setShowSecret]     = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);

  useEffect(() => { fetchConfig(); fetchDbConfig(); loadShippingConfig(); }, []);

  /* ── Loaders ── */
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res  = await fetch("/api/admin/razorpay-config", { credentials:"include" });
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      if (data.data) setConfig(data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchDbConfig = async () => {
    try {
      setDbLoading(true);
      const res  = await fetch("/api/admin/database-config", { credentials:"include" });
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      if (data.data) setDbConfig(data.data);
    } catch (e) { console.error(e); } finally { setDbLoading(false); }
  };

  const loadShippingConfig = useCallback(async () => {
    try {
      setShippingLoading(true); setShippingError("");
      const data = await fetchShippingConfig();
      setStoreConfig(data.storeConfig);
      setTiers(data.tiers.map(t => ({ ...t })));
    } catch (e) {
      setShippingError("Failed to load shipping config: " + (e instanceof Error ? e.message : String(e)));
    } finally { setShippingLoading(false); }
  }, []);

  /* ── Savers ── */
  const handleSaveConfig = async () => {
    if (!config.keyId) { setError("API Key ID is required"); return; }
    try {
      setLoading(true); setError("");
      const payload: RazorpayConfigRequest = {
        keyId: config.keyId, keySecret: config.keySecret, isEnabled: config.isEnabled,
        webhookSecret: config.webhookSecret, storeName: config.storeName, currency: config.currency,
      };
      const res  = await fetch("/api/admin/razorpay-config", {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify(payload),
      });
      const text = await res.text();
      let d: any;
      try { d = JSON.parse(text); } catch { throw new Error(`Invalid JSON. Status: ${res.status}`); }
      if (res.ok && d.success) { setSaved(true); setTimeout(()=>setSaved(false),3000); }
      else setError(d.message || "Failed to save");
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const handleSaveDbConfig = async () => {
    if (!dbConfig.dbHost || !dbConfig.dbUser || !dbConfig.dbName) {
      setDbError("Host, User and Name are required"); return;
    }
    try {
      setDbLoading(true); setDbError("");
      const payload: DatabaseConfigRequest = { ...dbConfig };
      const res  = await fetch("/api/admin/database-config", {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify(payload),
      });
      const text = await res.text();
      let d: any;
      try { d = JSON.parse(text); } catch { throw new Error(`Invalid JSON. Status: ${res.status}`); }
      if (res.ok && d.success) { setDbSaved(true); setTimeout(()=>setDbSaved(false),3000); }
      else setDbError(d.message || "Failed to save");
    } catch (e) { setDbError(e instanceof Error ? e.message : String(e)); }
    finally { setDbLoading(false); }
  };

  /* ── Tier helpers ── */
  const handleTierChange = (idx: number, field: keyof Omit<TierRow,"id">, value: string|number|boolean) =>
    setTiers(prev => prev.map((t,i) => i===idx ? {...t,[field]:value} : t));

  const addTier = () => {
    const maxSort = tiers.reduce((m,t) => Math.max(m,t.sortOrder),0);
    const last    = tiers[tiers.length-1];
    setTiers(prev => [...prev, {
      id:null, minKm: last ? last.maxKm : 0, maxKm: last ? last.maxKm+5 : 5,
      minOrderAmount:0, label:"New Zone", isEnabled:true, sortOrder:maxSort+1,
    }]);
  };
  const removeTier = (idx: number) => setTiers(prev => prev.filter((_,i)=>i!==idx));

  const handleSaveShipping = async () => {
    for (let i=0; i<tiers.length; i++) {
      const t = tiers[i];
      if (t.minKm >= t.maxKm)      { setShippingError(`Row ${i+1}: Min km must be less than max km`); return; }
      if (t.minOrderAmount < 0)    { setShippingError(`Row ${i+1}: Min order must be ≥ 0`); return; }
      if (!t.label.trim())         { setShippingError(`Row ${i+1}: Label is required`); return; }
    }
    try {
      setShippingLoading(true); setShippingError("");
      await saveShippingConfig({
        storeConfig: { ...storeConfig, lat: Number(storeConfig.lat), lng: Number(storeConfig.lng) },
        tiers: tiers.map((t,idx) => ({
          ...t, id: t.id ?? 0, sortOrder: idx+1,
          minKm: Number(t.minKm), maxKm: Number(t.maxKm), minOrderAmount: Number(t.minOrderAmount),
        })),
      });
      setShippingSaved(true); setTimeout(()=>setShippingSaved(false),3000);
      await loadShippingConfig();
    } catch (e) {
      setShippingError("Failed to save: " + (e instanceof Error ? e.message : String(e)));
    } finally { setShippingLoading(false); }
  };

  /* ── Render ── */
  return (
    <Box sx={{ p:3 }}>
      <Typography variant="h4" sx={{ mb:3, fontWeight:"bold" }}>Configuration</Typography>

      <Stack spacing={3}>

        {/* ── 1. Razorpay ── */}
        <Card>
          <CardHeader title="Razorpay Credentials"
            subheader="Configure your Razorpay API credentials for payment processing"
            sx={{ backgroundColor:"#F5F5F5", borderBottom:"1px solid #E0E0E0" }} />
          <CardContent>
            <Stack spacing={3}>
              {error && <Alert severity="error" onClose={()=>setError("")}>{error}</Alert>}
              <FormControlLabel
                control={<Switch checked={config.isEnabled} disabled={loading}
                  onChange={e=>setConfig({...config,isEnabled:e.target.checked})} />}
                label={config.isEnabled ? "Razorpay Enabled" : "Razorpay Disabled"} />
              <Divider />
              <TextField fullWidth label="Razorpay Key ID" value={config.keyId} required
                disabled={loading} helperText="Your public key for Razorpay API"
                onChange={e=>setConfig({...config,keyId:e.target.value})} />
              <TextField fullWidth label="Razorpay Key Secret" disabled={loading}
                type={showSecret?"text":"password"} value={config.keySecret}
                helperText="Your secret key — keep this secure!"
                onChange={e=>setConfig({...config,keySecret:e.target.value})}
                onMouseEnter={()=>setShowSecret(true)} onMouseLeave={()=>setShowSecret(false)} />
              <TextField fullWidth label="Webhook Secret (Optional)" type="password"
                value={config.webhookSecret||""} disabled={loading}
                onChange={e=>setConfig({...config,webhookSecret:e.target.value})} />
              <TextField fullWidth label="Store Name" value={config.storeName||""} disabled={loading}
                helperText="Name displayed in Razorpay payment modal"
                onChange={e=>setConfig({...config,storeName:e.target.value})} />
              <TextField fullWidth label="Currency" value={config.currency||"INR"} disabled={loading}
                helperText="Currency code (default: INR)"
                onChange={e=>setConfig({...config,currency:e.target.value})} />
              <Divider />
              <Typography variant="body2" color="textSecondary" sx={{ display:"flex", gap:1 }}>
                <WarningAmberIcon fontSize="small" />
                Keep your Key Secret safe. Never share it publicly.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ justifyContent:"flex-end"}}>
                <Button variant="outlined" disabled={loading} onClick={fetchConfig}>Reset</Button>
                <Button variant="contained" startIcon={<SaveOutlinedIcon />}
                  disabled={loading} onClick={handleSaveConfig}
                  sx={{ backgroundColor:"#1976D2","&:hover":{backgroundColor:"#1565C0"} }}>
                  {loading ? <CircularProgress size={24} /> : "Save Configuration"}
                </Button>
              </Stack>
              {saved && <Alert severity="success">Razorpay configuration updated!</Alert>}
            </Stack>
          </CardContent>
        </Card>

        {/* ── 2. Database ── */}
        <Card>
          <CardHeader title="Database Configuration"
            subheader="Configure your database connection settings"
            sx={{ backgroundColor:"#F5F5F5", borderBottom:"1px solid #E0E0E0" }} />
          <CardContent>
            <Stack spacing={3}>
              {dbError && <Alert severity="error" onClose={()=>setDbError("")}>{dbError}</Alert>}
              <TextField fullWidth label="Database Host" required value={dbConfig.dbHost}
                disabled={dbLoading} onChange={e=>setDbConfig({...dbConfig,dbHost:e.target.value})} />
              <TextField fullWidth type="number" label="Database Port" value={dbConfig.dbPort}
                disabled={dbLoading}
                onChange={e=>setDbConfig({...dbConfig,dbPort:parseInt(e.target.value)||3306})} />
              <TextField fullWidth label="Database User" required value={dbConfig.dbUser}
                disabled={dbLoading} onChange={e=>setDbConfig({...dbConfig,dbUser:e.target.value})} />
              <TextField fullWidth label="Database Password" disabled={dbLoading}
                type={showDbPassword?"text":"password"} value={dbConfig.dbPassword}
                onChange={e=>setDbConfig({...dbConfig,dbPassword:e.target.value})}
                onMouseEnter={()=>setShowDbPassword(true)} onMouseLeave={()=>setShowDbPassword(false)} />
              <TextField fullWidth label="Database Name" required value={dbConfig.dbName}
                disabled={dbLoading} onChange={e=>setDbConfig({...dbConfig,dbName:e.target.value})} />
              <TextField fullWidth label="Database Charset" value={dbConfig.dbCharset||"utf8mb4"}
                disabled={dbLoading} onChange={e=>setDbConfig({...dbConfig,dbCharset:e.target.value})} />
              <Divider />
              <Stack direction="row" spacing={2} sx={{ justifyContent:"flex-end"}}>
                <Button variant="outlined" disabled={dbLoading} onClick={fetchDbConfig}>Reset</Button>
                <Button variant="contained" startIcon={<SaveOutlinedIcon />}
                  disabled={dbLoading} onClick={handleSaveDbConfig}
                  sx={{ backgroundColor:"#1976D2","&:hover":{backgroundColor:"#1565C0"} }}>
                  {dbLoading ? <CircularProgress size={24} /> : "Save Database Config"}
                </Button>
              </Stack>
              {dbSaved && <Alert severity="success">Database configuration saved!</Alert>}
            </Stack>
          </CardContent>
        </Card>

        {/* ── 3. Shipping / Delivery Zones ── */}
        <Card>
          <CardHeader avatar={<LocalShippingIcon sx={{ color:"#1976D2" }} />}
            title="Delivery Zone Configuration"
            subheader="Set minimum order amounts for each distance zone from your store"
            sx={{ backgroundColor:"#F5F5F5", borderBottom:"1px solid #E0E0E0" }} />
          <CardContent>
            <Stack spacing={3}>
              {shippingError && (
                <Alert severity="error" onClose={()=>setShippingError("")}>{shippingError}</Alert>
              )}

              {/* Store Location */}
              <Box>
                <Box sx={{ display:"flex", alignItems:"center", gap:1, mb:2 }}>
                  <StoreIcon sx={{ color:"#64748b", fontSize:20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight:700, color:"#1e293b"}}>
                    Store Location
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <TextField fullWidth label="Store Name" value={storeConfig.storeName}
                    disabled={shippingLoading} helperText="Name shown to customers in delivery messages"
                    onChange={e=>setStoreConfig({...storeConfig,storeName:e.target.value})} />
                  <TextField fullWidth label="Store Address" value={storeConfig.address}
                    disabled={shippingLoading} multiline rows={2}
                    helperText="Full address — used as reference for distance calculations"
                    onChange={e=>setStoreConfig({...storeConfig,address:e.target.value})} />
                  <Box sx={{ display:"flex", gap:2 }}>
                    <TextField fullWidth label="Latitude" type="number" value={storeConfig.lat}
                      disabled={shippingLoading} helperText="e.g. 19.2183"
                      slotProps={{ htmlInput: { step: "0.0001", },}}
                      onChange={e=>setStoreConfig({...storeConfig,lat:parseFloat(e.target.value)||0})} />
                    <TextField fullWidth label="Longitude" type="number" value={storeConfig.lng}
                      disabled={shippingLoading} helperText="e.g. 72.9781"
                      slotProps={{ htmlInput: { step: "0.0001", },}}
                      onChange={e=>setStoreConfig({...storeConfig,lng:parseFloat(e.target.value)||0})} />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Tip: Find exact coordinates on{" "}
                    <a href={`https://maps.google.com/?q=${storeConfig.lat},${storeConfig.lng}`}
                       target="_blank" rel="noreferrer" style={{ color:"#1976D2" }}>
                      Google Maps
                    </a>{" "}→ right-click your store → "What's here?"
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              {/* Delivery Tiers */}
              <Box>
                <Box sx={{ display:"flex", alignItems:"center", justifyContent:"space-between", mb:2 }}>
                  <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                    <LocalShippingIcon sx={{ color:"#64748b", fontSize:20 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight:700, color:"#1e293b"}}>
                      Delivery Zones
                    </Typography>
                    <Chip label={`${tiers.length} zones`} size="small" sx={{ ml:1 }} />
                  </Box>
                  <Button startIcon={<AddCircleOutlinedIcon />} size="small" variant="outlined"
                    disabled={shippingLoading} onClick={addTier}
                    sx={{ textTransform:"none" }}>
                    Add Zone
                  </Button>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb:2 }}>
                  Orders are only accepted if the customer's distance falls within a zone{" "}
                  <strong>and</strong> the cart total meets or exceeds that zone's minimum.
                </Typography>

                {shippingLoading && tiers.length === 0 ? (
                  <Box sx={{ display:"flex", justifyContent:"center", py:4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius:"12px" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor:"#f8fafc" }}>
                          <TableCell sx={{ fontWeight:700, minWidth:90 }}>Min km</TableCell>
                          <TableCell sx={{ fontWeight:700, minWidth:90 }}>Max km</TableCell>
                          <TableCell sx={{ fontWeight:700, minWidth:140 }}>Min Order (₹)</TableCell>
                          <TableCell sx={{ fontWeight:700, minWidth:140 }}>Label</TableCell>
                          <TableCell sx={{ fontWeight:700, width:80 }} align="center">Active</TableCell>
                          <TableCell sx={{ fontWeight:700, width:60 }} align="center">Del</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tiers.map((tier,idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={tier.minKm}
                                onChange={(e) =>
                                  handleTierChange(
                                    idx,
                                    "minKm",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                disabled={shippingLoading}
                                sx={{ width: 90 }}
                                slotProps={{
                                  htmlInput: {
                                    min: 0,
                                    step: 0.5,
                                  },
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        km
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={tier.maxKm}
                                onChange={(e) =>
                                  handleTierChange(
                                    idx,
                                    "maxKm",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                disabled={shippingLoading}
                                sx={{ width: 90 }}
                                slotProps={{
                                  htmlInput: {
                                    min: 0,
                                    step: 0.5,
                                  },
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        km
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={tier.minOrderAmount}
                                onChange={(e) =>
                                  handleTierChange(
                                    idx,
                                    "minOrderAmount",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                disabled={shippingLoading}
                                sx={{ width: 130 }}
                                slotProps={{
                                  htmlInput: {
                                    min: 0,
                                    step: 1,
                                  },
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        ₹
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField size="small" value={tier.label}
                                disabled={shippingLoading} sx={{ width:130 }}
                                onChange={e=>handleTierChange(idx,"label",e.target.value)} />
                            </TableCell>
                            <TableCell align="center">
                              <Switch size="small" checked={tier.isEnabled} color="success"
                                disabled={shippingLoading}
                                onChange={e=>handleTierChange(idx,"isEnabled",e.target.checked)} />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Remove zone">
                                <IconButton size="small" color="error"
                                  disabled={shippingLoading} onClick={()=>removeTier(idx)}>
                                  <DeleteOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                        {tiers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py:4, color:"#94a3b8" }}>
                              No zones configured. Click "Add Zone" to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              <Divider />

              <Box sx={{ p:2, bgcolor:"#fff8e1", borderRadius:"10px", border:"1px solid #ffe082" }}>
                <Typography variant="body2" color="#7c5e00"
                  sx={{ display:"flex", gap:1, alignItems:"flex-start" }}>
                  <WarningAmberIcon fontSize="small" sx={{ flexShrink:0, mt:"1px" }} />
                  Orders outside all zones are automatically rejected at checkout. Customers see a clear
                  message showing the minimum order needed for their area.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ justifyContent:"flex-end"}}>
                <Button variant="outlined" disabled={shippingLoading} onClick={loadShippingConfig}>
                  Reset
                </Button>
                <Button variant="contained" disabled={shippingLoading} onClick={handleSaveShipping}
                  startIcon={shippingLoading
                    ? <CircularProgress size={18} color="inherit" />
                    : <SaveOutlinedIcon />}
                  sx={{ backgroundColor:"#1976D2","&:hover":{backgroundColor:"#1565C0"} }}>
                  Save Delivery Zones
                </Button>
              </Stack>

              {shippingSaved && <Alert severity="success">Delivery zones saved successfully!</Alert>}
            </Stack>
          </CardContent>
        </Card>

      </Stack>
    </Box>
  );
}
