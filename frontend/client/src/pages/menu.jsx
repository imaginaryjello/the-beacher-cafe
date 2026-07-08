// src/pages/menu.jsx
// WHY: was fully static HTML — now pulls live from backend
// Static fallback content kept for sections not yet in the DB
import { useState, useEffect } from "react";
import Navbar from "./navbar";
import Footer from "./footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex justify-between border-b pb-4 animate-pulse">
    <div className="h-4 bg-[#e8d9b8] rounded w-2/3" />
    <div className="h-4 bg-[#e8d9b8] rounded w-12" />
  </div>
);

// ─────────────────────────────────────────
// MENU ITEM ROW — simple list style
// ─────────────────────────────────────────
const MenuRow = ({ item }) => (
  <div className="flex justify-between border-b border-[#e8d9b8] pb-4 gap-4">
    <div>
      <span className="font-medium text-[#3f2a1d]">{item.name}</span>
      {item.description && (
        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
      )}
    </div>
    <span className="font-bold text-[#3f2a1d] shrink-0">
      ${Number(item.price).toFixed(2)}
    </span>
  </div>
);

// ─────────────────────────────────────────
// MENU SECTION — one category block
// ─────────────────────────────────────────
const MenuSection = ({ title, items, loading, fallbackContent }) => {
  if (!loading && items.length === 0 && !fallbackContent) return null;

  return (
    <div className="bg-white border border-[#e8d9b8] rounded-3xl p-5 sm:p-8 shadow">
      <h3 className="text-2xl font-bold mb-6 text-[#c2410c]">{title}</h3>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <MenuRow key={item._id} item={item} />
          ))}
        </div>
      ) : (
        // WHY: fallback shows static content while DB is empty
        // Remove this once all items are in the DB
        fallbackContent
      )}
    </div>
  );
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // WHY ?available=true: public menu only shows available items
        const res = await fetch(`${API}/api/menu?available=true`);
        const data = await res.json();
        if (data.success) setMenuItems(data.menuItems);
        else setError("Menu unavailable right now.");
      } catch {
        setError("Could not load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Group items by category
  const byCategory = (cat) => menuItems.filter((i) => i.category === cat);
  const specials = menuItems.filter(
    (i) => i.isSpecial || i.category === "specials",
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f5e8c7] font-serif text-[#3f2a1d] pt-24">
        {/* ── HERO HEADER ── */}
        <div className="bg-[#3f2a1d] text-[#f5e8c7] py-10 md:py-14 px-4 text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(#f5e8c7_0.8px,transparent_0.8px)] bg-size-[12px_12px] opacity-10" />
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[2px] sm:tracking-[4px] leading-none">
            THE BEACHER CAFÉ
          </h1>
          <p className="mt-3 text-base sm:text-xl md:text-2xl tracking-widest opacity-90">
            EST. 1986 • TORONTO'S NEIGHBOURHOOD CAFÉ
          </p>
          <div className="relative inline-block mt-5 md:mt-0 md:absolute md:bottom-6 md:right-8 bg-[#c2410c] text-[#f5e8c7] text-xs font-bold px-6 py-1 rounded-full rotate-[-8deg] shadow-md">
            FAMOUS HOLLANDAISE SINCE 1986
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* ── ERROR STATE ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-8 text-center">
              {error}
            </div>
          )}

          {/* ── CHALKBOARD SPECIALS ── */}
          <section className="mb-16">
            <div className="bg-[#1c1c1c] text-[#f5e8c7] p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 left-4 text-[#c2410c] text-5xl opacity-20 font-black">
                SPECIALS
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-10 tracking-widest">
                BEACHER SPECIALS
              </h2>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-700 rounded w-1/2 opacity-60" />
                    </div>
                  ))}
                </div>
              ) : specials.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8 text-lg leading-relaxed">
                  {specials.map((item) => (
                    <div key={item._id}>
                      {item.name} —{" "}
                      <span className="font-bold">
                        ${Number(item.price).toFixed(2)}
                      </span>
                      {item.description && <br />}
                      {item.description && (
                        <span className="text-sm opacity-75">
                          {item.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Static fallback
                <div className="grid md:grid-cols-2 gap-8 text-lg leading-relaxed">
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
                    Fish 'n' Chips — <span className="font-bold">$24</span>
                    <br />
                    <span className="text-sm opacity-75">
                      Crispy Haddock • Coleslaw & Tartar
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── ALL DAY BREAKFAST ── */}
          <section className="mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-[#3f2a1d] border-b-4 border-[#c2410c] pb-3 inline-block">
              ALL DAY BREAKFAST
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Featured cards — keep static since they have images */}
              <div className="bg-white border border-[#e8d9b8] rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow group">
                <img
                  src="/benamyn.png"
                  alt="Eggs Benjamyn"
                  className="w-full h-56 object-cover rounded-2xl mb-6 group-hover:scale-105 transition-transform"
                />
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-bold text-xl sm:text-2xl">
                      EGGS BENJAMYN
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Smoked salmon, English muffin, famous Hollandaise, red
                      onion
                    </p>
                  </div>
                  <span className="font-black text-2xl sm:text-3xl text-[#c2410c] shrink-0">
                    $21
                  </span>
                </div>
              </div>
              <div className="bg-white border border-[#e8d9b8] rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow group">
                <img
                  src="/steakegg.png"
                  alt="Steak & Eggs"
                  className="w-full h-56 object-cover rounded-2xl mb-6 group-hover:scale-105 transition-transform"
                />
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-bold text-xl sm:text-2xl">
                      NEW YORK STEAK & EGGS
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Charbroiled striploin + two extra large eggs
                    </p>
                  </div>
                  <span className="font-black text-2xl sm:text-3xl text-[#c2410c] shrink-0">
                    $26
                  </span>
                </div>
              </div>

              {/* Dynamic breakfast items from DB */}
              <div className="bg-white border border-[#e8d9b8] rounded-3xl p-5 sm:p-8 shadow-md col-span-1 md:col-span-2">
                {loading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </div>
                ) : byCategory("breakfast").length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6 text-lg">
                    {byCategory("breakfast").map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between border-b pb-4"
                      >
                        <div>
                          <span>{item.name.toUpperCase()}</span>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="font-bold ml-4 shrink-0">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Static fallback
                  <div className="grid md:grid-cols-2 gap-6 text-lg">
                    {[
                      ["EGGS FLORENTINE", "$21"],
                      ["ALL DAY BREAKFAST", "$18"],
                      ["EGGS BENEDICT", "$20"],
                      ["BEACHER-STYLE FRENCH TOAST", "$19"],
                      ["PANCAKES", "$18"],
                      ["SMOKED SALMON SCRAMBLED EGGS", "$18"],
                      ["THE HEALTHY BREAKFAST", "$18"],
                    ].map(([name, price]) => (
                      <div
                        key={name}
                        className="flex justify-between border-b pb-4"
                      >
                        <span>{name}</span>
                        <span className="font-bold">{price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── SALADS + BURGERS ── */}
          <section className="mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-[#3f2a1d]">
              HEALTHY BOUNTIFUL SALADS & BURGERS
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <MenuSection
                title="SALADS"
                items={byCategory("lunch").filter((i) =>
                  i.name.toLowerCase().includes("salad"),
                )}
                loading={loading}
                fallbackContent={
                  <ul className="space-y-6 text-lg">
                    {[
                      ["Cajun Chicken Caesar", "$24"],
                      ["Classic Caesar Salad", "$18"],
                      ["Garden Salad", "$18"],
                      ["Fresh Fruit & Toasted Croissant", "$19"],
                    ].map(([n, p]) => (
                      <li key={n} className="flex justify-between">
                        <span>{n}</span>
                        <span className="font-bold">{p}</span>
                      </li>
                    ))}
                  </ul>
                }
              />
              <MenuSection
                title="BURGERS & SANDWICHES"
                items={byCategory("lunch").filter(
                  (i) => !i.name.toLowerCase().includes("salad"),
                )}
                loading={loading}
                fallbackContent={
                  <ul className="space-y-6 text-lg">
                    {[
                      ["Beach Burger", "$18"],
                      ["Brie Burger", "$20"],
                      ["Banquet Burger", "$20"],
                      ["Black & Blue Burger", "$20"],
                      ["B.L.T. Croissant", "$19"],
                    ].map(([n, p]) => (
                      <li key={n} className="flex justify-between">
                        <span>{n}</span>
                        <span className="font-bold">{p}</span>
                      </li>
                    ))}
                  </ul>
                }
              />
            </div>
          </section>
          {/* Desserts */}
          <section className="bg-white border border-[#e8d9b8] rounded-3xl p-6 sm:p-10 shadow mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">
              DECADENT DESSERTS
            </h2>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : byCategory("dessert").length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4 text-lg">
                {byCategory("dessert").map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between border-b border-[#e8d9b8] pb-3"
                  >
                    <div>
                      <span>{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="font-bold">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // Static fallback
              <div className="grid md:grid-cols-2 gap-10 text-lg leading-relaxed">
                <div>
                  Chocolate Mousse $10 • New York Cheesecake $10
                  <br />
                  Carrot Cake $9 • Apple Crumble $9
                </div>
                <div>
                  Ice Cream Sundae $8 (Chocolate, Strawberry, Vanilla)
                  <br />
                  Belgian Waffle $12 with Ice Cream & Chocolate Sauce
                </div>
              </div>
            )}
          </section>
          {/* ── BEVERAGES ── */}
          <section className="bg-white border border-[#e8d9b8] rounded-3xl p-6 sm:p-10 shadow mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">
              BEVERAGES & SMOOTHIES
            </h2>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            ) : byCategory("drinks").length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4 text-lg">
                {byCategory("drinks").map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between border-b border-[#e8d9b8] pb-3"
                  >
                    <div>
                      <span>{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="font-bold">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              // Static fallback
              <div className="grid md:grid-cols-2 gap-10 text-lg leading-relaxed">
                <div>
                  Brewed Coffee $3.50 • Café Latté $5 • Cappuccino $5
                  <br />
                  Espresso $4 • Orange Pekoe Tea $3.50
                </div>
                <div>
                  Smoothies $8 (Chocolate Swirl • Strawberry Cream • Mango •
                  Oreo)
                  <br />
                  100% Juices • Draft Beer • Hangover Caesar $15
                </div>
              </div>
            )}
          </section>

          <div className="text-center mt-8">
            <a
              href="/"
              className="inline-block bg-[#c2410c] hover:bg-[#9a3410] text-white px-8 py-4 text-base sm:px-14 sm:py-6 sm:text-xl rounded-full font-bold tracking-wider transition-all"
            >
              ← Back to the Beach
            </a>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Menu;
