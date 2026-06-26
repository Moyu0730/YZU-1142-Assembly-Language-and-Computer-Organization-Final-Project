# FloorSet PRO — Interactive EDA Floorplanner

> A browser-native, zero-dependency EDA floorplanning visualizer and constraint evaluator built to the **ICCAD 2026 Contest** problem specification.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [ICCAD 2026 Evaluation Model](#iccad-2026-evaluation-model)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
  - [Canvas Controls](#canvas-controls)
  - [Data Editor](#data-editor)
  - [JSON Format](#json-format)
  - [Settings & Themes](#settings--themes)
- [Project Structure](#project-structure)
- [Technical Architecture](#technical-architecture)
- [Block Types](#block-types)
- [Cost Function](#cost-function)
- [Academic Context](#academic-context)
- [Changelog](#changelog)

---

## Overview

**FloorSet PRO** is a professional-grade, interactive chip floorplanning tool that runs entirely in the browser. It targets the physical design stage of VLSI development — specifically the **fixed-outline floorplanning** problem — and provides real-time constraint evaluation against the ICCAD 2026 contest scoring rubric.

Users can drag soft blocks, inspect placement metrics, detect hard constraint violations (overlaps and area errors), and export or import testcase data as JSON — all without any build toolchain or server.

---

## Features

| Category | Capability |
|---|---|
| **Canvas** | Infinite pan & zoom (0.1× – 10×), sub-pixel HiDPI rendering via `devicePixelRatio` |
| **Interaction** | Drag-to-place soft blocks, snap-to-edge alignment guides, hover inspector |
| **Evaluation** | Real-time bounding-box area, HPWL wirelength, overlap detection, area constraint check |
| **Data** | In-browser block editor, JSON import/upload, JSON export |
| **Visualization** | 9 enterprise color palettes, layer visibility toggles (Soft / Hard / Nets / Grid) |
| **Status Bar** | Live cursor coordinates, feasibility indicator, contest evaluator label |

---

## ICCAD 2026 Evaluation Model

The evaluator runs on every mouse event and recomputes the following metrics:

| Metric | Description |
|---|---|
| **Bounding Box Area** | Minimum enclosing rectangle of all non-terminal blocks |
| **HPWL** | Half-perimeter wirelength, weighted by net weight: `Σ weight × (|Δx| + |Δy|)` between net endpoints |
| **Overlap** | Any pairwise axis-aligned intersection between non-terminal blocks triggers `Infeasible` |
| **Area Violation** | Soft block's actual area must be within **1%** of its `targetArea`; exceeding this triggers `Infeasible` |
| **Constraint Penalty** | `M = 10` applied when any hard constraint is violated |
| **Est. Total Cost** | See [Cost Function](#cost-function) below |

---

## Getting Started

No dependencies. No build step.

```bash
# Clone the repository
git clone <repository-url>

# Open in browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Recommended browsers: **Chrome 90+**, **Edge 90+**, **Firefox 88+**, **Safari 15+**.

---

## Usage Guide

### Canvas Controls

| Action | Input |
|---|---|
| Pan canvas | Click & drag on empty space |
| Zoom in / out | Mouse wheel, or toolbar `+` / `−` buttons |
| Zoom to fit | Click the **Recenter** (crosshair) button in the floating toolbar |
| Move a soft block | Click & drag the block |
| Inspect a block | Hover over it — details appear in the left inspector panel |
| Reset layout | Click the **Reset** (circular arrow) button in the floating toolbar |

> **Hard** and **Terminal** blocks are fixed placement constraints and cannot be dragged. Attempting to move them displays a toast notification.

### Snap Guides

While dragging, FloorSet PRO computes snap candidates from:

- Die boundary edges (`x=0`, `x=DIE_W`, `y=0`, `y=DIE_H`)
- All other blocks' left, right, top, and bottom edges

A dashed guide line appears when the dragged block aligns within the snap threshold (`10 / zoomLevel` logical units).

### Data Editor

Click **Open Data Editor** in the left panel to open the tabular block editor.

| Operation | How |
|---|---|
| Edit a field | Click any cell and type — changes are staged in memory |
| Add a block | Click **+ Add New Block** at the bottom of the table |
| Delete a block | Click the **Del** button on the row |
| Import JSON | Click **Upload JSON** and select a `.json` or `.txt` file |
| Export JSON | Click **Export JSON** to download `floorplan_data.json` |
| Apply changes | Click **Apply Settings** — updates the canvas and re-evaluates |
| Discard changes | Click **Cancel** |

### JSON Format

Import and export use a flat JSON array of block objects:

```json
[
  {
    "id": "b1",
    "x": 50,
    "y": 50,
    "w": 120,
    "h": 80,
    "targetArea": 9600,
    "type": "soft"
  },
  {
    "id": "b2",
    "x": 180,
    "y": 50,
    "w": 100,
    "h": 100,
    "targetArea": 10000,
    "type": "hard"
  },
  {
    "id": "Terminal_1",
    "x": 550,
    "y": 250,
    "w": 15,
    "h": 15,
    "targetArea": 225,
    "type": "terminal"
  }
]
```

**Field reference:**

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique block identifier |
| `x` | `number` | Left edge position (logical units, Y-up coordinate system) |
| `y` | `number` | Bottom edge position (logical units, Y-up coordinate system) |
| `w` | `number` | Width |
| `h` | `number` | Height |
| `targetArea` | `number` | Required area for soft blocks (`w × h` must be within 1% tolerance) |
| `type` | `"soft"` \| `"hard"` \| `"terminal"` | Block classification |

### Settings & Themes

Click **Settings** in the top-right to open the system preferences panel.

**Layer toggles:**

| Toggle | Controls |
|---|---|
| Soft Blocks | Visibility of movable/flexible blocks |
| Hard / Preplaced | Visibility of fixed blocks and terminals |
| Nets (HPWL) | Visibility of net connection lines |
| Infinite Grid & Axes | Visibility of the adaptive grid and axis labels |

**Color palettes (9 themes):**

| Theme | Description |
|---|---|
| High-Contrast White | Light mode; optimized for print and reports *(default)* |
| Carbon Graphite Grey | Neutral, low-glare dark canvas |
| Deep Industrial Navy | Classic engineering dark theme |
| Laboratory Green | Medical/bio visualization mode |
| Amber Sunset Glow | Warm amber on dark |
| Violet Nightshade | Deep purple dark theme |
| Quantum Blackhole | Absolute pitch-black; maximum contrast |
| Ocean Breeze Blue | Vibrant sky-blue dark theme |
| Blossoming Rose | Soft rose high-contrast dark theme |

Theme changes apply CSS custom properties via `document.documentElement.style.setProperty` for instant, flicker-free transitions across the entire UI and canvas.

---

## Project Structure

```
.
├── index.html        # Application shell, modal definitions, canvas element
├── script.js         # Rendering, interaction, evaluation, and editor logic
├── style.css         # CSS variables, layout system, component styles
└── ICCAD pC.pdf      # ICCAD 2026 contest problem specification (reference)
```

The entire application is self-contained in three files — no frameworks, no bundler, no package manager.

---

## Technical Architecture

### Rendering Pipeline

FloorSet PRO uses the **HTML5 Canvas 2D API** with a high-resolution rendering path:

```
resizeCanvas()
  ├── canvas.width  = cssWidth  × devicePixelRatio   (physical pixels)
  ├── canvas.height = cssHeight × devicePixelRatio
  └── ctx.scale(dpr, dpr)                            (normalize back to CSS px)
```

Each frame (`drawScene`) applies a transform stack:

```
ctx.translate(panX, panY)    →  world offset
ctx.scale(zoomLevel, -)      →  zoom (Y negated for Y-up coordinate system)
```

### Coordinate System

The internal coordinate system is **Y-up** (standard EDA convention). The Canvas 2D API is Y-down, so every block's render Y is computed as:

```js
const renderY = -block.y - block.h;
```

Mouse positions are inverted on read:

```js
return { x: unscaledX, y: -unscaledY };
```

### Adaptive Grid

The infinite grid uses a **nice-step algorithm** to maintain consistent visual density at any zoom level:

```js
getNiceStep(rawStep)  →  rounds to 1 / 2 / 5 × 10^n
```

Major and minor grid line intervals are recomputed each frame from current viewport extents. Labels are clipped to the visible region and rendered at axis intersections only.

### Hard Block Hatch Texture

Fixed (hard) blocks use a **diagonal hatch fill** generated on an offscreen `<canvas>`. The pattern is created with `ctx.createPattern(pCanvas, 'repeat')` and adapts its stroke opacity to the active palette's canvas background luminance (`isDarkCanvas`).

---

## Block Types

| Type | Behavior | Visual |
|---|---|---|
| **Soft** | Draggable; must satisfy `targetArea` within 1% tolerance | Translucent filled rectangle |
| **Hard** | Fixed position; cannot be moved | Diagonal hatch fill |
| **Terminal** | Fixed I/O pin; excluded from area and overlap checks | Solid filled circle |

Blocks in a violation state (overlap or area error) are rendered with a **red dashed border** and highlighted fill, using the error palette `{ f: "rgba(241,76,76,0.3)", s: "#ef4444" }`.

---

## Cost Function

When the layout is **feasible** (zero violations):

```
Cost = 0.7 + (BoundingBoxArea / 200,000) + (HPWL / 5,000)
```

When any **hard constraint is violated**:

```
Cost = M = 10   (fixed penalty constant)
```

This mirrors the ICCAD 2026 contest scoring model: infeasible solutions receive a fixed large penalty rather than a partial score, incentivizing constraint satisfaction above all else.

---

## Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

### [Unreleased]

> Changes staged but not yet tagged.

---

### [1.0.0] — 2026-06-26

#### Added
- Initial release of FloorSet PRO.
- Interactive Canvas 2D renderer with sub-pixel HiDPI support via `devicePixelRatio`.
- Infinite pan & zoom (0.1× – 10×) with mouse-wheel and toolbar controls.
- Drag-to-place for soft blocks with snap-to-edge alignment guides.
- Real-time ICCAD 2026 constraint evaluator: bounding-box area, weighted HPWL, overlap detection, and 1% area tolerance check.
- In-browser tabular data editor with add / edit / delete block operations.
- JSON import (file upload) and JSON export (`floorplan_data.json`).
- Block inspector panel showing ID, type, origin, size, and feasibility status.
- 9 enterprise color palettes with instant CSS custom-property theming.
- Layer visibility toggles for Soft, Hard, Nets, and Grid layers.
- Live cursor coordinate display and system status bar.
