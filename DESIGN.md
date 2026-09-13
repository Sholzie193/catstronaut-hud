# Catstronaut Veterinary — direction and provenance

## Brief

Recreate the existing Catstronaut HUD project as a complete veterinary concept using Sola's motion skill. Retain Vercel hosting and the supplied video-driven scroll experience, adding dimensional typography. User confirmed a concept with a working demo booking flow.

## Directly inspected references

- Original https://catstronaut-hud.vercel.app: cat in an astronaut suit above Earth, close framing at the start, body rotates horizontally in the middle, wider frontal shot at the end. Existing glass HUD panels cover parts of the film. Source uses 96 extracted frames, not HTML video seeking. Preserve the film and native-scroll reversal; replace technical HUD copy with a pet-care identity and useful navigation.
- MotionSites https://motionsites.ai/?prompt=3d-story: public preview inspected at two separate frames. A large translucent flower floats against black; later the petals separate into a more open arrangement, with small explanatory text areas under the object. Transfer: a dramatic subject transformation with meaningful quiet space, rather than continuously moving every text block. No gated prompts were accessed or copied.
- Awwwards https://www.awwwards.com/sites/rspca-animal-futures and https://www.awwwards.com/inspiration/world-flip-animal-futures: listing describes five explorable futures; public preview showed an isometric blue/purple city with luminous cyan accents, persistent compact controls and small brand corner. The sampled element was visually static during our two captures, so its complete flip timing was not directly verified. Transfer: a coherent imaginative world while useful controls retain a stable place.

## Art direction

“Little explorers. Extraordinary care.” Bricolage Grotesque and DM Sans; deep teal/space black, chartreuse, warm ivory, sage and occasional lilac. The space-cat film introduces the brand's playful empathy; the warm clinic photograph brings the visitor back to everyday care. No fake clinic address, operating hours, testimonials or named licensed professionals.

## Storyboard

1. Frontal astronaut cat; readable ivory extruded headline left, stable care action and sticky navigation. On phones, the cat has an upper image field and copy sits below its face.
2. Native scroll rotates the existing cat footage. Initial copy recedes; enormous chartreuse BRAVE lettering turns in perspective and passes across the foreground. Its visible transformation is paired with the caption “Brave little beings. Big feelings.”
3. The subject widens; foreground text clears and “Down to Earth” becomes readable. The scene exits into a chartreuse statement and companion selector, then warm clinic photography. The next action is useful pet care, not a repeated site introduction.
4. Service rows respond through turning symbols and directional arrows; a tilted first-visit ticket, sculptural inner-page motifs and image movements provide supporting character. Actual reading and forms remain stable.

## Media

- Original video and source JPG frames are supplied project assets; retained in the repository. WebP adaptations generated with Sharp: desktop 1440px, mobile 800px. No new video source was fabricated.
- Generated clinic photograph: `assets/images/care.webp`. Built-in image generation; source saved at `/Users/sola/.codex/generated_images/01a09012-418f-7653-ae4c-b34703a58293/exec-a65a4da4-f22e-4e93-8f4e-1ba67b90ee53.png`. Prompt: photorealistic editorial caramel dog resting its chin on a sage examination table, veterinary professional in olive scrubs comforting it, cream modern clinic, rounded window, afternoon light, warm reassuring mood, no text/logos/procedures. Inspected before resizing for this project.
- Locally hosted Bricolage Grotesque and DM Sans; SIL OFL licenses included in `assets/fonts`.
- Educational dental note points to AVMA pet dental care. Guidance remains high-level and does not diagnose or recommend individual treatment.

## Implementation

Static Node-generated pages and native ES modules. Finite shared scene progress, no scroll interception or artificial navigation delay. Canvas retains up to 18 decoded frames and limits simultaneous frame requests to three; unsupported/failed rendering leaves a poster. CSS-reduced-motion layout removes the long pinned corridor. Browser-local demo bookings, consent and calendar files are explicit; no clinic transmission.

## Verification — 13 September 2026

- Chrome viewport checks at 320×740, 390×844, 768×1024, 1023×593, 1440×900 and short landscape 844×390. Narrow-phone representative inner pages showed no document-level horizontal overflow. These are viewport emulations, not tests on every physical device.
- Original and revised scroll sequence inspected at start, middle and ending; forward/reverse scroll changed the actual displayed frame. The mobile crop was revised after a midpoint review exposed the face at the edge. Portrait layouts now follow measured subject positions across keyframes.
- Global pause switches to a complete static composition and removes the long frozen scroll corridor. Native mobile dialog opens/closes and returns focus. Logo navigation responds directly.
- Browser exercised required-service validation, care/date/time selection, companion form, review consent, saving a demo visit, returning to saved visits, rescheduling with retained details, calendar download initiation, removal confirmation and empty state. Test visit removed afterward.
- Eight automated checks cover all page links, required local assets, future-date generation, invalid bookings, local slot conflicts, corrupt/unavailable storage, escaped calendar events and bounded reversible motion state. Build and syntax checks pass; dependency audit clean after updating the build-only image processor.

## Motion refinement — 13 September 2026, evening

User requested a stronger layer of original motion around the supplied cat footage, an integrated treatment of its visible Gemini star, and correction of scroll jitter compared with the original project.

- Retained the original film and scroll chapters. Added a three-plane orbital structure with moving satellites, pointer depth, a projected star field and an explicit keyboard/touch-operable Space jump control. The 2.2-second jump expands the orbital envelope into a radial star flight; it does not auto-scroll or replace the underlying video sequence.
- A curved chartreuse planetary horizon rises into the closing scene and connects to the existing Earthside care section. Headline contrast is adjusted as it crosses the curved boundary; phone and desktop thresholds differ.
- The supplied media remains intact. A rotating Catstronaut paw mission patch is composited over the source's visible watermark location and follows the actual canvas crop. Short landscape uses a functional bottom control dock; this avoids a clipped circular patch. Original supplied-media provenance remains recorded above.
- Added pointer perspective to note art, the first-visit ticket and service illustrations. Links and booking routes remain immediate.
- Reviewed the original player to investigate the reported regression. Restored advance loading of the full compressed sequence (2.4 MB phone / 5 MB desktop), a short frame-rate-independent settling step, and forward/backward decode preparation. The new player retains at most 24 decoded frames, warms compressed assets with four requests, and decodes with two workers. Data-saving browsers warm a smaller neighborhood. It no longer chooses arbitrary distant frames when network results arrive out of order.
- Cached layout measurements replace layout reads on every playback tick. Film playback remains demand-driven; the independent decorative canvas is capped near 30 fps, scales its particle count/pixel density on phones, and suspends offscreen, on pause and in a hidden tab. Page restoration resumes both systems.
- Browser reviewed 320×740, 390×844, 768×1024, 844×390 and 1440×900 compositions. Fast forward and immediate reverse phone scrolling displayed frames 46 and 22, matching the corresponding smoothed timeline frames. Tablet midpoint displayed 47/47. Pause removed the frozen scroll corridor and stopped the decorative canvas. The jump was observed during its active phase and returned to its idle control label.
- Added regression checks for reversible/frame-rate-independent playback damping, complete and valid frame-priority ordering, and a bounded space-jump envelope that ends at zero. All eleven checks pass. These are browser viewport checks, not physical-device or throttled-network benchmarks.

### Focused hero follow-up

User found the added hero overlays distracting. The opening now shows the supplied cat film and existing readable copy without the added rings, stars, pointer depth or Space jump control. These effects begin only after the introductory copy has cleared (27% of the existing scroll sequence), with the orbital rings easing into the transition. Returning to the opening removes the effects again and suspends their rendering. The watermark patch stays in place but is static during the opening. Playback smoothing and the rest of the planetary transition are retained.

### Full-sequence clarification

User clarified that the added overlay must be removed throughout the video-to-scroll motion, retaining the green ending. Removed the orbital rings, additional star canvas, jump wave, Space jump control and their animation loop from the implementation entirely. The original cat playback, dimensional text, watermark patch and green planetary handoff remain. The green horizon now follows the existing film progress directly, without an additional continuous renderer.
