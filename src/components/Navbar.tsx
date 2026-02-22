"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="https://github.com"
            className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-[#FFFACD] transition-colors font-medium"
          >
            GitHub
          </Link>
          <Link
            href="#demo"
            className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-[#FFFACD] transition-colors font-medium"
          >
            Docs
          </Link>
          <Link
            href="#demo"
            className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-[#FFFACD] transition-colors font-medium"
          >
            Demo
          </Link>
        </div>

        {/* Logo - center */}
        <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 rounded-lg bg-[#FF4C60] flex items-center justify-center animate-pulse-glow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#FFFACD"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-xl font-bold tracking-[0.12em] uppercase"
            style={{ color: "#FFFACD" }}
          >
            Eventop
          </span>
        </div>

        {/* Right nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#"
            className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-[#FFFACD] transition-colors font-medium"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-[#FFFACD] transition-colors font-medium"
          >
            Discord
          </Link>
          <Link
            href="#"
            className="text-xs tracking-[0.15em] uppercase text-[#FF4C60] hover:text-[#FFFACD] transition-colors font-medium"
          >
            Contact
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden ml-auto text-gray-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1e1e2e] bg-[#0a0a0f] px-6 py-4 flex flex-col gap-4">
          {["GitHub", "Docs", "Demo", "Pricing", "Discord", "Contact"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-[#FFFACD] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
