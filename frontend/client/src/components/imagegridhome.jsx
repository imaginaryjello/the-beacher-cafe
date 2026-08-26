import React from "react";

function ImageGrid(Props) {
  return (
    <button
      type="button"
      onClick={Props.onClick}
      aria-label={`View ${Props.alt}`}
      className="block w-full cursor-pointer group"
    >
      <img
        loading="lazy"
        className="h-auto max-w-full rounded-base transition-transform duration-300 group-hover:scale-[1.03]"
        src={Props.src}
        alt={Props.alt}
      />
    </button>
  );
}

export default ImageGrid;
