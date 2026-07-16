import React, { useState, useEffect } from "react";
import SpecialCards from "../components/SpecialCards";
import ImageGrid from "../components/imagegridhome";
import Navbar from "./navbar";
import Menu from "./menu";
import About from "./about";
import Reservations from "./reservation";
import Register from "./register";
import Footer from "./footer";

import { useSettings, formatHoursDisplay } from "../components/useSettings";
import AnnouncementBanner from "../components/AnnouncementBanner";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// WHY fallbacks for both sections: the home page should never look empty to a
// visitor, even before the owner has uploaded anything to the dashboard.
const FALLBACK_GALLERY = [
  { _id: "g1", imageUrl: "/benamyn.png", caption: "" },
  { _id: "g2", imageUrl: "/brieburger.png", caption: "" },
  { _id: "g3", imageUrl: "/steakegg.png", caption: "" },
  { _id: "g4", imageUrl: "/somkedsalmon.png", caption: "" },
  { _id: "g5", imageUrl: "/image copy 11.png", caption: "" },
  { _id: "g6", imageUrl: "/turkey.jpg", caption: "" },
  { _id: "g7", imageUrl: "/image copy 12.png", caption: "" },
];

const FALLBACK_SPECIALS = [
  {
    _id: "f1",
    imageUrl: "/turkey.jpg",
    title: "Turkey Avocado Sandwich",
    price: 12.99,
  },
  { _id: "f2", imageUrl: "/steakegg.png", title: "Steak & Eggs", price: 29.99 },
  {
    _id: "f3",
    imageUrl: "/image copy 12.png",
    title: "Cajun Chicken Caesar Salad",
    price: 14.99,
  },
  {
    _id: "f4",
    imageUrl: "/somkedsalmon.png",
    title: "Smoked Salmon Bagel",
    price: 11.99,
  },
];

function Home() {
  const { settings } = useSettings();
  const hoursGroups = settings ? formatHoursDisplay(settings.hours) : [];

  // Fetch active specials from the backend
  const [specials, setSpecials] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/specials`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          // Only show active specials on the public home page
          const active = data.specials.filter((s) => s.active);
          setSpecials(active);
        }
      })
      .catch(() => {}); // silently fall back to static cards if API is down
  }, []);

  // Fetch gallery images from the backend
  const [galleryImages, setGalleryImages] = useState([]);
  useEffect(() => {
    fetch(`${API}/api/gallery`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setGalleryImages(data.images);
      })
      .catch(() => {}); // silently fall back to static images if API is down
  }, []);
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="/image copy 3.png"
            alt="The Beacher Cafe ocean terrace at golden hour"
            className="w-full h-full  brightness-[0.99] object-center object-cover"
          />

          {/* Warm vintage overlay — light in the middle so the photo glows,
              darker at top/bottom so navbar area and scroll cue stay legible */}
          <div className="absolute inset-0 bg-linear-to-b from-[#1f1209]/45 via-[#1f1209]/15 to-[#1f1209]/70" />
        </div>
        <Navbar transparent />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif tracking-tight mb-6 drop-shadow-lg">
            The Beacher Café
          </h1>
          <p className="text-lg sm:text-2xl md:text-3xl mb-10 max-w-2xl mx-auto font-medium">
            Est. 1986 • Where the beach meets your favourite neighbourhood café
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <a
              href="/menu"
              className="inline-flex items-center justify-center px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl font-bold bg-[#c2410c] hover:bg-[#9a3410] text-white rounded-full transition-all shadow-lg"
            >
              View Our Menu
            </a>
            <a
              href="/reservations"
              className="inline-flex items-center justify-center px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl font-bold border-4 border-[#3f2a1d] hover:bg-[#3f2a1d] hover:text-white text-white rounded-full transition-all"
            >
              Reserve Your Table
            </a>
          </div>
        </div>

        {/* Optional scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>
      {/* Warm cream ground for everything between hero and footer.
          WHY -mb-16: Footer has mt-16; negative margin keeps that gap cream
          instead of flashing page-white between cream and the dark footer. */}
      <div className="bg-[#f5e8c7] pb-24 -mb-16 text-[#3f2a1d]">
        {/* //home about section with years of service, awards,   */}
        <section className="pt-20 text-center px-6">
          <p className="text-[#c2410c] text-sm tracking-[4px] uppercase mb-3">
            Nearly four decades on the corner
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif mb-8">
            Legacy of The Beaches
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6">
            For nearly 40 years, The Beacher Café has been a true neighbourhood
            gem. From a small beach shack to Toronto’s favourite coastal café,
            we’ve been serving warm smiles, great food, and family bonds.
          </p>
          <div className="flex flex-col sm:flex-row gap-10 justify-center">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                20+ Years of Service
              </h3>
              <p className="text-[#6b5a47]">Serving the community since 2003</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Award-Winning Cuisine
              </h3>
              <p className="text-[#6b5a47]">
                Recognized for culinary excellence
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Sustainability Commitment
              </h3>
              <p className="text-[#6b5a47]">
                Proudly supporting local and eco-friendly practices
              </p>
            </div>
          </div>
          <button>
            <a
              href="/about"
              className="mt-10 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-[#c2410c] hover:bg-[#9a3410] text-white rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Learn More About Us
            </a>
          </button>
        </section>
        {/* navigation bar with logo and links to menu, reservations, about us */}
        <section>
          {/* TODAY'S SPECIALS (3–4 cards in row)
      ┌────────────┬────────────┬────────────┬────────────┐
      │  Card 1    │  Card 2    │  Card 3    │  Card 4    │
      │ Photo      │ Photo      │ Photo      │ Photo      │
      │ Title      │ Title      │ Title      │ Title      │
      │ Price      │ Price      │ Price      │ Price      │
      └────────────┴────────────┴────────────┴────────────┘
      "See all specials" → link to full menu */}

          <div className="mt-20 px-6 text-center">
            <p className="text-[#c2410c] text-sm tracking-[4px] uppercase mb-3">
              Fresh today
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-8">
              Today's Specials
            </h2>
            <div className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {/* WHY fallback: if no active specials exist in the DB yet, we show
                static cards so the home page never looks empty to visitors */}
                {(specials.length > 0 ? specials : FALLBACK_SPECIALS).map(
                  (s) => (
                    <SpecialCards
                      key={s._id}
                      image={s.imageUrl}
                      title={s.title}
                      price={`$${Number(s.price).toFixed(2)}`}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
        {/* CTA — night storefront band, same treatment as the menu page */}
        <section className="mt-10 px-4 sm:px-6">
          <div className="relative rounded-3xl overflow-hidden shadow-xl max-w-5xl mx-auto">
            <img
              src="/frontbeacher.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#1f1209]/70" />
            <div className="relative z-10 text-center py-12 sm:py-16 px-6 text-[#f5e8c7]">
              <p className="text-xs tracking-[3px] text-[#e8a87c] mb-3">
                A SEAT WILL BE WAITING
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-6">
                Ready to Join Us?
              </h2>
              <a
                href="/reservations"
                className="inline-block bg-[#c2410c] hover:bg-[#9a3410] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg"
              >
                Reserve Your Table Now →
              </a>
            </div>
          </div>
        </section>

        {/* WHY 4 column divs instead of a flat grid: this gives the masonry-style
          staggered look where each column can have different image heights.
          We distribute images round-robin across 4 columns (index % 4). */}
        {(() => {
          const imgs =
            galleryImages.length > 0 ? galleryImages : FALLBACK_GALLERY;
          const cols = [[], [], [], []];
          imgs.forEach((img, i) => cols[i % 4].push(img));
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-20 px-6">
              {cols.map((col, ci) => (
                <div key={ci} className="grid gap-2">
                  {col.map((img) => (
                    <ImageGrid
                      key={img._id}
                      src={img.imageUrl}
                      alt={img.caption || "Gallery image"}
                    />
                  ))}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Visit Us */}
        <section className="w-full max-w-4xl mx-auto mt-20 px-4">
          <div className="border border-[#3f2a1d]/15 rounded-2xl overflow-hidden shadow-lg bg-white">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-[#3f2a1d]/10">
              <h2 className="text-3xl font-bold font-serif text-[#3f2a1d] tracking-tight">
                Visit Us
              </h2>
              <AnnouncementBanner />

              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-[#6b5a47] text-sm">
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-rose-500 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {settings?.address || "2164 Queen St E, Toronto, ON M4E 1E5"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-emerald-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {hoursGroups.length > 0
                    ? hoursGroups.map((g) => `${g.days}: ${g.time}`).join(" · ")
                    : "Open daily"}
                </span>
              </div>
            </div>

            {/* Map + Image grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5771.703299680468!2d-79.29386818795331!3d43.67205505109023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cc01cf24ceb1%3A0xd704ead51601df4e!2sThe%20Beacher%20Cafe!5e0!3m2!1sen!2sca!4v1772767249134!5m2!1sen!2sca"
                className="w-full h-64 md:h-full border-0"
                allowFullScreen
                loading="lazy"
                title="Our location on Google Maps"
              />
              <div className="relative overflow-hidden group h-56 md:h-auto">
                <img
                  src="/image copy 5.png"
                  alt="Our cafe"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-linear-to-l via-transparent"
                />
                {/* subtle dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default Home;
