# Independent motion / visual design review

## What the previous edition got wrong

- It removed paint work by making the large ASCII art static. That made the page **technically lighter but visually inert** when a visitor was not scrolling.
- The enlarged image was the only substantial visible transform. Subsequent research work became a standard stacked list of editorial panels.
- Multiple smaller reveals were subtle enough to be perceived as absent, especially on a single screenshot or brief visit.
- It claimed smoothness without a moving preview or frame-difference check.

## Design decisions in this edition

- **Visible movement at rest:** animated orbital entry and physically rotating ASCII globe, built from Fibonacci-lattice points.
- **Motion with a narrative purpose:** sphere disperses -> image opens -> three research worlds blend -> reading slows into typography.
- **Scroll-linked without scroll-jacking:** native browser scrolling with one time-based interpolation pass, `1-exp(-dt/.11)`, writes transforms and opacity only.
- **Intermittent transition gaps avoided:** large text changes are deliberately scheduled to prevent two headlines occupying the same position.
- **No software/agency styling:** no feature grids, marketing CTA cards, unnecessary glass panels, process acronyms or enormous nav labels. The single glass input has a practical function.
- **Balanced performance:** no per-frame DOM character-field replacements, no canvas attached to the whole document, a reduced glyph count on mobile, and no imported animation library.

## Observed browser checks

- Browser-load checks performed in headless Chromium at 1440×900 and 390×844: zero JavaScript page errors; document width equalled viewport width.
- Captures of the idle canvas 440 ms apart produced distinct image hashes at both viewport sizes; the sphere is not static.
- Native `requestAnimationFrame` callbacks observed: 64 in 1.102 seconds desktop, 67 in 1.111 seconds mobile in the container. This is an approximate scheduling check, **not a guarantee of website rendering FPS** on user hardware.
- Mobile menu and local input classification were tested.
- Reduced-motion styles remove forced animated transitions.

## Limitations / to be confirmed

- Real scroll feel depends on hardware, browser rendering engine and input device; no universal frame-rate promise is possible.
- Research works and profile text should receive the user's final factual confirmation.
- The file ships offline; for external sharing it still requires uploading to a host.