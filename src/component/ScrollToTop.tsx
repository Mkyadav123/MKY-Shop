import {
  useEffect,
  type JSX,
} from "react";

import {
  useLocation,
} from "react-router-dom";

/* =========================
   COMPONENT
========================= */

export default function ScrollToTop(): JSX.Element | null {
  const { pathname } =
    useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}