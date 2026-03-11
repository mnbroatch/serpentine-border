# serpentine-border

A multi-stroke serpentine (wavy) border drawn with SVG. Usable as a helper function for building the border in vanillaJS (see example) or as a React component.

## Install

```bash
npm install serpentine-border
```

## Usage

Pass a wrapper element; the border is computed from the measured heights of its children.

```js
import { serpentineBorder } from 'serpentine-border'

function setAttributes(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue
    el.setAttribute(key, String(value))
  }
}

const wrapperEl = document.getElementById('wrapper')
const result = serpentineBorder({ wrapperEl })
if (!result) return
const { wrapperStyle, svgAttributes, paths, sectionsPadding } = result
Object.assign(wrapperEl.style, wrapperStyle)
// Optionally apply sectionsPadding[i] to each section so content does not overlap the border

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
setAttributes(svg, svgAttributes)

for (const p of paths) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  setAttributes(path, p)
  svg.appendChild(path)
}
wrapperEl.insertBefore(svg, wrapperEl.firstChild)
```

## API

### serpentineBorder(options)

Returns `wrapperStyle`, `svgAttributes` (class, viewBox, style), `paths`, and `sectionsPadding` (array of `{ top, right, bottom, left }` padding in px for each section so content does not overlap the border). Pass either `wrapperEl` (measures from the DOM; returns `null` when DOM is unavailable, e.g. SSR) or `width` + `sectionBottomYs` (pure; never returns null).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapperEl` | `HTMLElement` | — | Measure width and section heights from this element. Omit for pure/SSR. |
| `width` | `number` | — | Content width in px (use with `sectionBottomYs`). |
| `sectionBottomYs` | `number[]` | — | Cumulative section bottom Y coordinates. |
| `strokeCount` | `number` | `5` | Number of parallel strokes. |
| `strokeWidth` | `number` | `8` | Width of each stroke in px. |
| `radius` | `number` | `50` | Radius of the wavy turns in px. |
| `horizontalOverflow` | `number \| 'borderWidth' \| 'halfBorderWidth'` | `0` | Horizontal overflow per side so the border extends past content (px or keyword). |
| `colors` | `string[]` | `['#ffffff', '#000000']` | Stroke colors (hex/CSS). |
| `layoutMode` | `'content' \| 'border'` | `'border'` | See note below. |
| `svgClassName` | `string` | `'serpentine-border-svg'` | Class applied to the SVG (and used to exclude it when measuring). |

**Layout mode:** In some instances, you may want the border to be an overlay that doesn't affect flow and content size. With `'content'`, the wrapper’s size follows its content and the border is drawn around it (the SVG can extend outside). With `'border'`, the outer edge of the border defines the box: the full border fits inside the layout, and content sits inside that box. This mode avoids the border spilling out and overlapping neighboring elements.

### React: SerpentineBorder

Wrap your content with the React component; it accepts the same options as `serpentineBorder` as props.

```jsx
import { SerpentineBorder } from 'serpentine-border'

function App() {
  return (
    <SerpentineBorder
      strokeCount={5}
      strokeWidth={8}
      radius={50}
      colors={['#ffffff', '#000000']}
    >
      <section className="section">First section</section>
      <section className="section">Second section</section>
      <section className="section">Third section</section>
    </SerpentineBorder>
  )
}
```

## SSR

When DOM is unavailable (e.g. server-side), pass `width` and `sectionBottomYs` into `serpentineBorder({ width, sectionBottomYs, ... })` instead of `wrapperEl`.

## Tests

Run `npm run test` for e2e tests. If Playwright browsers are not installed yet, run `npm run test:install-browsers` first. On Linux you may also need to install system dependencies (e.g. `sudo npx playwright install-deps`).

## License

MIT
