import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  TextField,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import DownloadIcon from "@mui/icons-material/Download";

import FilterListIcon from "@mui/icons-material/FilterList";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";

import type {
  Order,
  OrdersPageProps,
} from "../types/cart";

export default function OrdersPage({
  setCart,
}: OrdersPageProps) {

  const navigate = useNavigate();

  const theme = useTheme();

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down("sm")
    );

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<Order | null>(
    null
  );

  const [open, setOpen] =
    useState(false);

  const [statusFilter, setStatusFilter] =
  useState("ALL");

  const [fromDate, setFromDate] =
  useState("");

  const [toDate, setToDate] =
    useState("");

  const [orderIdFilter, setOrderIdFilter] =
  useState("");

  /* =====================================
     FETCH ORDERS
  ===================================== */

  useEffect(() => {

    fetch(
      "/backend/get-orders.php"
    )
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error(
          "Orders Error:",
          err
        );
      });

  }, []);

  /* =====================================
     HANDLE REORDER
  ===================================== */

  const handleReorder = (
    order: Order
  ) => {

    setCart(order.items);

    localStorage.setItem(
      "cart",
      JSON.stringify(order.items)
    );

    window.dispatchEvent(
      new Event("storage")
    );

    navigate("/cart");
  };

  /* =====================================
     HANDLE VIEW ORDER
  ===================================== */

  const handleViewOrder = (
    order: Order
  ) => {

    setSelectedOrder(order);

    setOpen(true);
  };

  const filteredOrders =
  orders.filter((order) => {

    /* STATUS FILTER */

    const statusMatch =
      statusFilter === "ALL"
        ? true
        : (
            order.payment_status ||
            "Complete"
          ) === statusFilter;

    /* DATE FILTER */

    const orderDate =
      new Date(order.created_at);

    const fromMatch =
      fromDate
        ? orderDate >=
          new Date(fromDate)
        : true;

    const toMatch =
      toDate
        ? orderDate <=
          new Date(
            toDate +
            "T23:59:59"
          )
        : true;

    const orderIdMatch =
      order.order_id
        ?.toLowerCase()
        .includes(
          orderIdFilter.toLowerCase()
        );

    return (
      statusMatch &&
      fromMatch &&
      toMatch &&
      orderIdMatch
    );
  });

  const handleExport = () => {

  const headers = [
    "Order ID",
    "Customer",
    "Amount",
    "Payment ID",
    "Status",
    "Date",
  ];

  const rows =
    filteredOrders.map((order) => [
      order.order_id,
      order.customer_name,
      order.amount,
      order.payment_id,
      order.payment_status ||
        "Complete",
      new Date(
        order.created_at
      ).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),

      ...rows.map((e) =>
        e.join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "orders.csv"
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        py: {
          xs: 3,
          md: 6,
        },

        minHeight: "auto",

        bgcolor: "#F8FAFC",
      }}
    >

      <Container maxWidth="xl">

        {/* =====================================
            PAGE TITLE
        ===================================== */}

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,

            mb: 4,

            color: "#0F172A",

            fontSize: {
              xs: "1.8rem",
              md: "2.3rem",
            },
          }}
        >
          My Orders
        </Typography>
        
      {/* FILTER AND EXPORT */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,

            borderRadius: "20px",

            border:
              "1px solid #E2E8F0",

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: {
              xs: "stretch",
              md: "center",
            },

            flexDirection: {
              xs: "column",
              md: "row",
            },

            gap: 2,
          }}
        >

          {/* FILTER */}

          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
            }}
          >

            <FilterListIcon />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >

              <InputLabel>
                Filter Status
              </InputLabel>

              <Select
                value={statusFilter}

                label="Filter Status"

                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <MenuItem value="ALL">
                  All Orders
                </MenuItem>

                <MenuItem value="Complete">
                  Complete
                </MenuItem>

                <MenuItem value="Pending">
                  Pending
                </MenuItem>

              </Select>

            </FormControl>

            <Box
              sx={{
                display: "flex",

                gap: 2,

                flexWrap: "wrap",
              }}
            >

              {/* FROM DATE */}

              <TextField
                label="From Date"

                type="date"

                size="small"

                value={fromDate}

                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }

                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* TO DATE */}

              <TextField
                label="To Date"

                type="date"

                size="small"

                value={toDate}

                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }

                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>

            {/* Order ID */}

            <Box 
              sx={{
                display: "flex",
                
                gap: 2,
                flexWrap: "wrap",
                }}
              >
              <TextField
                label="Search Order ID"

                size="small"

                value={orderIdFilter}

                onChange={(e) =>
                  setOrderIdFilter(
                    e.target.value
                  )
                }

                sx={{
                  minWidth: {
                    xs: "100%",
                    md: 240,
                  },
                }}
              />
            </Box>

          </Stack>

          {/* EXPORT */}

          <Button
            variant="contained"

            startIcon={
              <DownloadIcon />
            }

            onClick={handleExport}
          >
            Export CSV
          </Button>

        </Paper>

        {/* =====================================
            ORDERS TABLE
        ===================================== */}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{

            overflowX: "auto",

            borderRadius: "24px",

            border:
              "1px solid #E2E8F0",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.04)",

            "&::-webkit-scrollbar": {
              height: 6,
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#CBD5E1",
              borderRadius: "20px",
            },
          }}
        >

          <Table
            sx={{
              minWidth: 900,
            }}
          >

            {/* =====================================
                HEADER
            ===================================== */}

            <TableHead>

              <TableRow
                sx={{
                  bgcolor: "#F8FAFC",
                }}
              >

                <TableCell
                  sx={{
                    fontWeight: 800,
                    py: 2.5,
                  }}
                >
                  Order #
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Date
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Ship To
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Order Total
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Status
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Actions
                </TableCell>

              </TableRow>

            </TableHead>

            {/* =====================================
                BODY
            ===================================== */}

            <TableBody>

              {filteredOrders.map(
                (
                  order,
                  index
                ) => (

                  <TableRow
                    key={order.id}
                    sx={{

                      bgcolor:
                        index % 2 === 0
                          ? "#fff"
                          : "#F8FAFC",

                      transition:
                        "0.2s ease",

                      "&:hover": {
                        bgcolor:
                          "#EEF2FF",
                      },
                    }}
                  >

                    {/* ORDER ID */}

                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "#1E293B",

                        minWidth: 220,
                      }}
                    >
                      {
                        order.order_id
                      }
                    </TableCell>

                    {/* DATE */}

                    <TableCell>

                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}

                    </TableCell>

                    {/* CUSTOMER */}

                    <TableCell
                      sx={{
                        textTransform:
                          "uppercase",

                        fontWeight: 700,

                        minWidth: 220,
                      }}
                    >
                      {
                        order.customer_name
                      }
                    </TableCell>

                    {/* TOTAL */}

                    <TableCell
                      sx={{
                        fontWeight: 800,

                        color: "#2563EB",
                      }}
                    >
                      ₹
                      {order.amount}
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>

                      <Chip
                        label={
                          order.payment_status ||
                          "Complete"
                        }

                        color={
                          order.payment_status ===
                          "Pending"
                            ? "warning"
                            : "success"
                        }

                        size="small"

                        sx={{
                          fontWeight: 700,
                        }}
                      />

                    </TableCell>

                    {/* ACTIONS */}

                    <TableCell
                      align="center"
                    >

                      {/* VIEW */}

                      <IconButton
                        onClick={() =>
                          handleViewOrder(order)
                        }

                        sx={{
                          mr: 1,
                        }}
                      >
                        <VisibilityOutlinedIcon />
                      </IconButton>

                      {/* REORDER */}

                      <IconButton
                        onClick={() =>
                          handleReorder(order)
                        }
                      >
                        <ReplayOutlinedIcon />
                      </IconButton>

                    </TableCell>

                  </TableRow>

                )
              )}

            </TableBody>

          </Table>

        </TableContainer>

        {/* =====================================
            FOOTER
        ===================================== */}

        <Typography
          sx={{
            mt: 3,

            color: "#64748B",

            fontWeight: 600,
          }}
        >
          Total Orders:
          {" "}
          {orders.length}
        </Typography>

      </Container>

      {/* =====================================
          ORDER DETAILS MODAL
      ===================================== */}

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}

          sx={{
            "& .MuiDialog-paper": {
              borderRadius: {
                xs: 0,
                md: "24px",
              },
            },
          }}
        >

        {selectedOrder && (

          <>

            {/* =====================================
                HEADER
            ===================================== */}

            <DialogTitle
              sx={{
                px: 4,
                py: 3,

                borderBottom:
                  "1px solid #E2E8F0",

                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center",
              }}
            >

              <Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Order #
                  {
                    selectedOrder.order_id
                  }
                </Typography>

                <Typography
                  sx={{
                    mt: 1,

                    color: "#64748B",
                  }}
                >
                  {new Date(
                    selectedOrder.created_at
                  ).toLocaleDateString()}
                </Typography>

              </Box>

              <IconButton
                onClick={() =>
                  setOpen(false)
                }
              >
                <CloseIcon />
              </IconButton>

            </DialogTitle>

            {/* =====================================
                CONTENT
            ===================================== */}

            <DialogContent
              sx={{
                p: {
                  xs: 2,
                  md: 4,
                },
              }}
            >

              {/* =====================================
                  TOP GRID
              ===================================== */}

              <Grid
                container
                spacing={4}
                sx={{
                  mb: 5,
                }}
              >

                {/* BILLING */}

                <Grid
                  size={{
                  xs: 12,
                  md: 6,
                }}
                >

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius:
                        "20px",
                      height: "100%",
                    }}
                  >

                    <Typography
                      sx={{
                        fontWeight: 800,
                        mb: 2,
                        fontSize:
                          "1.1rem",
                      }}
                    >
                      Billing Address
                    </Typography>

                    <Typography>
                      {
                        selectedOrder.customer_name
                      }
                    </Typography>

                    <Typography>
                      {
                        selectedOrder.email
                      }
                    </Typography>

                    <Typography>
                      {
                        selectedOrder.phone
                      }
                    </Typography>

                    <Typography>
                      {
                        selectedOrder.address
                      }
                    </Typography>

                    <Typography>
                      {
                        selectedOrder.city
                      }
                    </Typography>

                    <Typography>
                      {
                        selectedOrder.pincode
                      }
                    </Typography>

                  </Paper>

                </Grid>

                {/* PAYMENT */}

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius:
                        "20px",
                      height: "100%",
                    }}
                  >

                    <Typography
                      sx={{
                        fontWeight: 800,
                        mb: 2,
                        fontSize:
                          "1.1rem",
                      }}
                    >
                      Payment Information
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748B",
                      }}
                    >
                      Payment ID
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        mb: 3,
                      }}
                    >
                      {
                        selectedOrder.payment_id
                      }
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748B",
                      }}
                    >
                      Order Status
                    </Typography>

                    <Chip
                      label={
                        selectedOrder.payment_status ||
                        "Complete"
                      }

                      color={
                        selectedOrder.payment_status ===
                        "Pending"
                          ? "warning"
                          : "success"
                      }

                      sx={{
                        mt: 1,
                        fontWeight: 700,
                      }}
                    />

                  </Paper>

                </Grid>

              </Grid>

              {/* =====================================
                  ITEMS TITLE
              ===================================== */}

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                }}
              >
                Items Ordered
              </Typography>

              {/* =====================================
                  ITEMS TABLE
              ===================================== */}

              <TableContainer
                component={Paper}
                variant="outlined"

                sx={{

                  overflowX: "auto",

                  borderRadius:
                    "20px",

                  "&::-webkit-scrollbar": {
                    height: 6,
                  },

                  "&::-webkit-scrollbar-thumb": {
                    background:
                      "#CBD5E1",

                    borderRadius:
                      "20px",
                  },
                }}
              >

                <Table
                  sx={{
                    minWidth: 650,
                  }}
                >

                  {/* HEADER */}

                  <TableHead>

                    <TableRow
                      sx={{
                        bgcolor:
                          "#F8FAFC",
                      }}
                    >

                      <TableCell>
                        Product
                      </TableCell>

                      <TableCell>
                        Price
                      </TableCell>

                      <TableCell>
                        Qty
                      </TableCell>

                      <TableCell>
                        Subtotal
                      </TableCell>

                    </TableRow>

                  </TableHead>

                  {/* BODY */}

                  <TableBody>

                    {selectedOrder.items?.map(
                      (
                        item: any
                      ) => (

                        <TableRow
                          key={item.id}
                        >

                          {/* PRODUCT */}

                          <TableCell>

                            <Box
                              sx={{

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap: 2,

                                minWidth:
                                  250,
                              }}
                            >

                              <Box
                                component="img"

                                src={
                                  item.images?.[0]
                                    ?.url
                                }

                                sx={{
                                  width: 60,
                                  height: 60,

                                  objectFit:
                                    "contain",

                                  border:
                                    "1px solid #E2E8F0",

                                  borderRadius:
                                    "12px",

                                  p: 1,
                                }}
                              />

                              <Typography
                                sx={{
                                  fontWeight: 700,
                                }}
                              >
                                {item.name}
                              </Typography>

                            </Box>

                          </TableCell>

                          {/* PRICE */}

                          <TableCell>

                            ₹
                            {
                              item.price.amount
                            }

                          </TableCell>

                          {/* QTY */}

                          <TableCell>

                            {item.qty}

                          </TableCell>

                          {/* SUBTOTAL */}

                          <TableCell>

                            ₹
                            {
                              item.qty *
                              item.price.amount
                            }

                          </TableCell>

                        </TableRow>

                      )
                    )}

                  </TableBody>

                </Table>

              </TableContainer>

              {/* =====================================
                  GRAND TOTAL
              ===================================== */}

              <Box
                sx={{

                  mt: 4,

                  display: "flex",

                  justifyContent:
                    "flex-end",
                }}
              >

                <Paper
                  variant="outlined"

                  sx={{
                    p: 3,

                    borderRadius:
                      "20px",

                    minWidth: 250,
                  }}
                >

                  <Typography
                    sx={{
                      color: "#64748B",
                      mb: 1,
                    }}
                  >
                    Grand Total
                  </Typography>

                  <Typography
                    variant="h5"

                    sx={{
                      fontWeight: 900,

                      color: "#2563EB",
                    }}
                  >
                    ₹
                    {
                      selectedOrder.amount
                    }
                  </Typography>

                </Paper>

              </Box>

            </DialogContent>

            {/* =====================================
                FOOTER
            ===================================== */}

            <DialogActions
              sx={{
                p: 3,

                borderTop:
                  "1px solid #E2E8F0",
              }}
            >

              <Button
                variant="outlined"

                onClick={() =>
                  setOpen(false)
                }
              >
                Close
              </Button>

              <Button
                variant="contained"

                onClick={() =>
                  handleReorder(
                    selectedOrder
                  )
                }
              >
                Reorder
              </Button>

            </DialogActions>

          </>

        )}

      </Dialog>

    </Box>
  );
}