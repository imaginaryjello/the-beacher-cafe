// src/pages/navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reservations" },
  { to: "/about", label: "Our Story" },
];

// WHY the transparent prop: pages with a dark photo behind the navbar
// (home, menu, about, reservations) let the photo run underneath a
// see-through bar; it turns solid cream on scroll or when the menu opens.
// Pages with light tops (login, register) just omit the prop.
export default function Navbar({ transparent = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // sync immediately in case the page loads pre-scrolled
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparent || scrolled || open;

  const linkCls = (to) =>
    pathname === to
      ? `border-b-2 pb-0.5 ${
          solid
            ? "border-[#c2410c] text-[#c2410c]"
            : "border-[#e8a87c] text-[#e8a87c]"
        }`
      : `border-b-2 pb-0.5 border-transparent transition-colors ${
          solid ? "hover:text-[#c2410c]" : "hover:text-[#e8a87c]"
        }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b-4 ${
        solid
          ? "bg-[#f5e8c7] border-[#3f2a1d] shadow-md"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span
            className={`text-2xl md:text-4xl font-bold font-[Pacifico] tracking-wide ${
              solid ? "text-[#3f2a1d]" : "text-[#f5e8c7] drop-shadow-md"
            }`}
          >
            The Beacher
          </span>
          <span
            className={`text-2xl md:text-4xl font-bold font-[Pacifico] tracking-wide ${
              solid ? "text-[#c2410c]" : "text-[#e8a87c] drop-shadow-md"
            }`}
          >
            Café
          </span>
        </Link>

        {/* Desktop Menu */}
        <div
          className={`hidden md:flex items-center gap-x-8 text-lg font-medium ${
            solid ? "text-[#3f2a1d]" : "text-[#f5e8c7] drop-shadow-md"
          }`}
        >
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={linkCls(l.to)}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* EST Badge */}
        <div
          className={`hidden md:block text-xs font-bold tracking-widest border px-4 py-1 rounded-full ${
            solid
              ? "text-[#c2410c] border-[#c2410c]"
              : "text-[#f5e8c7] border-[#f5e8c7]/70 drop-shadow-md"
          }`}
        >
          EST. 1986
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className={`md:hidden text-3xl p-1 ${
            solid ? "text-[#3f2a1d]" : "text-[#f5e8c7] drop-shadow-md"
          }`}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu — espresso panel to match the photo pages */}
      {open && (
        <div
          className="md:hidden bg-[#1f1209]/95 backdrop-blur-sm border-t border-[#c2410c]/40 px-6 py-6 space-y-4 text-lg font-medium text-[#f5e8c7]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block py-1 ${
                pathname === l.to ? "text-[#e8a87c]" : "hover:text-[#e8a87c]"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="text-xs font-bold text-[#e8a87c] tracking-widest border border-[#e8a87c] px-3 py-1 rounded-full w-fit">
            EST. 1986
          </div>
        </div>
      )}
    </nav>
  );
}
