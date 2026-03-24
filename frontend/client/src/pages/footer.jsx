import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#3f2a1d] text-[#f5e8c7] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 md:grid-cols-3">
        {/* 🌿 Brand */}
        <div>
          <h1 className="text-3xl font-bold font-[Pacifico] text-[#f5e8c7]">
            The Beacher Café
          </h1>
          <p className="mt-4 text-sm text-[#e7d7b1] leading-relaxed">
            A neighborhood café rooted in warmth, stories, and community since
            1986.
          </p>
          <div className="mt-4 text-xs border border-[#c2410c] inline-block px-3 py-1 rounded-full text-[#c2410c] tracking-widest">
            EST. 1986
          </div>
        </div>

        {/* 📍 Contact + Hours */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#c2410c]">
            Contact Us
          </h2>
          <p className="text-sm mb-2">2164 Queen St E, Toronto, ON</p>
          <p className="text-sm mb-4">+1 (647) 123-4567</p>

          <h3 className="text-lg font-semibold mb-2 text-[#c2410c]">Hours</h3>
          <p className="text-sm">Mon – Tue: 8am – 4pm</p>
          <p className="text-sm">Wed – Sat: 8am – 8pm</p>
          <p className="text-sm">Sun: 8am – 6pm</p>
        </div>

        {/* 🌐 Social Media */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#c2410c]">
            Stay Connected
          </h2>

          <div className="flex gap-5">
            {/* Facebook */}
            <a href="#!" className="hover:scale-110 transition">
              <svg className="w-7 h-7 fill-[#1877f2]" viewBox="0 0 320 512">
                <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
              </svg>
            </a>

            {/* Instagram */}
            <a href="#!" className="hover:scale-110 transition">
              <svg className="w-7 h-7 fill-[#c13584]" viewBox="0 0 448 512">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8z" />
              </svg>
            </a>

            {/* Google */}
            <a href="#!" className="hover:scale-110 transition">
              <svg className="w-7 h-7 fill-[#ea4335]" viewBox="0 0 488 512">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a href="#!" className="hover:scale-110 transition">
              <svg
                className="w-7 h-7 fill-black bg-white rounded-full p-1"
                viewBox="0 0 512 512"
              >
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="border-t border-[#c2410c] text-center py-4 text-sm text-[#e7d7b1]">
        © {new Date().getFullYear()} The Beacher Café — Built with warmth.
      </div>
    </footer>
  );
}
