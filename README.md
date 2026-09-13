# Catstronaut Veterinary

A complete veterinary brand concept recreated from Catstronaut HUD with Sola's motion design skill. Uses the existing Vercel project and domain: https://catstronaut-hud.vercel.app.

## Run

- `npm install`
- `npm run build`
- `npm run dev` → http://localhost:4188
- `npm test`

The build emits 19 static documents, including 18 site pages and a custom 404. Vercel serves clean URLs from `dist`. There is no client framework or runtime backend dependency. Rebuild then reload after source changes.

## Experience

Original eight-second astronaut-cat footage is represented by 96 scroll-controlled frames. Responsive WebP renditions total approximately 5 MB desktop / 2.4 MB phone, with only nearby frames requested and up to 18 decoded frames retained. Typography, camera-like transforms and film share one reversible scroll progress model. A persistent pause control and OS reduced-motion fallback keep the opening usable without a long frozen scroll corridor.

Care index and six details; our approach; first-visit checklist; field notes and three articles; four-step demo booking; saved visits; questions/urgent-help links; privacy information.

Booking is explicitly a concept: no real appointments, payments or clinical messages. Visitors can select an illustrative service and future time, save a pet name/species, reschedule/remove locally saved visits, and download a correctly labeled calendar reminder. No contact details or clinical records are requested. The booking module handles storage failure, invalid records, date validation and local slot collisions.

Original sources are preserved in `original/`; original video and JPG frames remain in the repository but are excluded from production uploads. Only `assets/` is copied into the build. Generated clinic imagery and font licenses are recorded in DESIGN.md.

## Vercel

The linked project is `catstronaut-hud` in Sola Awodiya's projects. Preserve `.vercel/project.json` locally and the existing project/domain. `vercel.json` declares the static output directory and build command. Deployment must run from this checkout. Do not move this project to ChatGPT Sites.
