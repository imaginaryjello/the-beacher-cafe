import React from "react";

function ImageGrid(Props) {
  return (
    <div>
      <img
        className="h-auto max-w-full rounded-base"
        src={Props.src}
        alt={Props.alt}
      />
    </div>
  );
}

export default ImageGrid;
