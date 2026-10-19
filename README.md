# Deepnil Ray — The Unfinished Atlas

Personal research portfolio / 2026. Live at https://deepnilray.github.io/deepnil-ray-portfolio/

## Design direction

An editorial observatory rather than a software-product site. Two visual registers: ink-dark observation and warm paper for arguments and published work. Kinetic type, a generated point-sphere, a fullscreen scroll-linked reveal, a bounded 3D research index, real paper links, and a compact conversational navigator.

## Features

- Short optional "Say hi" entry. Visitors may skip it; first interaction never demands an answer.
- Constantly moving generative character sphere responding to cursor position.
- Scroll transforms based on one `requestAnimationFrame` driver: no wheel-event hijacking.
- Canvas animation pauses when the page is hidden or the hero is offscreen. Reduced-motion and touch-friendly fallbacks.
- Long-form scrollytelling: visual observation → four research directions → concrete projects → public writing → biography and collaboration.
- Input classifies each visitor's text independently and scrolls to the relevant section; it **does not falsely claim AI-generated responses**.
- Static HTML/CSS/JS and local image assets: suitable for GitHub Pages, no build and no API keys.

## Project structure

- `index.html`: real content and accessible structure
- `style.css`: typography, layout, responsive states
- `app.js`: rendering and intent-based navigation
- `assets/`: six bundled images
- `favicon.svg`: original field/monogram mark

## Editorial integrity

All preprints are identified as preprints rather than peer-reviewed research. Interpretive illustrations are not presented as measured astronomical data. Affiliation details should be confirmed periodically. No private contact information is published.

## Independent engineering review

Source and syntax checks passed locally: JavaScript parses with Node, all on-page anchor targets exist, referenced bundled assets exist, no external JS dependencies, and reduced-motion and mobile states are authored. Browser automation was restricted by the environment's administrator policy; no unsupported browser-performance claim is made.

## Deployment

The existing `.github/workflows/pages.yml` workflow publishes from `main` via GitHub Actions. All further updates should be committed to this same repository.