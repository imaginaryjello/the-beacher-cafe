// src/pages/footer.jsx
import { Link } from "react-router-dom";
import { useSettings, formatHoursDisplay } from "../components/useSettings";

export default function Footer() {
  const { settings } = useSettings();

  // Compute grouped hours from settings (falls back gracefully if not loaded)
  const hoursGroups = settings ? formatHoursDisplay(settings.hours) : [];

  const phone = settings?.phone || "416-699-3874";
  const address = settings?.address || "2162 Queen St E, Toronto, ON";
  // One-tap directions; query includes the café name so Maps finds the listing
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `The Beacher Cafe ${address}`,
  )}`;

  return (
    <footer className="bg-[#3f2a1d] text-[#f5e8c7] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <p className="text-3xl font-bold font-[Pacifico] text-[#f5e8c7]">
            The Beacher Café
          </p>
          <p className="mt-4 text-sm text-[#e7d7b1] leading-relaxed">
            A neighborhood café rooted in warmth, stories, and community since
            1986.
          </p>
          <div className="mt-4 text-xs border border-[#c2410c] inline-block px-3 py-1 rounded-full text-[#c2410c] tracking-widest">
            EST. 1986
          </div>
        </div>

        {/* Explore */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#c2410c]">Explore</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/menu"
                className="hover:text-[#c2410c] transition-colors"
              >
                Our Menu
              </Link>
            </li>
            <li>
              <Link
                to="/reservations"
                className="hover:text-[#c2410c] transition-colors"
              >
                Reserve a Table
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-[#c2410c] transition-colors"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-[#c2410c] transition-colors"
              >
                Join the Team
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-[#c2410c] transition-colors"
              >
                Staff Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact + Hours — dynamic from settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#c2410c]">Find Us</h2>
          <p className="text-sm mb-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#c2410c] transition-colors"
            >
              📍 {address}
            </a>
          </p>
          <p className="text-sm mb-4">
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="hover:text-[#c2410c] transition-colors"
            >
              📞 {phone}
            </a>
          </p>

          <h3 className="text-lg font-semibold mb-2 text-[#c2410c]">Hours</h3>
          {hoursGroups.length > 0 ? (
            hoursGroups.map((g, i) => (
              <p key={i} className="text-sm">
                {g.days}: {g.time}
              </p>
            ))
          ) : (
            // Fallback while loading
            <>
              <p className="text-sm">Mon – Sat: 8am – 8pm</p>
              <p className="text-sm">Sun: 8am – 6pm</p>
            </>
          )}
        </div>

        {/* Social */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#c2410c]">
            Stay Connected
          </h2>
          <p className="text-sm text-[#e7d7b1] mb-4">
            <Link to="/register" className="text-[#c2410c] hover:underline">
              Register here
            </Link>{" "}
            to receive updates and special offers!
          </p>

          <div className="flex gap-2 -ml-2">
            <a
              href="https://www.facebook.com/TheBeacherCafe/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="The Beacher Café on Facebook"
              className="hover:scale-110 transition p-2"
            >
              <svg className="w-7 h-7 fill-[#1877f2]" viewBox="0 0 320 512">
                <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/thebeachercafetoronto/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="The Beacher Café on Instagram"
              className="hover:scale-110 transition p-2"
            >
              <svg className="w-7 h-7 fill-[#c13584]" viewBox="0 0 448 512">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8z" />
              </svg>
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="The Beacher Café on Google Maps"
              className="hover:scale-110 transition p-2"
            >
              <svg className="w-7 h-7 fill-[#ea4335]" viewBox="0 0 488 512">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Signature line + copyright */}
      <p className="text-center text-xs text-[#e8a87c] tracking-widest italic pb-4 px-6">
        "A table is always ready for you"
      </p>
      <div className="border-t border-[#c2410c] text-center py-4 text-sm text-[#e7d7b1]">
        © {new Date().getFullYear()} The Beacher Café — Built with warmth.
      </div>
    </footer>
  );
}
