import React, { useState } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
const TIMELINE = [
  {
    year: "1986",
    title: "A Corner Is Born",
    body: "The Beacher Café first opened its doors at the corner of McLean and Queen Street East — a small, unassuming place where people came not just for coffee, but for familiarity. From the beginning, it was never about scale, but about presence.",
  },
  {
    year: "1999",
    title: "A Story Returns to Itself",
    body: "Peter Martineau took over the café — unknowingly returning to the very place where he had first met Kumiko years earlier. What began as coincidence became something lasting. A year later, they were married.",
  },
  {
    year: "2000s",
    title: "Mornings That Stayed",
    body: "Weekends became a ritual. The line outside, the quiet patience, the same orders repeated. The Eggs Benedict became known across the east end — but more than that, it became something people came back for.",
  },
  {
    year: "2010s",
    title: "Part of the Neighbourhood",
    body: "By now, the Beacher was no longer just a café. It had become part of the rhythm of the neighbourhood — a place where families returned, where stories accumulated, and where familiarity mattered more than change.",
  },
  {
    year: "2019",
    title: "A Story Worth Telling",
    body: "The café’s story was captured and shared beyond the neighbourhood, but inside, very little changed. The same tables. The same conversations. The same sense that this place belonged to the people who came through it.",
  },
  {
    year: "Today",
    title: "Still Here",
    body: "Nearly four decades later, the Beacher Café continues — not as something reinvented, but as something preserved. A place where people still return, and where time is allowed to move a little more slowly.",
  },
];

const VIDEOS = [
  {
    id: "vid1",
    title: "A Story from Queen Street East",
    embedId: "JOm7DXNHh2M",
    note: "A quiet look into how a café became part of the neighbourhood.",
  },
  {
    id: "vid2",
    title: "Still Standing",
    embedId: "OXQtDhTLioc",
    note: "Through change and uncertainty, the Beacher remained what it always was.",
  },
  {
    id: "vid3",
    title: "A Place for Stories",
    embedId: "y0hLPiuj5cc",
    note: "The stories that accumulated across decades at this corner café.",
  },
];

const FAMILY_QUOTES = [
  {
    quote: "We’ve never tried to be anything other than what we are.",
    author: "Peter Martineau",
  },
  {
    quote:
      "We have customers here now that represent four generations. That doesn’t happen by accident.",
    author: "Kumiko Martineau",
  },
  {
    quote: "Some people come in alone, but they don’t stay that way for long.",
    author: "Kumiko Martineau",
  },
];

export default function About() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const nextQuote = () => setQuoteIdx((q) => (q + 1) % FAMILY_QUOTES.length);
  const prevQuote = () =>
    setQuoteIdx((q) => (q - 1 + FAMILY_QUOTES.length) % FAMILY_QUOTES.length);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f5e8c7] font-serif text-[#3f2a1d] pt-24">
        {/* HERO */}
        <header className="bg-[#3f2a1d] py-20 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-[#c2410c] text-sm tracking-[4px] uppercase mb-4">
              Est. 1986 • Queen Street East, Toronto
            </p>
            <h1 className="font-[Pacifico] text-[#f5e8c7] text-6xl md:text-7xl mb-6">
              Our Story
            </h1>
            <p className="text-[#d4b896] text-lg italic leading-relaxed">
              A small corner café where mornings begin the same way they did
              decades ago — with familiar faces, steady routines, and a place
              that always feels like it was kept for you.
            </p>
          </div>
        </header>

        {/* OPENING STORY */}
        {/* OPENING STORY */}
        <section className="py-20 px-6 bg-[#f5e8c7]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                It's the kind of place that you walk into and time seems to
                stand still. Since 1986, The Beacher Café has been a landmark at
                the corner of McLean and Queen Street East.
              </p>
              <p>
                The restaurant was purchased by Peter Martineau in 1999. For
                most of the past 25+ years it has been owned and operated by
                Peter and his wife Kumiko — who first met right here at this
                very café.
              </p>
            </div>

            {/* Framed magazine style */}
            <div className="border-8 border-[#3f2a1d] bg-white shadow-xl p-2">
              <div className="bg-[#c2410c] text-[#f5e8c7] p-6 text-center">
                <p className="text-xs tracking-widest">
                  BEACHES LIFE • LATE SUMMER 2019
                </p>
                <p className="font-[Pacifico] text-3xl mt-2">
                  The Beacher Café
                </p>
                <p className="text-sm mt-3">WHERE EAST MEETS WEST</p>
              </div>
              <div className="p-8 bg-[#fdf6e3] text-[#3f2a1d]">
                “I was a student visiting Canada from Japan... Peter even
                remembers the table — Table 61.”
              </div>
            </div>
          </div>
        </section>

        {/* A PLACE THAT STAYED */}
        <section className="py-20 px-6 bg-[#e8d9b5]">
          <div className="max-w-3xl mx-auto text-lg leading-relaxed space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8">
              A Place That Stayed
            </h2>

            <p>In a city that is always changing, the Beacher Café remained.</p>

            <p>
              The sign out front. The quiet mornings. The same conversations
              carried across years. Some things were never meant to be replaced.
            </p>

            <p>
              Over time, it became more than a café — it became part of how
              people remembered their lives.
            </p>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Nearly Four Decades on This Corner
            </h2>

            <div className="space-y-12 relative pl-12 border-l-2 border-[#c2410c]/30">
              {TIMELINE.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 w-10 h-10 bg-[#c2410c] rounded-full border-4 border-[#3f2a1d]" />
                  <div className="bg-white border border-[#c2410c] rounded-xl p-6 shadow">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold text-xl">{item.title}</h3>
                      <span className="text-[#c2410c] font-bold">
                        {item.year}
                      </span>
                    </div>
                    <p className="text-[#5a3e2b]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAMILY QUOTES */}
        <section className="bg-[#3f2a1d] py-20 text-[#f5e8c7] text-center px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-xl italic leading-relaxed mb-8">
              “{FAMILY_QUOTES[quoteIdx].quote}”
            </p>
            <p className="text-[#d4b896]">— {FAMILY_QUOTES[quoteIdx].author}</p>
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={prevQuote}
              className="px-4 py-2 border border-[#c2410c] text-sm"
            >
              Previous
            </button>
            <button
              onClick={nextQuote}
              className="px-4 py-2 border border-[#c2410c] text-sm"
            >
              Next
            </button>
          </div>
        </section>

        {/* VIDEOS */}
        <section className="py-20 px-6 bg-[#ede0be]">
          <div className="max-w-4xl mx-auto space-y-16">
            <h2 className="text-3xl font-bold text-center">
              Seen Through the Years
            </h2>

            {VIDEOS.map((v) => (
              <div key={v.id} className="space-y-4">
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full rounded-xl border-4 border-[#3f2a1d]"
                    src={`https://www.youtube.com/embed/${v.embedId}`}
                    title={v.title}
                    allowFullScreen
                  ></iframe>
                </div>

                <p className="text-lg font-semibold">{v.title}</p>
                <p className="text-[#5a3e2b]">{v.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">A Corner of History</h2>
          <p className="max-w-xl mx-auto text-[#6b5a47] mb-10">
            Queen street and Mcclean 1985 year before the birth of The Beacher
            Cafe.
          </p>

          <img
            src="/image copy 8.png"
            alt="The History"
            className="mx-auto rounded-2xl shadow-xl max-w-4xl border-8 border-[#3f2a1d]"
          />
        </section>

        {/* FINAL CTA */}
        <section className="py-20 text-center">
          <a
            href="/reservations"
            className="inline-block bg-[#c2410c] text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-[#9a3410]"
          >
            A table is always here for you
          </a>
        </section>
      </div>
      <Footer />
    </>
  );
}
