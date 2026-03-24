import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#f5e8c7] border-b-4 border-[#3f2a1d] shadow-md bg-[url('/image copy 9.png')]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-4xl font-bold font-[Pacifico] text-[#3f2a1d] tracking-wide">
            The Beacher
          </span>
          <span className="text-2xl md:text-4xl font-bold font-[Pacifico] text-[#c2410c] tracking-wide">
            Café
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-x-8 text-lg font-medium text-[#3f2a1d]">
          <a href="/" className="hover:text-[#c2410c] transition-colors">
            Home
          </a>
          <a href="/menu" className="hover:text-[#c2410c] transition-colors">
            Menu
          </a>
          <a
            href="/reservations"
            className="hover:text-[#c2410c] transition-colors"
          >
            Reservations
          </a>
          <a href="/about" className="hover:text-[#c2410c] transition-colors">
            Our Story
          </a>
        </div>

        {/* EST Badge */}
        <div className="hidden md:block text-xs font-bold text-[#c2410c] tracking-widest border border-[#c2410c] px-4 py-1 rounded-full">
          EST. 1986
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-[#3f2a1d] text-3xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#f5e8c7] border-t border-[#3f2a1d] px-6 py-4 space-y-4 text-lg font-medium text-[#3f2a1d]">
          <a
            href="/"
            className="block hover:text-[#c2410c]"
            onClick={() => setOpen(false)}
          >
            Home
          </a>
          <a
            href="/menu"
            className="block hover:text-[#c2410c]"
            onClick={() => setOpen(false)}
          >
            Menu
          </a>
          <a
            href="/reservations"
            className="block hover:text-[#c2410c]"
            onClick={() => setOpen(false)}
          >
            Reservations
          </a>
          <a
            href="/about"
            className="block hover:text-[#c2410c]"
            onClick={() => setOpen(false)}
          >
            Our Story
          </a>

          <div className="text-xs font-bold text-[#c2410c] tracking-widest border border-[#c2410c] px-3 py-1 rounded-full w-fit">
            EST. 1986
          </div>
        </div>
      )}
    </nav>
  );
}
