"use client";

import { useState } from "react";

const codeExamples = {
  install: {
    label: "01. Install",
    code: `npm install @eventop/sdk
# or
yarn add @eventop/sdk
# or
pnpm add @eventop/sdk`,
    language: "bash",
  },
  setup: {
    label: "02. Provider Setup",
    code: `// app/layout.jsx
import { EventopProvider } from '@/components/EventopProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EventopProvider>
          {children}
        </EventopProvider>
      </body>
    </html>
  );
}`,
    language: "jsx",
  },
  wrap: {
    label: "03. Wrap Features",
    code: `// components/Toolbar.jsx
'use client';
import { EventopTarget } from '@eventop/sdk/react';

export function Toolbar() {
  return (
    <div className="toolbar">
      <EventopTarget
        id="export"
        name="Export Design"
        description="Download as PNG, SVG or PDF"
      >
        <button>Export</button>
      </EventopTarget>

      <EventopTarget
        id="share"
        name="Share Design"
        description="Share a link to this design"
      >
        <button>Share</button>
      </EventopTarget>
    </div>
  );
}`,
    language: "jsx",
  },
};

type CodeKey = keyof typeof codeExamples;

function syntaxHighlight(code: string, language: string): React.ReactNode[] {
  if (language === "bash") {
    return code.split("\n").map((line, i) => (
      <div key={i} className="leading-6">
        {line.startsWith("#") ? (
          <span className="text-gray-500">{line}</span>
        ) : (
          <span style={{ color: "#FFFACD" }}>{line}</span>
        )}
      </div>
    ));
  }

  // Simple JSX/JS highlighter
  const lines = code.split("\n");
  return lines.map((line, i) => {
    const highlighted = line
      // Comments
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
      // Strings
      .replace(/('([^']*)'|"([^"]*)")/g, '<span style="color:#FFFACD">$1</span>')
      // Keywords
      .replace(
        /\b(import|export|default|from|const|let|var|return|function|async|await|if|else)\b/g,
        '<span style="color:#FF4C60">$1</span>'
      )
      // JSX tags
      .replace(/(&lt;\/?)([A-Z][a-zA-Z]*)/g, '$1<span style="color:#a78bfa">$2</span>')
      .replace(/(&lt;\/?)(html|body|div|button|span|p|h1|h2)/g, '$1<span style="color:#60a5fa">$2</span>');

    return (
      <div
        key={i}
        className="leading-6"
        dangerouslySetInnerHTML={{ __html: highlighted || "&nbsp;" }}
      />
    );
  });
}

export default function Demo() {
  const [active, setActive] = useState<CodeKey>("install");
  const example = codeExamples[active];

  return (
    <section id="demo" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2
            className="text-6xl md:text-8xl font-bold uppercase tracking-[0.1em]"
            style={{
              color: "#FFFACD",
              textShadow: "4px 4px 0px rgba(255,76,96,0.4)",
            }}
          >
            Demo
          </h2>
          <div className="w-24 h-1 bg-[#FF4C60] mx-auto mt-4 rounded-full" />
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 mb-0 border-b border-[#1e1e2e]">
          {(Object.keys(codeExamples) as CodeKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 border-b-2 -mb-px ${
                active === key
                  ? "border-[#FF4C60] text-[#FF4C60]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {codeExamples[key].label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="rounded-b-2xl rounded-tr-2xl bg-[#0d0d16] border border-t-0 border-[#1e1e2e] overflow-hidden">
          {/* Code header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1e1e2e]">
            <div className="w-3 h-3 rounded-full bg-[#FF4C60]" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-60" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
            <span className="ml-3 text-xs text-gray-600 font-mono">
              {example.language === "bash" ? "terminal" : "example.tsx"}
            </span>
          </div>

          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300 min-h-[200px]">
              {syntaxHighlight(example.code, example.language)}
            </pre>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "#FF4C60",
              color: "#FF4C60",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#FF4C60";
              (e.currentTarget as HTMLAnchorElement).style.color = "#FFFACD";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "#FF4C60";
            }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            14K ★ on GitHub
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-[#1e1e2e] font-bold uppercase tracking-wider text-sm text-gray-400 hover:text-[#FFFACD] hover:border-[#FFFACD] transition-all duration-300"
          >
            View Docs →
          </a>
        </div>
      </div>
    </section>
  );
}
