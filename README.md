# SVG Zoom Viewer

SVG Zoom Viewer is an Obsidian desktop plugin that opens SVG and common image embeds in a dedicated zoomable view.

## Features

- Double-click an embedded image in reading view to open it in a dedicated leaf.
- Zoom with the mouse wheel.
- Drag to pan.
- Double-click inside the viewer to reset the transform.
- Supports `svg`, `png`, `jpg`, `jpeg`, `webp`, and `gif`.

SVG files are rendered in an `iframe` so they stay closer to native vector rendering than a regular `<img>` tag.

## Installation

### Community plugins

After this plugin is approved in the Obsidian community plugin directory, install it from **Settings -> Community plugins -> Browse**.

### Manual installation

1. Download `manifest.json`, `main.js`, and `styles.css` from the matching GitHub release.
2. Copy them into `.obsidian/plugins/svg-zoom-viewer/` inside your vault.
3. Reload Obsidian.
4. Enable `SVG Zoom Viewer` in **Settings -> Community plugins**.

## Repository layout

```text
svg-zoom-viewer/
  manifest.json
  main.js
  styles.css
  versions.json
  README.md
  LICENSE
```

## Privacy and disclosures

- Desktop only.
- No network requests.
- No telemetry, tracking, analytics, or ads.
- No external service account required.
- No external file access outside what Obsidian already loads for embedded images in your vault.

## Notes

- SVG rendering quality still depends on how Obsidian and Electron serve the source URL.
- If some SVGs still look rasterized, a future version can switch to inlining SVG markup instead of loading by URL.
