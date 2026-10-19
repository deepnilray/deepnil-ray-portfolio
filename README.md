# Deepnil Ray — Cinematic Observatory

Public site: https://deepnilray.github.io/deepnil-ray-portfolio/

A personal astronomy, mathematics and science-communication portfolio. Designed as an immersive series of cinematic scenes, ending with an interactive sky atlas rather than opening with it.

## The experience

- The first act introduces Deepnil's enthusiasm for mathematics and astronomy.
- A luminous character-built celestial sphere, image reveal, camera-like research wheel and full-bleed subject scenes unfold through native scrolling.
- Global light and contrast evolve across the full viewport. Animated lighting uses composited transforms, not a continuously regenerated canvas-wide gradient.
- Public achievements, verifiable links and labelled preprints appear later in the story.
- The final nightfall sequence leads into the interactive observatory. The sky atlas supports named-star search, pointer drag, zoom, coordinate readout, target details and approximate observer position when coordinates are provided.
- A navigation bar and Search control retain direct access to every section for visitors who don't want the film sequence.
- Accessibility considerations: real text content, keyboard-accessible search/links, reduced-motion CSS fallback, labelled telescope buttons, native scroll and no wheel-event hijacking.

## Accuracy

This is an interactive star chart using a curated J2000 catalogue, **not live telescope imagery or a precision star tracker**. Artwork is illustrative. Public institutional information and preprints are linked to their public sources. Nothing from private ChatGPT discussions should be presented as a public fact.

## Implementation

Static files hosted on GitHub Pages with an existing Actions workflow. No build tool or server API is necessary. `cinema.js`/`cinema.css` contain the continuous story lighting and scroll-motion; `observatory.js` and `star-data.js` power the telescope. All asset paths are relative for project-site hosting.

## Tests

Chromium checks were run for 1440×900, 390×844 and 320×700 layouts. All showed zero JavaScript page errors and zero horizontal overflow; the star catalogue loaded, the telescope found Vega, zoom affected field of view, mobile navigation opened, and internal section links resolved. Automated test conditions are not a guarantee of performance on every visitor's device.