import {
  useEffect,
  useState,
  type JSX,
} from "react";

import "./App.css";

import ScrollToTop from "react-scroll-to-top";

import {
  Routes,
  Route,
} from "react-router-dom";

import ProductListPage from "./component/ProductListPage";

import Header from "./component/Header";

import Footer from "./component/Footer";

import {
  lazy,
  Suspense,
} from "react";

const CartPage = lazy(
  () =>
    import(
      "./component/CartPage"
    )
);

const CheckoutPage = lazy(
  () =>
    import(
      "./component/CheckoutPage"
    )
);

const OrderSuccessPage =
  lazy(
    () =>
      import(
        "./component/OrderSuccessPage"
      )
  );

import NotFoundPage from "./component/NotFoundPage";

import type {
  CartItem,
} from "./types/cart";

import ScrollToTopPage from "./component/ScrollToTop";
import OrdersPage from "./component/OrdersPage";

/* =========================
   COMPONENT
========================= */

export default function App(): JSX.Element {
  /* =========================
     STATE
  ========================= */

  const [cart, setCart] =
    useState<CartItem[]>(() => {
      const savedCart =
        localStorage.getItem(
          "cart"
        );

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    });

  /* =========================
     LOCAL STORAGE
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  /* =========================
     TOTAL CART COUNT
  ========================= */

  const cartCount =
    cart.reduce(
      (
        total: number,
        item: CartItem
      ) =>
        total + item.qty,
      0
    );

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      {/* HEADER */}

      <Header
        cartCount={cartCount}
      />

      {/* SCROLL */}

      <ScrollToTop
        smooth
        color="#ff7f50"
      />

      <ScrollToTopPage />

      {/* ROUTES */}
      <Suspense fallback={<div />}>
        <Routes>
          {/* HOME */}

          <Route
            path="/"
            element={
              <ProductListPage
                cart={cart}
                setCart={setCart}
              />
            }
          />

          {/* PRODUCT */}

          <Route
            path="/product"
            element={
              <ProductListPage
                cart={cart}
                setCart={setCart}
              />
            }
          />

          {/* CART */}

          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                setCart={setCart}
              />
            }
          />

          {/* CHECKOUT */}

          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cart={cart}
                setCart={setCart}
              />
            }
          />

          {/* SUCCESS */}

          <Route
            path="/order-success"
            element={
              <OrderSuccessPage />
            }
          />
          
          {/* NOT FOUND */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />

          {/* ORDERS Dashboard */}
          
          <Route
            path="/orders"
            element={<OrdersPage setCart={setCart} />}
          />
        </Routes>
      </Suspense>

      {/* FOOTER */}

      <Footer />
    </>
  );
}