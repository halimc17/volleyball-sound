# VolleyBeats Design System

## Identity & Mode
- **Surface mode**: Operate (`impeccable` Operate mode). VolleyBeats is a live volleyball match soundboard and music library for court audio operators on phones, tablets, and laptops.
- **Aesthetic**: Industrial-Tactile Console (inspired by the Tally mobile reference): warm stone canvas, crisp white rounded cards, matte obsidian hero deck and floating pill navigation dock, vermilion signal orange accents, and dot-matrix playback indicators.
- **Dials**: `ENERGY 2` (tactile contrast between warm stone, pure white, matte black, and vermilion) / `RHYTHM 2` (matte black hero deck + 2-card bento status row + 2-column pad grid + pill library list) / `MOTION 1` (140ms state feedback only; zero decorative loops; honors `prefers-reduced-motion`).

## Palette (R-25, R-29)
- **Arena Light (default)**:
  - Canvas `#EFEFED`, Surface `#FFFFFF`, Subtle `#E5E5E2`, Primary Ink `#111111` (18.88:1 on white, 16.40:1 on stone), Secondary Ink `#555552` (6.50:1 on stone) / `#595956` (7.03:1 on white)
  - Matte Obsidian Hero/Dock `#111111` with White `#FFFFFF` (18.88:1) and Stone Muted `#A3A39E` (7.45:1)
  - Vermilion Signal `#EE4D22` (icons, switch track, active dot, dot-matrix lit bars; `#111111` on `#EE4D22` = 5.14:1), Button Vermilion `#D63E16` (4.61:1 w/ white), Text Vermilion `#C43611` (5.41:1 on white), Vermilion Tint `#FDEEE9` / `#A82D0D` (6.10:1)
- **Booth Dark (toggle)**:
  - Canvas `#0B0B0B`, Surface `#161616`, Subtle `#222220`, Primary Ink `#F5F5F3` (16.58:1 on surface), Secondary Ink `#A1A19C` (6.97:1 on surface)
  - Active Pill `#F5F5F3` with `#111111` text (17.30:1), Button Vermilion `#D63E16` (4.61:1 w/ white), Text Vermilion `#FF7A52` (7.03:1), Vermilion Tint `#2E1711` / `#FF8C69` (7.38:1)

## Typography (R-06)
- **Primary UI**: `Geist` — clean geometric neo-grotesque with two-tone heading hierarchy (`#111111` + `#555552` muted weight) and crisp tabular alignment.
- **Technical readouts**: `Geist Mono` with `font-variant-numeric: tabular-nums` — strictly for timecodes, pad counts, shortcut keycaps, and byte sizes.

## Design Decisions (R-31)
- **Mobile Hero Live Deck + Floating Pill Dock**: On mobile Quick Pad, the matte-black hero card owns live BGM/SFX readout, 24-dot matrix scrubber, Play/Pause, Fade Out, Mixer, and STOP, eliminating duplicate bottom bars while keeping the 5-slot floating obsidian pill dock (with center vermilion Play/Stop action) anchored above safe areas.
- **2-Card Bento Status Row**: Pairs the Auto-Duck BGM switch card (flips obsidian when active with vermilion pill toggle) alongside the Quick Pad count/dot-matrix/Atur Pad card.
- **Tactile Rounded Geometry**: `24px` hero card, `20px` bento/pad cards, `18px` track rows, and `999px` pill segmented filters and floating dock, maintaining `44x44px` minimum touch targets.
