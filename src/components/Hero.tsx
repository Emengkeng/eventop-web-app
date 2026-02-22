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
            width="56"
            height="56"
            viewBox="0 0 64 64"
            fill="none"
          >
            {/* Robot / mascot face */}
            <rect x="12" y="16" width="40" height="32" rx="8" fill="#1e1e2e" stroke="#FF4C60" strokeWidth="2" />
            <circle cx="23" cy="30" r="5" fill="#FF4C60" />
            <circle cx="41" cy="30" r="5" fill="#FF4C60" />
            <circle cx="24" cy="29" r="2" fill="#FFFACD" />
            <circle cx="42" cy="29" r="2" fill="#FFFACD" />
            <path d="M24 40 Q32 46 40 40" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="28" y="8" width="8" height="8" rx="2" fill="#FF4C60" />
            <line x1="32" y1="8" x2="32" y2="16" stroke="#FF4C60" strokeWidth="2" />
            {/* Ears */}
            <rect x="4" y="24" width="8" height="12" rx="4" fill="#1e1e2e" stroke="#FF4C60" strokeWidth="2" />
            <rect x="52" y="24" width="8" height="12" rx="4" fill="#1e1e2e" stroke="#FF4C60" strokeWidth="2" />
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