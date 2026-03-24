import React from "react";
import SpecialCards from "../components/SpecialCards";
import ImageGrid from "../components/imagegridhome";
import Navbar from "./navbar";
import Menu from "./menu";
import About from "./about";
import Reservations from "./reservation";
import Footer from "./footer";

function Home() {
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

          {/* Warm vintage overlay */}
          <div className="absolute inset-0 bg-gradient-to-b  via-transparent " />
        </div>
        <Navbar />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white">
          <h1 className="text-6xl md:text-7xl font-bold font-serif tracking-tight mb-6 drop-shadow-lg">
            The Beacher Café
          </h1>
          <p className="text-2xl md:text-3xl mb-10 max-w-2xl mx-auto font-medium">
            Est. 1986 • Where the beach meets your favourite neighbourhood café
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/menu"
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold bg-[#c2410c] hover:bg-[#9a3410] text-white rounded-full transition-all shadow-lg"
            >
              View Our Menu
            </a>
            <a
              href="/reservations"
              className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold border-4 border-[#3f2a1d] hover:bg-[#3f2a1d] hover:text-white text-white rounded-full transition-all"
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
      {/* //home about section with years of service, awards,   */}
      <section className="mt-20 text-center px-6">
        <h2 className="text-5xl md:text-7xl  font-bold mb-8">
          Legacy of Excellence
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6">
          For nearly 40 years, The Beacher Café has been a true neighbourhood
          gem. From a small beach shack to Toronto’s favourite coastal café,
          we’ve been serving warm smiles, great food, and ocean views to our
          community.
        </p>
        <div className="flex flex-col sm:flex-row gap-10 justify-center">
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              20+ Years of Service
            </h3>
            <p className="text-gray-600">Serving the community since 2003</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              Award-Winning Cuisine
            </h3>
            <p className="text-gray-600">Recognized for culinary excellence</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              Sustainability Commitment
            </h3>
            <p className="text-gray-600">
              Proudly supporting local and eco-friendly practices
            </p>
          </div>
        </div>
        <button>
          <a
            href="/about"
            className="mt-10 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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

        <div className="mt-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Today's Specials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
            {/* Example card */}
            <SpecialCards
              image="/turkey.jpg"
              title="Turkey Avocado Sandwich"
              price="$12.99"
            />
            <SpecialCards
              image="/steakegg.png"
              title="Steak & Eggs"
              price="$29.99"
            />
            <SpecialCards
              image="/image copy 12.png"
              title="Cajun Chicken Ceasar Salad"
              price="$14.99"
            />
            <SpecialCards
              image="/somkedsalmon.png"
              title="Smoked Salmon Bagel"
              price="$11.99"
            />
          </div>
        </div>
      </section>
      <section className="mt-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Join Us?</h2>
        <a
          href="/reservations"
          className="inline-block bg-amber-600 text-white px-10 py-5 text-xl rounded-full hover:bg-amber-700 transition-all"
        >
          Reserve Your Table Now →
        </a>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-2 gap-2 mt-30 px-6">
        <div className="grid gap-4">
          <ImageGrid src="/benamyn.png" alt="Benjamyn" />
          <ImageGrid src="/brieburger.png" alt="Image" />
          <ImageGrid src="/steakegg.png" alt="Steak Egg" />
        </div>
        <div className="grid gap-4">
          <ImageGrid src="/somkedsalmon.png" alt="Smoked Salmon" />
          <ImageGrid src="/image copy 11.png" alt="Image" />
          <ImageGrid src="/turkey.jpg" alt="Turkey" />
          <ImageGrid src="/image copy 12.png" alt="Image" />
        </div>
        <div className="grid gap-4">
          <ImageGrid src="/benamyn.png" alt="Benjamyn" />
          <ImageGrid src="/brieburger.png" alt="Image" />
          <ImageGrid src="/steakegg.png" alt="Steak Egg" />
        </div>
        <div className="grid gap-4">
          <ImageGrid src="/somkedsalmon.png" alt="Smoked Salmon" />
          <ImageGrid src="/image copy 12.png" alt="Image" />
          <ImageGrid src="/turkey.jpg" alt="Turkey" />
          <ImageGrid src="/image copy 11.png" alt="Image" />
        </div>
      </div>
      {/* Visit Us */}
      <section className="w-full max-w-4xl mx-auto mt-20 px-4">
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Visit Us
            </h2>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-gray-500 text-sm">
              <span className="flex items-center gap-1.5">
                {/* Pin icon */}
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
                2164 Queen St E, Toronto, ON M4E 1E5
              </span>
              <span className="flex items-center gap-1.5">
                {/* Clock icon */}
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
              </span>
            </div>
          </div>

          {/* Map + Image grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 h-72 md:h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5771.703299680468!2d-79.29386818795331!3d43.67205505109023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4cc01cf24ceb1%3A0xd704ead51601df4e!2sThe%20Beacher%20Cafe!5e0!3m2!1sen!2sca!4v1772767249134!5m2!1sen!2sca"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              title="Our location on Google Maps"
            />
            <div className="relative overflow-hidden group">
              <img
                src="/image copy 5.png"
                alt="Our cafe"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-gradient-to-l  via-transparent color-[#f5e8c7]"
              />
              {/* subtle dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
