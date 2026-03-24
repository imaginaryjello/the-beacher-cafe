import React from "react";

function SpecialCards(props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={props.image}
        alt={props.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{props.title}</h3>
        <p className="text-lg text-amber-600 font-bold">{props.price}</p>
      </div>
    </div>
  );
}

export default SpecialCards;
