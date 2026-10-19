# Independent Design & Motion Audit — Atlas Edition II

## Criticisms addressed

**Software-site look.** Replaced product-style visual language with publication-scale typography, a photographic 3D folio, accessible editorial paper list and minimal functional glass.

**Too little motion.** 3D ASCII sphere moves at rest; entry orbit and floating geometric accents animate independently, while the photographic image reveal and wheel respond to native scrolling.

**Disjoint transitions.** One scroll interpolation loop governs the stages. The hero character field fades to a solid background before the photograph expands; chapter images blend at complementary opacity weights; photo wheel is driven by the same scroll signal.

**Side text too small.** Navigation metadata, wheel section labels, descriptions and page footnotes use sizes appropriate to their role and mobile breakpoints.

**Cliché text.** Replaced vague agency-style slogans with plain research copy and precise distinctions between published articles, SSRN preprints and illustrative images.

**Overused glass.** Only the persistent inquiry input and entry input use glass surfaces.

## Motion technique

- `requestAnimationFrame`, frame-rate-independent dampening `1-exp(-dt/.11)`.
- Canvas glyph rendering limited to the prologue, SVG/CSS orbit accents and deterministic character art generated only on resize.
- GPU compositor transforms and opacity for image scale, wheel movement, scene drift and paper transitions.
- Gallery ring-to-drum transition uses CSS perspective, `rotateZ`, `rotateX`, `translateZ`, and measured photo card geometry.
- No global wheel event interception or scroll hijack; keyboard/direct navigation and reduced motion supported.

## Verification

- HTML parsable; local referenced image files exist; JS passed Node syntax check.
- **Browser playback not re-tested in this session:** the container's Chromium rejected navigation to local and data URLs with ERR_BLOCKED_BY_ADMINISTRATOR. It would be misleading to claim visual motion/FPS performance verification. Verify interactively on GitHub Pages after deployment.

## Known limitation

The keyboard-first input routes via a deterministic local intent classifier; it does not generate dynamic answers. The GIF/photo artwork is illustrative. Public research claims may need final author review.