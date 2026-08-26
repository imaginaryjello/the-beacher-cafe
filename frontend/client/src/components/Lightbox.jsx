// frontend/client/src/components/Lightbox.jsx
//
// Minimal, dependency-free image lightbox for the public gallery.
// Controlled by the parent: `index` is the open image (null = closed).
// Handles Escape/arrow keys, backdrop click, prev/next, swipe on mobile,
// and locks body scroll while open.
import { useEffect, useCallback, useRef } from "react";

export default function Lightbox({ images, index, onClose, onIndexChange }) {
  const isOpen = index !== null && index >= 0 && index < images.length;
  const touchX = useRef(null);

  const go = useCallback(
    (delta) => onIndexChange((index + delta + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    // Lock scroll behind the overlay, restore on close
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, go]);

  if (!isOpen) return null;
  const img = images[index];
  const many = images.length > 1;

  // Swipe: compare start/end X, ignore small drags
  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const arrowBtn =
    "absolute top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white text-3xl leading-none transition-colors";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
          aria-label="Previous image"
          className={`${arrowBtn} left-3 sm:left-6`}
        >
          ‹
        </button>
      )}

      {/* stopPropagation so clicking the image itself doesn't close */}
      <figure
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl max-h-[85vh] flex flex-col items-center"
      >
        <img
          src={img.imageUrl}
          alt={img.caption || "Gallery image"}
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
          aria-label="Next image"
          className={`${arrowBtn} right-3 sm:right-6`}
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
}
