# react-serpentine-border

A React component that draws a multi-stroke serpentine (wavy) border around sections of content. The border is drawn with SVG and responds to the layout of its children.

## Install

```bash
npm install react-serpentine-border
```

## Usage

Wrap your content with `SerpentineBorder`. The border path is computed from the measured heights of its immediate children.

```jsx
import { SerpentineBorder } from 'react-serpentine-border'

function App() {
  return (
    <SerpentineBorder
      strokeCount={5}
      strokeWidth={8}
      radius={50}
      colors={['#561d25', '#ce8147', '#ecdd7b', '#68b0ab', '#696d7d']}
    >
      <section className="section">First section</section>
      <section className="section">Second section</section>
      <section className="section">Third section</section>
    </SerpentineBorder>
  )
}
```

## API

### `SerpentineBorder`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content; immediate children define segment heights for the path. |
| `strokeCount` | `number` | `5` | Number of parallel strokes. |
| `strokeWidth` | `number` | `8` | Width of each stroke in px. |
| `radius` | `number` | `50` | Radius of the wavy turns in px. |
| `horizontalOverlap` | `number \| 'borderWidth' \| 'halfBorderWidth'` | `0` | Extra width per side (px or keyword). |
| `colors` | `string[]` | (see below) | Array of stroke colors (hex/CSS). |
| `layoutMode` | `'content' \| 'border'` | `'content'` | `'content'`: layout from content; `'border'`: outer border edge defines box. |

Default `colors`: `['#561d25', '#ce8147', '#ecdd7b', '#68b0ab', '#696d7d']`.

### `DEFAULT_COLORS`

Default color array export for reuse.

### Vanilla core (no React)

The SVG path and layout logic live in a separate vanilla JS module so you can use them without React:

- **`computeSerpentineBorder(options)`** — Pure function. Given `width`, `sectionBottomYs`, and style options, returns `paths`, `viewBox`, and dimensions. Use this to render the border in any environment (custom element, Canvas, another framework).
- **`measureSections(wrapperEl, options)`** — Measures a wrapper DOM element and its section children; returns `width` and `sectionBottomYs` for `computeSerpentineBorder`. Option `isSectionElement(el)` lets you exclude nodes (e.g. the SVG) from the section list.
- **`getLayoutStyles(layoutMode, horizontalOverlapPx, strokeCount, strokeWidth)`** — Returns `wrapperStyle` and `svgStyle` objects for positioning.
- **`resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH)`** — Converts `horizontalOverlap` to pixels.
- **`buildPathD(...)`** — Low-level path builder (used by `computeSerpentineBorder`).

Example: measure once, then compute and render SVG yourself:

```js
import { computeSerpentineBorder, measureSections, resolveOverlapToPixels } from 'react-serpentine-border'

const wrapper = document.getElementById('wrapper')
const measured = measureSections(wrapper, {
  layoutMode: 'content',
  horizontalOverlapPx: resolveOverlapToPixels(20, 5, 8),
  isSectionElement: (el) => !el.classList.contains('my-border-svg'),
})
if (measured) {
  const { paths, viewBox } = computeSerpentineBorder({
    width: measured.width,
    sectionBottomYs: measured.sectionBottomYs,
    strokeCount: 5,
    strokeWidth: 8,
    radius: 50,
    horizontalOverlapPx: resolveOverlapToPixels(20, 5, 8),
    colors: ['#561d25', '#ce8147', '#ecdd7b', '#68b0ab', '#696d7d'],
  })
  // Render paths and viewBox into your SVG
}
```

## License

MIT
