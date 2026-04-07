# SVG Zoom Viewer

An Obsidian desktop plugin that opens SVG and common image embeds in a dedicated view with:

- double-click to open
- wheel zoom
- drag to pan
- double-click inside the viewer to reset transform

## Current behavior

- Double-click an image in reading view.
- Supported formats: `svg`, `png`, `jpg`, `jpeg`, `webp`, `gif`
- The plugin opens a new leaf with a dedicated image viewer.
- SVG currently uses an `iframe` path so it stays closer to vector rendering than a normal image tag.

## Install locally

1. Copy `manifest.json`, `main.js`, and `styles.css` into:
   `.obsidian/plugins/svg-zoom-viewer/`
2. In Obsidian, open **Settings -> Community plugins**
3. Reload plugins or restart Obsidian
4. Enable `SVG Zoom Viewer`

## Debugging

Open Obsidian developer tools and check the console for logs prefixed with:

```text
[svg-zoom-viewer]
```

Important logs:

- `plugin load`
- `dblclick listener registered`
- `double click hit image`
- `render media as iframe`
- `render media as img`

## Repository layout

```text
svg-zoom-viewer/
  manifest.json
  main.js
  styles.css
  README.md
  LICENSE
```

## Known limitations

- This is a minimal runtime-only plugin with no build pipeline yet.
- SVG rendering quality still depends on how Obsidian/Electron serves the source URL.
- If the iframe path still looks rasterized in some cases, the next iteration should inline SVG text directly into the viewer instead of loading by URL.
