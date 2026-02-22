# Eventop — Landing Page

AI-powered guided tours for any React or Next.js app. This is the marketing landing page.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: Turbopack (`next dev --turbopack`)
- **Brand Colors**: `#FF4C60` (accent red) · `#FFFACD` (cream)

## Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page (assembles sections)
│   └── globals.css      # Global styles, CSS variables, animations
└── components/
    ├── Navbar.tsx        # Fixed top nav
    ├── Hero.tsx          # Full-screen hero with title
    ├── Features.tsx      # 3-column feature cards
    ├── Demo.tsx          # Tabbed code demo
    ├── Brands.tsx        # Brand logos section
    └── Footer.tsx        # Footer with socials
```

## Customization

Edit CSS variables in `globals.css`:
```css
:root {
  --accent: #FF4C60;
  --cream: #FFFACD;
}
```
