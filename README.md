# Deepnil Ray — An Observatory for the Curious

Personal website with enthusiasm for astronomy and mathematics first, an interactive sky atlas second, and sourced public achievements later. Live address: https://deepnilray.github.io/deepnil-ray-portfolio/.

The telescope is a **reference sky atlas**, not a live telescope feed. It plots a curated subset of celestial coordinates for epoch J2000. Search named targets, fly to stars, drag to pan, zoom, click stars, toggle labels, and optionally enter observer latitude/longitude to compute approximate current altitude and bearing locally in the browser. Approximation omits precession, refraction, proper motion and parallax and is not suitable for precise instrument pointing.

`index.html`, `style.css`, `app.js` contain the cinematic portfolio; `observatory.css`, `observatory.js`, and `star-data.js` provide the star finder. `/assets` images are illustrations, not measurements. `CREDITS.md` covers data provenance.

Editorial policy: content in private conversations is not public biographical source material. Published work remains sourced to public URLs, with preprints identified. The page deploys on every push to `main` via `.github/workflows/pages.yml`.