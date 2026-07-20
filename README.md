# Complete Cargo Solutions Pvt Ltd — Website

A cinematic, single-page corporate site for a freight forwarding / logistics
company. Hand-written HTML5, CSS3 and vanilla ES6 — no frameworks, no build
step, no WordPress, no Bootstrap.

## Run it locally

No build tools needed. From this folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just double-click `index.html` — everything works from the file system too,
except that some browsers restrict `fetch`-like module loading, so a local
server is the safer option (already handled above).

Requires an internet connection on first load, because the following are
pulled from CDN (all pinned, stable versions):

| Library | Purpose | Source |
|---|---|---|
| Three.js r128 | Hero 3D globe + trade-route arcs | cdnjs |
| GSAP 3.12.5 + ScrollTrigger | All animation & scroll-driven timelines | cdnjs |
| Lenis 1.0.42 | Smooth inertial scrolling | unpkg |
| SplitType 0.3.4 | Hero headline word-by-word reveal | unpkg |
| Google Fonts | Space Grotesk / Inter / JetBrains Mono | fonts.googleapis.com |

If you need a fully offline build, download each library into a local `/vendor`
folder and swap the `<script src="...">` URLs in `index.html` — no code
changes required elsewhere.

## File structure

```
ccs-site/
├── index.html      complete page markup (nav, hero, 5 story sections,
│                    services, stats, journey, network, testimonials, contact)
├── style.css        design tokens + full responsive styling
├── script.js        preloader, Lenis, cursor, Three.js globe, canvas story
│                     scenes, ScrollTrigger timelines, counters, form logic
├── README.md         this file
└── assets/icons/     empty — all icons are inline SVG in index.html,
                       so no icon files are needed to ship this site
```

## What's built in

- **Preloader** — animated ring-draw CCS mark, live percentage counter, wipe reveal.
- **Hero** — real-time Three.js globe: wireframe sphere, particle dot-grid
  "continents," six animated great-circle trade routes with moving light
  trails, scroll-scrubbed rotation, ticking lat/long HUD readout.
- **Scroll storytelling** — three full-bleed sections (Sea / Air / Customs),
  each with its own bespoke Canvas2D scene: a container ship riding layered
  waves, a plane crossing drifting clouds, a scanning beam sweeping a crate.
- **Glassmorphic navbar** — transparent → blurred on scroll, animated
  underline links, full mega menu for Services with a live "route" widget.
- **Services grid** — 6 cards with cursor-tracked glow, 3D tilt, icon +
  underline motion on hover.
- **Statistics** — GSAP count-up counters triggered on scroll-into-view.
- **Logistics Journey** — 6-step Factory → Customer timeline with a container
  icon that travels the line as you scroll (scrub-linked).
- **Global Network** — procedurally drawn SVG world routes radiating from
  Mumbai, hover-to-light lanes, ambient auto-pulse cycling.
- **Testimonials** — infinite glass-card marquee, pauses on hover.
- **Contact** — floating-label glass form, WhatsApp / call / email tiles,
  client-side submit handling (swap the `setTimeout` stub in
  `initContactForm()` in `script.js` for a real POST to your backend or form
  service — e.g. Formspree, your own API, etc.)

## Brand tokens (edit these first if rebranding)

All colors, fonts and spacing are CSS custom properties at the top of
`style.css`:

```css
--c-abyss:  #050B18   /* background */
--c-navy:   #001F5B   /* panels */
--c-royal:  #0066FF   /* primary accent */
--c-orange: #FF6A00   /* CTA accent */
```

## Performance notes

- Three.js scene is capped at `devicePixelRatio` ≤ 2 and uses lightweight
  wireframe/point geometry (no textures) to stay GPU-cheap.
- All scroll animation is driven by `requestAnimationFrame` through GSAP's
  ticker (Lenis piped into the same ticker — no duplicate rAF loops).
- `prefers-reduced-motion` is respected: Lenis smoothing, globe
  auto-rotation and CSS animation durations are disabled/collapsed for users
  who request it.
- Canvas story scenes and the SVG network map are hand-drawn (no image
  assets to download), keeping the page's total weight to markup + three CDN
  scripts + fonts.

## Contact details wired into the page

- Email: `sales@completecargosolutions.in`
- Phone: `+91 99996 66877` / `+91 98116 15535`
- WhatsApp link: `https://wa.me/919999666877`
