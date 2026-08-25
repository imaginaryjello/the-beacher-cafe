// src/components/ScrollToTop.jsx
// WHY this exists: BrowserRouter swaps pages client-side, so the browser
// never does its normal "new page = scroll to top" behavior. Without this,
// clicking a link from partway down one page lands you partway down the
// next page too. Mount once inside <BrowserRouter>, renders nothing.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
