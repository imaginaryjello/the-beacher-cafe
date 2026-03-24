import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";
const Menu = () => {
  return (
    <>
      {/* NEW VINTAGE NAVBAR */}
      <Navbar />
      <div className="min-h-screen bg-[#f5e8c7] font-serif text-[#3f2a1d] pt-24">
        {" "}
        {/* Vintage Paper Header – exactly like 1980s diner menus */}
        <div className="bg-[#3f2a1d] text-[#f5e8c7] py-14 text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(#f5e8c7_0.8px,transparent_0.8px)] bg-size-[12px_12px] opacity-10"></div>

          <h1 className="text-6xl md:text-7xl font-black tracking-[4px] leading-none">
            THE BEACHER CAFÉ
          </h1>
          <p className="mt-3 text-2xl tracking-widest opacity-90">
            EST. 1986 • TORONTO’S NEIGHBOURHOOD CAFÉ
          </p>

          {/* Subtle “famous since” badge like your real menu */}
          <div className="absolute bottom-6 right-8 bg-[#c2410c] text-[#f5e8c7] text-xs font-bold px-6 py-1 rounded-full rotate-[-8deg] shadow-md">
            FAMOUS HOLLANDIAISE SINCE 1986
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* CHALKBOARD SPECIALS – handwritten feel */}
          <section className="mb-16">
            <div className="bg-[#1c1c1c] text-[#f5e8c7] p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 left-4 text-[#c2410c] text-5xl opacity-20 font-black">
                SPECIALS
              </div>
              <h2 className="text-4xl font-bold text-center mb-10 tracking-widest">
                BEACHER SPECIALS
              </h2>

              <div className="grid md:grid-cols-2 gap-8 text-lg leading-relaxed">
                <div className="space-y-8">
                  <div>
                    Soup du Jour — <span className="font-bold">$12</span>
                    <br />
                    <span className="text-sm opacity-75">
                      Chicken Chowder • Garlic Bread
                    </span>
                  </div>
                  <div>
                    Quiche du Jour — <span className="font-bold">$18</span>
                    <br />
                    <span className="text-sm opacity-75">
                      Spinach, Mushroom, Feta & Parmesan
                    </span>
                  </div>
                  <div>
                    Omelette du Jour — <span className="font-bold">$18</span>
                    <br />
                    <span className="text-sm opacity-75">
                      Build Your Own • Vegetarian or Meat
                    </span>
                  </div>
                </div>
                <div className="space-y-8">
                  <div>
                    Smoked Salmon Bagel — <span className="font-bold">$18</span>
                    <br />
                    <span className="text-sm opacity-75">Onion & Capers</span>
                  </div>
                  <div>
                    Pork Schnitzel — <span className="font-bold">$22</span>
                    <br />
                    <span className="text-sm opacity-75">
                      Fries + Green Salad
                    </span>
                  </div>
                  <div>
                    Fish ’n’ Chips — <span className="font-bold">$24</span>
                    <br />
                    <span className="text-sm opacity-75">
                      Crispy Haddock • Coleslaw & Tartar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ALL DAY BREAKFAST – cozy card layout */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-10 text-[#3f2a1d] border-b-4 border-[#c2410c] pb-3 inline-block">
              ALL DAY BREAKFAST
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Eggs Benjamyn */}
              <div className="bg-white border border-[#e8d9b8] rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow group">
                <img
                  src="/benamyn.png"
                  alt="Eggs Benjamyn"
                  className="w-full h-56 object-cover rounded-2xl mb-6 group-hover:scale-105 transition-transform"
                />
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-2xl">EGGS BENJAMYN</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Smoked salmon, English muffin, famous Hollandaise, red
                      onion
                    </p>
                  </div>
                  <span className="font-black text-3xl text-[#c2410c]">
                    $21
                  </span>
                </div>
              </div>

              {/* Steak & Eggs */}
              <div className="bg-white border border-[#e8d9b8] rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow group">
                <img
                  src="/steakegg.png"
                  alt="Steak & Eggs"
                  className="w-full h-56 object-cover rounded-2xl mb-6 group-hover:scale-105 transition-transform"
                />
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-2xl">
                      NEW YORK STEAK & EGGS
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Charbroiled striploin + two extra large eggs
                    </p>
                  </div>
                  <span className="font-black text-3xl text-[#c2410c]">
                    $26
                  </span>
                </div>
              </div>

              {/* Simple list items for the rest */}
              <div className="bg-white border border-[#e8d9b8] rounded-3xl p-8 shadow-md col-span-1 md:col-span-2 grid md:grid-cols-2 gap-6 text-lg">
                <div className="flex justify-between border-b pb-4">
                  <span>EGGS FLORENTINE</span>
                  <span className="font-bold">$21</span>
                </div>
                <div className="flex justify-between border-b pb-4 ">
                  <span>ALL DAY BREAKFAST</span>
                  <span className="font-bold">$18</span>
                </div>
                <div className="flex justify-between border-b pb-4">
                  <span>EGGS BENEDICT</span>
                  <span className="font-bold">$20</span>
                </div>
                <div className="flex justify-between border-b pb-4">
                  <span>BEACHER-STYLE FRENCH TOAST</span>
                  <span className="font-bold">$19</span>
                </div>
                <div className="flex justify-between border-b pb-4 ">
                  <span>PANCAKES</span>
                  <span className="font-bold">$18</span>
                </div>
                <div className="flex justify-between border-b pb-4 ">
                  <span>SMOKED SALMON SCRAMBLED EGGS</span>
                  <span className="font-bold">$18</span>
                </div>
                <div className="flex justify-between border-b pb-4 ">
                  <span>THE HEALTHY BREAKFAST</span>
                  <span className="font-bold">$18</span>
                </div>
              </div>
            </div>
          </section>

          {/* SALADS + BURGERS – paper-menu style */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 text-[#3f2a1d]">
              HEALTHY BOUNTIFUL SALADS & BURGERS
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Salads */}
              <div className="bg-white p-8 rounded-3xl shadow border border-[#e8d9b8]">
                <h3 className="text-3xl font-bold mb-8 text-[#c2410c]">
                  SALADS
                </h3>
                <ul className="space-y-6 text-lg">
                  <li className="flex justify-between">
                    <span>Cajun Chicken Caesar</span>
                    <span className="font-bold">$24</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Classic Caesar Salad</span>
                    <span className="font-bold">$18</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Garden Salad</span>
                    <span className="font-bold">$18</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fresh Fruit & Toasted Croissant</span>
                    <span className="font-bold">$19</span>
                  </li>
                </ul>
              </div>

              {/* Burgers */}
              <div className="bg-white p-8 rounded-3xl shadow border border-[#e8d9b8]">
                <h3 className="text-3xl font-bold mb-8 text-[#c2410c]">
                  BURGERS & SANDWICHES
                </h3>
                <ul className="space-y-6 text-lg">
                  <li className="flex justify-between">
                    <span>Beach Burger</span>
                    <span className="font-bold">$18</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Brie Burger</span>
                    <span className="font-bold">$20</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Banquet Burger</span>
                    <span className="font-bold">$20</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Black & Blue Burger</span>
                    <span className="font-bold">$20</span>
                  </li>
                  <li className="flex justify-between">
                    <span>B.L.T. Croissant</span>
                    <span className="font-bold">$19</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* BEVERAGES – warm & simple */}
          <section className="bg-white border border-[#e8d9b8] rounded-3xl p-10 shadow">
            <h2 className="text-4xl font-bold text-center mb-10">
              BEVERAGES & SMOOTHIES
            </h2>
            <div className="grid md:grid-cols-2 gap-10 text-lg leading-relaxed">
              <div>
                Brewed Coffee $3.50 • Café Latté $5 • Cappuccino $5
                <br />
                Espresso $4 • Orange Pekoe Tea $3.50
              </div>
              <div>
                Smoothies $8 (Chocolate Swirl • Strawberry Cream • Mango • Oreo)
                <br />
                100% Juices • Draft Beer • Hangover Caesar $15
              </div>
            </div>
          </section>

          <div className="text-center mt-16">
            <a
              href="/"
              className="inline-block bg-[#c2410c] hover:bg-[#9a3410] text-white px-14 py-6 rounded-full text-xl font-bold tracking-wider transition-all"
            >
              ← Back to the Beach
            </a>
          </div>
        </div>
        {/* Subtle footer texture */}
        <Footer />
      </div>
    </>
  );
};

export default Menu;
