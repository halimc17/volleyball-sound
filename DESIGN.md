# VSOUND Design System

## Identity & Mode
- **Surface mode**: Operate (`impeccable` Operate mode). VSOUND is a live volleyball match soundboard and music library for court audio operators on phones, tablets, and laptops.
- **Dials**: `ENERGY 2` (crisp, purposeful stadium broadcast authority) / `RHYTHM 2` (structured operational deck + tactile Quick Pad grid + scannable track rows) / `MOTION 1` (150ms state feedback and active audio meter only; zero decorative loops; honors `prefers-reduced-motion`).

## Palette (R-25, R-29)
- **Arena Light (default)**: Canvas `#F4F6F9`, Surface `#FFFFFF`, Subtle surface `#E9EEF5`, Primary Ink `#0B1A2E` (17.48:1), Secondary Ink `#46566E` (7.46:1), PBVSI Navy `#0A2540` (15.54:1 w/ white), Court Crimson accent `#C1121F` (6.22:1 w/ white, used only for live playback state, SFX triggers, and Stop All).
- **Booth Dark (toggle)**: Canvas `#0B111B`, Surface `#131C2B`, Subtle `#1C283B`, Primary Ink `#F1F5F9` (15.60:1), Secondary Ink `#9FB0C7` (7.74:1), Crimson `#C81E2B` (5.71:1 w/ white), Crimson text `#FF7A85` (6.82:1).

## Typography (R-06)
- **Primary UI**: `Plus Jakarta Sans` — selected for crisp Indonesian and Latin legibility in bright gymnasium lighting across narrow phone screens and desktop consoles.
- **Technical readouts**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` — strictly for timecodes (`00:18 / 01:42`), shortcut keycaps (`Shift+A`), and byte/track counts.

## Design Decisions (R-31)
- **Dual-channel sticky transport deck**: Separates BGM playlist playback from instant SFX cues so operators can fire Ace/Spike/Block hits over background music with optional auto-ducking and one-tap Fade Out / Stop All.
- **Mobile-first bottom navigation + dedicated Quick Pad**: On phones, primary destinations (Quick Pad, Library, Favorit, Script MC) sit in a thumb-reachable bottom bar while the sticky mini-deck reserves bottom scroll padding so no track row is obscured.
- **Three responsive layout states**: Single-column mobile (< 640px), two-column tablet (640px-1023px), and desktop console with persistent category rail + right-hand Quick Pad / MC Script panel (>= 1024px).
- **Consistent 1.75px authored SVG icons**: Zero emojis or mixed libraries; custom geometric audio/volleyball glyphs for instant recognition at 44px+ touch targets.
