# Catstronaut HUD Scrollytelling Blueprint

## Route

Catstronaut HUD turns the 8-second astronaut cat video into a scroll-scrubbed helmet interface. The video remains the emotional core while glass panels, scanner rings, stars, and mission telemetry create the immersive layer.

## Scene Beats

1. **Signal Acquire** - dark orbital scene, video paused near the opening close-up, minimal top navigation.
2. **Helmet Lock** - scanner rings and glass reflection align around the cat helmet.
3. **Orbital Drift** - scroll maps through the mid-video rotation while panels tilt and stars move at a different speed.
4. **Earth Sweep** - the Earth horizon dominates the frame; copy tightens into compact mission details.
5. **Transmission Clear** - final wide cat frame, lens warmth, and a share-focused action area.

## Animation Primitives

- **Scroll tracking:** page scroll progress maps to a 96-frame image sequence, HUD opacity, ring rotation, and panel transforms.
- **Sticky scene:** one immersive viewport remains fixed while the scroll distance scrubs the video.
- **LERP:** video time, pointer parallax, and HUD values are damped in `requestAnimationFrame`.
- **Canvas particles:** stars render as a lightweight responsive canvas layer.
- **CSS 3D:** glass panels use perspective, rotation, and transform depth instead of heavyweight WebGL.
- **Viewport triggers:** sections below the hero reveal as they enter the viewport.

## Responsive Plan

- Desktop: wide cinematic composition, fixed HUD rail, larger glass panels, full 3D tilt.
- Tablet: reduced panel width, centered content, preserved scroll scrub.
- Mobile: video stays readable with `object-position`, panels become bottom sheets, HUD density is reduced, tap targets stay at least 44px.
- Reduced motion: video remains visible and readable with calmer transforms and no aggressive panel motion.

## Technical Plan

- Static HTML/CSS/JS for fast local iteration and easy sharing.
- No build step required.
- Source video: `a52d273c-b1c8-477b-94d6-5cb4f8979f6b.mp4`.
- Scroll frames: `frames/frame_000.jpg` through `frames/frame_095.jpg`.
- Poster frame generated from the local video for social preview metadata.
- Browser verification at desktop, tablet, and mobile viewport sizes.
