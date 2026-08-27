// src/pages/gallery.jsx
// Standalone public gallery — its own image collection (/api/gallery-page),
// managed from the dashboard's "Gallery Page" tab. Separate from the home grid.
import { useState, useEffect, useCallback } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Cloudinary delivers a lighter, right-sized version by inserting a transform
// after /upload/. No-op on anything that isn't a Cloudinary URL.
const thumb = (url, w = 500) =>
  url && url.includes("res.cloudinary.com") && url.includes("/upload/")
    ? url.replace("/upload/", `/upload/w_${w},h_${w},c_fill,f_auto,q_auto/`)
    : url;

// ─────────────────────────────────────────
// LIGHTBOX (self-contained)
// ─────────────────────────────────────────
const Lightbox = ({ images, index, onClose, onIndexChange }) => {
  const open = index !== null && index >= 0 && index < images.length;

  const go = useCallback(
    (d) => onIndexChange((index + d + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, go]);

  if (!open) return null;
  const img = images[index];
  const many = images.length > 1;
  const arrow =
    "absolute top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white text-3xl transition-colors";

  return (
    <div
      className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        autoFocus
        className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white text-2xl transition-colors"
      >
        ✕
      </button>
      {many && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Previous"
          className={`${arrow} left-3 sm:left-6`}
        >
          ‹
        </button>
      )}
      <figure
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl max-h-[85vh] flex flex-col items-center"
      >
        <img
          src={img.imageUrl}
          alt={img.caption || "Gallery photo"}
          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        {img.caption && (
          <figcaption
            className="text-center text-[#f5e8c7]/80 text-sm mt-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {img.caption}
          </figcaption>
        )}
      </figure>
      {many && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Next"
          className={`${arrow} right-3 sm:right-6`}
        >
          ›
        </button>
      )}
      {many && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60 tracking-widest">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// GALLERY PAGE
// ─────────────────────────────────────────
export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/gallery-page`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setImages(data.images);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <title>Gallery — The Beacher Café</title>
      <meta
        name="description"
        content="Photos from The Beacher Café in the Beaches, Toronto — the room, the plates, and forty years of neighbourhood mornings."
      />
      <Navbar transparent />

      <div className="min-h-screen bg-[#f5e8c7] text-[#3f2a1d]">
        {/* Hero */}
        <header className="relative pt-36 pb-20 md:pt-44 md:pb-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/insidecafe5.webp"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#1f1209]/75 via-[#1f1209]/60 to-[#1f1209]/85" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#e8a87c] text-sm tracking-[4px] uppercase mb-3">
              Est. 1986 • The Beaches, Toronto
            </p>
            <h1
              className="font-[Pacifico] text-[#f5e8c7] text-5xl sm:text-6xl md:text-7xl mb-4 drop-shadow-lg"
            >
              Our Gallery
            </h1>
            <p
              className="text-[#f5e8c7]/90 text-lg italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              A look inside the corner café the neighbourhood has loved for
              nearly forty years.
            </p>
          </div>
        </header>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-white/60 animate-pulse border border-[#3f2a1d]/10"
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🖼️</p>
              <h2
                className="text-2xl text-[#3f2a1d] mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Our gallery is coming soon
              </h2>
              <p
                className="text-[#6b5a47]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Photos are on their way — check back shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={img._id}
                  type="button"
                  onClick={() => setLightbox(i)}
                  aria-label={`View ${img.caption || "gallery photo"}`}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-[#3f2a1d]/10 shadow-sm cursor-pointer"
                >
                  <img
                    src={thumb(img.imageUrl, 500)}
                    alt={img.caption || "Gallery photo"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {img.caption && (
                    <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity text-left">
                      {img.caption}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <Lightbox
        images={images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndexChange={setLightbox}
      />

      <Footer />
    </>
  );
}
