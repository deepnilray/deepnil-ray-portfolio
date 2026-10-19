# DEEPNIL RAY — MOTION EDITION

Open `index.html` in Chrome, Edge, Firefox or Safari. No server, installation, paid service, online font, tracking, API key or build step is required. Image assets are included in `assets/`.

## A real animation, not a static mockup

1. **Hello:** animated orbit geometry sits behind the opening invitation; enter with text or the button.
2. **Character-built sphere:** `canvas#orb-canvas` draws a ~1,150-point Fibonacci sphere as moving ASCII glyphs. It rotates continuously, follows the cursor subtly, and fades/expands as you scroll. On smaller screens it halves the drawn glyph count.
3. **Image opening:** a photographic image moves from an inset visual to full-frame. The compositor animates `transform` and `opacity` rather than rebuilding clipping masks.
4. **Research film:** astronomy, mathematics and science-communication images crossfade and drift with the scroll. Headlines change on separate, carefully timed transition beats to prevent overlaps.
5. **Editorial writing:** paper titles reveal naturally as they enter the viewport, without card grids or floating dashboard panels.
6. **Ask anywhere:** questions are classified **locally through keyword rules**. This is not represented as AI and does not call any service. Matching intents scroll to the related section.

## Change content

- `index.html` — copy, papers, links and contact details.
- `styles.css` — visual language and responsive layouts.
- `script.js` — animation, scroll mapping, pointer response and local message routing.
- `assets/*.jpg` — illustrative artwork; replace with your own photographs/research images when available. The artwork is labelled as illustrative.

## Accessibility

The page supports reduced motion, skip navigation, mobile navigation, visible focus styles, semantic sections and labelled forms. Visitors who prefer reduced motion get static imagery and readable content instead of forced transitions.

## Deployment

Upload the **contents of this folder** to a static host such as Netlify Drop, Cloudflare Pages or GitHub Pages. Keep the directory structure intact.

## Editorial integrity

- Manuscripts on SSRN are identified as **preprints**, not established proofs or peer-reviewed publications.
- No AI backend or live model is claimed for the question input.
- Some work and affiliation details were taken from the earlier website draft and should be rechecked by Deepnil before public release.
- Image assets are illustrative, not scientific observations or photographs of Deepnil Ray.