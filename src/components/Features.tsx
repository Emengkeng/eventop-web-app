const features = [
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="12" width="36" height="28" rx="4" fill="none" stroke="#FF4C60" strokeWidth="2" />
        <path d="M8 36h36M20 40v8M32 40v8M16 48h24" stroke="#FF4C60" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="20" r="10" fill="#12121a" stroke="#FFFACD" strokeWidth="2" />
        <path d="M44 20l3 3 5-6" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Accessibility",
    description:
      "Eventop has full keyboard navigation support, focus trapping, and a11y compliance via aria attributes — guided tours for every user.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
        <rect x="10" y="10" width="44" height="44" rx="4" fill="none" stroke="#FF4C60" strokeWidth="2" strokeDasharray="4 2" />
        <rect x="18" y="18" width="28" height="28" rx="3" fill="#FF4C60" opacity="0.15" stroke="#FF4C60" strokeWidth="2" />
        <path d="M26 32l4 4 8-8" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 10l10 10M54 10L44 20M10 54l10-10M54 54l-10-10" stroke="#FF4C60" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Highly Customizable",
    description:
      "Styles kept minimal, with powerful theme tokens. Customize accent, radius, fonts, and dark/light mode — drop in and be ready instantly.",
  },
  {
    icon: (
      <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="24" width="16" height="16" rx="3" fill="#FF4C60" opacity="0.2" stroke="#FF4C60" strokeWidth="2" />
        <rect x="24" y="12" width="16" height="16" rx="3" fill="#FF4C60" opacity="0.2" stroke="#FF4C60" strokeWidth="2" />
        <rect x="40" y="24" width="16" height="16" rx="3" fill="#FF4C60" opacity="0.2" stroke="#FF4C60" strokeWidth="2" />
        <path d="M24 32h-2l-6-6M40 32h2l6-6M32 28v-2" stroke="#FFFACD" strokeWidth="2" strokeLinecap="round" />
        <rect x="24" y="36" width="16" height="16" rx="3" fill="#FFFACD" opacity="0.1" stroke="#FFFACD" strokeWidth="2" />
      </svg>
    ),
    title: "Framework Ready",
    description:
      "Drop into any React or Next.js app. Works with shadcn/ui, MUI, Radix, Tailwind, or any component library. Zero modifications to your existing components.",
  },
];

export default function Features() {
  return (
    <section className="relative py-24 px-6">
      {/* Section separator */}
      <div className="max-w-6xl mx-auto">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF4C60] to-transparent mb-24 opacity-40" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="hover-lift group relative rounded-2xl border border-[#1e1e2e] bg-[#12121a] p-8 flex flex-col items-center text-center"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF4C60] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon placeholder area */}
              <div className="mb-6 w-24 h-24 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] flex items-center justify-center group-hover:border-[#FF4C60]/40 transition-colors duration-300">
                {feature.icon}
              </div>

              <h3
                className="text-base font-bold uppercase tracking-[0.15em] mb-4"
                style={{ color: "#FFFACD" }}
              >
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
