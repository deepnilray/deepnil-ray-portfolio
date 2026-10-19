# Cinematic experience design and technical review

### Identified problems in the preceding version

1. The telescope appeared too early and read as an embedded tool rather than the destination.
2. Individual effects existed but the website still looked like a succession of boxed sections.
3. Bright paper sections interrupted the visual continuity.
4. The title and instrument panel could collide if the telescope was merely moved into the hero without reflowing the layout.
5. Generating moving CSS gradients every animation frame would risk substantial repaint work, especially on mobile GPUs.
6. The earlier layout spent excessive scroll distance on scenes with too little visual change.
7. Public achievements took precedence over the user's requested personal enthusiasm.

### Changes

- Reordered the experience into introduction, full-screen cosmos, questions, rotating works, image-backed public research, writing, biography and contacts, nightfall, and the final observatory.
- Added an immersive whole-viewport light grade driven by pointer and scroll, GPU-composited light movement, a full-screen aperture entrance and a full-screen telescope view.
- Changed the astronomy, mathematics and NoRCEL research sections from split-column pages into picture-led movie frames; maintained accessible text and direct links.
- Shortened long scroll distances to avoid dead scrolling; kept native browser scrolling.
- Preserved compact search and instrument controls and the ability to jump to any section without experiencing the full scroll sequence.
- Kept public-profile facts and source links and labelled the star atlas appropriately.

### Test status

Chromium browser tests on desktop, mobile and 320px widths passed JavaScript and overflow checks and exercised Vega search and telescope zoom. A separate optional long-running cross-page stress check stalled in this environment and is not represented as a passed test. Performance in production should be assessed on a low-end phone as well.