import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,76,96,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,250,205,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,250,205,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Mascot placeholder */}
      <div
        className="relative mb-8 animate-fade-in"
        style={{ animationFillMode: "both" }}
      >
        <div className="w-28 h-28 rounded-full bg-[#12121a] border-2 border-[#FF4C60] flex items-center justify-center glow">
          <svg 
            width="512" 
            height="320" 
            viewBox="0 0 512 320" 
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style>
                .outline { stroke: #FF4C60; stroke-width: 10; fill: #FFFACD; }
                .line { stroke: #FF4C60; stroke-width: 10; stroke-linecap: round; fill: none; }
                .fill { fill: #FF4C60; }
              </style>
            </defs>

            {/* <!-- Head shape --> */}
            <path class="outline"
                  d="M96 160
                    C96 70, 180 40, 256 70
                    C332 40, 416 70, 416 160
                    C416 250, 332 280, 256 250
                    C180 280, 96 250, 96 160 Z"/>

            {/* <!-- Center split --> */}
            <line class="line" x1="256" y1="70" x2="256" y2="210"/>

            {/* <!-- Eyes --> */}
            <ellipse class="fill" cx="205" cy="150" rx="10" ry="14"/>
            <ellipse class="fill" cx="307" cy="150" rx="10" ry="14"/>

            {/* <!-- Smile --> */}
            <path class="fill"
                  d="M170 190
                    Q256 250 342 190
                    Q342 210 256 270
                    Q170 210 170 190 Z"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1
        className="relative text-center font-bold uppercase tracking-[0.08em] leading-none animate-fade-in-up mb-4"
        style={{
          fontSize: "clamp(4rem, 12vw, 9rem)",
          color: "#FFFACD",
          animationFillMode: "both",
          animationDelay: "0.1s",
          textShadow: "0 0 60px rgba(255,76,96,0.3), 4px 4px 0px rgba(255,76,96,0.4)",
        }}
      >
        Eventop
      </h1>

      {/* Tagline */}
      <p
        className="text-center text-gray-400 tracking-[0.2em] uppercase text-sm md:text-base animate-fade-in-up mb-12"
        style={{ animationFillMode: "both", animationDelay: "0.2s" }}
      >
        Guide your users through a tour of your app
      </p>

      {/* CTA buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
        style={{ animationFillMode: "both", animationDelay: "0.3s" }}
      >
        <Link
          href="https://demo.eventop.xyz"
          className="px-8 py-3 rounded-lg font-semibold tracking-wider uppercase text-sm border-2 border-[#FF4C60] text-[#FF4C60] bg-[#FF4C60]/10 hover:bg-[#FF4C60] hover:text-[#FFFACD] transition-all duration-300 hover:scale-105"
        >
          View Demo
        </Link>
        <Link
          href="https://github.com/eventop-s"
          className="px-8 py-3 rounded-lg font-semibold tracking-wider uppercase text-sm border-2 border-[#1e1e2e] text-gray-400 transition-all duration-300 hover:border-[#FFFACD] hover:text-[#FFFACD]"
        >
          GitHub ↗
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-xs tracking-[0.2em] uppercase text-gray-500">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#FF4C60] to-transparent" />
      </div>
    </section>
  );
}