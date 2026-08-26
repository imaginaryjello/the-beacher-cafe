// frontend/client/src/utils/cloudinary.js
//
// Cloudinary delivers resized/optimized versions of an image on the fly by
// inserting a transformation segment after "/upload/" in the URL. We store the
// full-size secure_url in MongoDB, then derive lighter versions per context:
// a 400px square for dashboard/grid thumbnails, a width-limited version for the
// public masonry, and the untouched original only inside the lightbox.
//
// WHY the guard: gallery falls back to LOCAL images (e.g. /benamyn.webp) when
// the DB is empty, and those are not Cloudinary URLs. The helper must no-op on
// anything that isn't a Cloudinary /upload/ URL so it never mangles a path.

const isCloudinary = (url) =>
  typeof url === "string" &&
  url.includes("res.cloudinary.com") &&
  url.includes("/upload/");

// Inject an arbitrary transformation string.
export const cldUrl = (url, transform) =>
  isCloudinary(url) ? url.replace("/upload/", `/upload/${transform}/`) : url;

// Width-limited (keeps aspect ratio, never upscales) — for masonry columns.
export const cldThumb = (url, w = 600) =>
  cldUrl(url, `w_${w},c_limit,f_auto,q_auto`);

// Square crop — for uniform aspect-square grids (dashboard).
export const cldSquare = (url, s = 400) =>
  cldUrl(url, `w_${s},h_${s},c_fill,f_auto,q_auto`);
