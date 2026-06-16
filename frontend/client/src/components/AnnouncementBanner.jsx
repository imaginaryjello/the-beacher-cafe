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
      style={{ fontFamily: "Georgia, serif" }}
    >
      📢 {settings.announcement}
    </div>
  );
};

export default AnnouncementBanner;
