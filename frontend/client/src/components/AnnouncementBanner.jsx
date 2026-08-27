// src/components/AnnouncementBanner.jsx
// Shows the owner's announcement at the top of the public site
// Only renders if announcementActive is true AND there's text
import { useSettings } from "../components/useSettings";

const AnnouncementBanner = () => {
  const { settings } = useSettings();

  if (!settings?.announcementActive || !settings?.announcement) return null;

  return (
    <div
      className="bg-[#c2410c] text-[#f5e8c7] text-center py-2 px-4 text-sm font-medium relative z-50"
      style={{
        fontFamily: "Georgia, serif",
        boxShadow:
          "0 3px 10px rgba(120, 53, 15, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
        backgroundImage:
          "linear-gradient(90deg, #9a3412 0%, #c2410c 30%, #ea580c 50%, #c2410c 70%, #9a3412 100%)",
      }}
    >
      {/* Decorative top border */}
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: "8%",
          right: "8%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #f5e8c7, transparent)",
          opacity: 0.6,
        }}
      />

      <span
        style={{
          marginRight: "8px",
          textShadow: "0 1px 3px rgba(0,0,0,0.35)",
        }}
      >
        ✦
      </span>

      <span
        style={{
          letterSpacing: "0.3px",
          textShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        {settings.announcement}
      </span>

      {/* Decorative bottom border */}
      <div
        style={{
          position: "absolute",
          bottom: "3px",
          left: "8%",
          right: "8%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, #f5e8c7, transparent)",
          opacity: 0.35,
        }}
      />
    </div>
  );
};

export default AnnouncementBanner;
