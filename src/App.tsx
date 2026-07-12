import {
  useEffect,
  useState,
  lazy,
  Suspense,
  type JSX,
} from "react";

import "./App.css";

import ScrollToTop from "react-scroll-to-top";

import {
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import ProductsListingPage from "./component/ProductsListingPage";
import ProductDetailPage from "./component/ProductDetailPage";
import Header from "./component/Header";
import Footer from "./component/Footer";
import NotFoundPage from "./component/NotFoundPage";
import ScrollToTopPage from "./component/ScrollToTop";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";

import type { CartItem } from "./types/cart";

/* ---- Lazy loaded storefront pages ---- */

const CartPage = lazy(() => import("./component/CartPage"));
const CheckoutPage = lazy(() => import("./component/CheckoutPage"));
const OrderSuccessPage = lazy(() => import("./component/OrderSuccessPage"));

/* ---- Lazy loaded admin pages ---- */

const AdminOrders = lazy(() => import("./admin/pages/AdminOrders"));
const AdminCustomers = lazy(() => import("./admin/pages/AdminCustomers"));
const AdminProducts = lazy(() => import("./admin/pages/AdminProducts"));
const AdminConfig = lazy(() => import("./admin/pages/AdminConfig"));

/* =========================
   STOREFRONT LAYOUT
========================= */

function StorefrontLayout({
  cartCount,
  cart,
  setCart,
}: {
  cartCount: number;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}): JSX.Element {
  return (
    <>
      <Header cartCount={cartCount} />

      <ScrollToTop smooth color="#ff7f50" />
      <ScrollToTopPage />

      <Suspense fallback={<div />}>
        <Outlet context={{ cart, setCart }} />
      </Suspense>

      <Footer />
    </>
  );
}

/* =========================
   APP
========================= */

export default function App(): JSX.Element {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce(
    (total: number, item: CartItem) => total + item.qty,
    0
  );

  return (
    <Routes>
      {/* ==================
          ADMIN ROUTES
      ================== */}

      <Route path="/admin" element={<AdminLogin />} />

      <Route element={<AdminLayout />}>
        <Route
          path="/admin/orders"
          element={
            <Suspense fallback={<div />}>
              <AdminOrders />
            </Suspense>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <Suspense fallback={<div />}>
              <AdminCustomers />
            </Suspense>
          }
        />
        <Route
          path="/admin/products"
          element={
            <Suspense fallback={<div />}>
              <AdminProducts />
            </Suspense>
          }
        />
        <Route
          path="/admin/config"
          element={
            <Suspense fallback={<div />}>
              <AdminConfig />
            </Suspense>
          }
        />
      </Route>

      {/* ==================
          STOREFRONT ROUTES
      ================== */}

      <Route
        element={
          <StorefrontLayout
            cartCount={cartCount}
            cart={cart}
            setCart={setCart}
          />
        }
      >
        <Route
          path="/"
          element={<ProductsListingPage cart={cart} setCart={setCart} />}
        />

        <Route
          path="/products"
          element={<ProductsListingPage cart={cart} setCart={setCart} />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetailPage cart={cart} setCart={setCart} />}
        />

        <Route
          path="/cart"
          element={<CartPage cart={cart} setCart={setCart} />}
        />

        <Route
          path="/checkout"
          element={<CheckoutPage cart={cart} setCart={setCart} />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccessPage />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
