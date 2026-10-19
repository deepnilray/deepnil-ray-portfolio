# Independent seven-track website audit

Date: 19 October 2026. Scope: `index.html`, `style.css`, `app.js`, bundled imagery, responsive browser behaviour, and GitHub Pages configuration.

This is **seven independent review tracks**, not a claim that seven separate AI agents were run. Automated tests and a manual editorial review were performed in one environment.

## 1. Brand and positioning — corrected

Previous: an unconventional conversational welcome and cinematic, self-referential slogans made a formal personal profile seem like a marketing presentation. Rebuilt the landing view with the person's full name, documented NoRCEL leadership role, academic affiliation, and research and outreach themes. Direct landing replaces the forced gate. A professional navigation header remains readable on mobile.

## 2. Content provenance/privacy — corrected

Use only independently discoverable information; do not rely on private ChatGPT conversations. Public record: NoRCEL lists Deputy CEO, ResearchGate lists Ashoka University and public work. Each selected paper points to an original public record; SSRN records explicitly labelled preprints and distinguished from a journal short communication. Illustrative images are not represented as astronomical measurements or original photographs.

Verified references:
- https://norcel.net/the-norcel-team/
- https://www.researchgate.net/profile/Deepnil-Ray
- https://www.opastpublishers.com/open-access-articles/orbital-and-physical-characterization-of-mainbelt-asteroid-2022-uo26-8184.html
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4982884
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5169077
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6449178
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7176239
- https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6019497

**Historical caveat:** GitHub commits from previous site versions remain in repository history; rewriting the current branch does not purge those old revisions or third-party caches.

## 3. Copy and grammar — corrected

Removed the phrase “Or just come in”, role-playing invitations, ambiguous aphorisms, unsourced first-person assertions, the invented coordinate marker, and claims that a preprint title itself proves a theorem. Made headings descriptive, sections more concise, labels consistent, and the contact call to action formal. Preserved source paper titles or appropriately short descriptive labels.

## 4. Motion and scrolling — tested

Page uses native scrolling, transform-driven transitions and a character-built sphere rendered on Canvas. Scroll control is not hijacked. On desktop, sphere renders with each frame; on mobile, every other frame reduces work. Browser sample confirms successive idle images differ, and a scroll into the image-reveal scene changes scale and caption opacity. Reduced-motion mode hides canvas and restores static text.

## 5. Accessibility — tested, partially verified

One `h1`, labelled search, keyboard-accessible nav, relevant alt text, visible focus rings, semantic sections, Escape to close search, and a responsive mobile menu. Section anchors resolve. Checked headless Chromium with a 390px mobile, 320px narrow viewport and desktop, and reduced-motion preference. Full WCAG conformance has **not** been certified with a screen reader or automated axe audit.

## 6. Performance and compatibility — tested, partially verified

No runtime JavaScript libraries; images bundled locally, font fallbacks provided. Test surfaces found no JS exceptions, horizontal overflow, or broken local asset references. Canvas animation pauses when backgrounded or scrolled away; image/reveal uses compositable transforms rather than clip-path animations. There is no instrumented Lighthouse score or representative low-end-device FPS benchmark, so claims of universal 60fps should not be made.

## 7. Code and publishing — tested

`node --check app.js` passes. DOM section targets exist, layout survives 1440px, 390px and 320px widths, and navigation functions for publications, mathematics, astronomy, NoRCEL and contact return the correct sections. External link targets were researched. GitHub Pages must show successful deployment on the new commit before the revision is represented as live.

## Outstanding non-blocking work

- Check actual screen-reader announcement order and high-contrast mode with an accessibility tester.
- Measure scrolling FPS on low-end mobile hardware.
- Decide whether older Git commit history containing previous versions needs a separately authorised history rewrite; do not force-push without explicit scope and warning.