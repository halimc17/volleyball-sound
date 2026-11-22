# VolleyBeats Design System

## Identity & Mode
- **Surface mode**: Operate (`impeccable` Operate mode). VolleyBeats is a live volleyball match soundboard and music library for court audio operators on phones, tablets, and laptops.
- **Dials**: `ENERGY 2` (crisp, purposeful stadium broadcast authority) / `RHYTHM 2` (structured operational deck + tactile Quick Pad grid + scannable track rows) / `MOTION 1` (150ms state feedback and active audio meter only; zero decorative loops; honors `prefers-reduced-motion`).

## Palette: Mikasa Court Pro (R-25, R-29)
- **Arena Light (default)**: Canvas `#EEF3FA`, Surface `#FFFFFF`, Subtle surface `#E3ECF8`, Primary Ink `#0A1931` (17.55:1), Secondary Ink `#3B4E6B` (8.44:1), Court Blue `#0046AD` (8.47:1 w/ white, header + active controls), Match Gold `#FACC15` (header court stripe + SFX badge tint `#FEF3C7` / `#784700`, 6.99:1), Live Crimson `#C81E2B` (5.71:1 w/ white, active playing state + Auto-Duck `DUCK` + Stop All).
- **Booth Dark (toggle)**: Canvas `#08101D`, Surface `#101C2F`, Subtle `#182842`, Primary Ink `#F2F6FC` (15.75:1), Secondary Ink `#9DB3D1` (7.97:1), Match Gold `#FACC15` primary controls with dark ink `#08101D` (12.44:1), Court Blue tint `#132B4F` / `#93C5FD` for BGM tags, Live Crimson `#C81E2B` (5.71:1 w/ white).

## Typography (R-06)
- **Primary UI**: `Plus Jakarta Sans` — selected for crisp Indonesian and Latin legibility in bright gymnasium lighting across narrow phone screens and desktop consoles.
- **Technical readouts**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` — strictly for timecodes (`00:18 / 01:42`), shortcut keycaps (`Shift+A`), and byte/track counts.

## Design Decisions (R-31)
- **Dual-channel sticky transport deck**: Separates BGM playlist playback from instant SFX cues so operators can fire Ace/Spike/Block hits over background music with optional auto-ducking and one-tap Fade Out / Stop All.
- **Mobile-first bottom navigation + dedicated Quick Pad**: On phones, primary destinations (Quick Pad, Library, Favorit, Script MC) sit in a thumb-reachable bottom bar while the sticky mini-deck reserves bottom scroll padding so no track row is obscured.
- **Three responsive layout states**: Single-column mobile (< 640px), two-column tablet (640px-1023px), and desktop console with persistent category rail + right-hand Quick Pad / MC Script panel (>= 1024px).
- **Consistent 1.75px authored SVG icons**: Zero emojis or mixed libraries; custom geometric audio/volleyball glyphs for instant recognition at 44px+ touch targets.
