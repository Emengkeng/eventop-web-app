import Image from "next/image";

const brands = [
  { name: "Ally", placeholder: "ally" },
  { name: "CodePen", placeholder: "codepen" },
  { name: "Google", placeholder: "google" },
];

function BrandPlaceholder({ name }: { name: string }) {
  return (
    <div className="hover-lift flex items-center justify-center w-full h-full rounded-xl border border-[#1e1e2e] bg-[#12121a] p-10 group transition-all duration-300 hover:border-[#FF4C60]/30">
      <span
        className="text-2xl font-bold tracking-wider uppercase text-gray-600 group-hover:text-gray-400 transition-colors"
        style={{ fontFamily: "monospace" }}
      >
        {name}
      </span>
    </div>
  );
}

export default function Brands() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1e1e2e] to-transparent mb-24" />

        <p
          className="text-center text-xs font-bold uppercase tracking-[0.3em] mb-12"
          style={{ color: "#FFFACD", opacity: 0.5 }}
        >
          Brands that use Eventop
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div key={brand.name} className="aspect-video">
              <BrandPlaceholder name={brand.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
