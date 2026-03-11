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
const { wrapperStyle, svgAttributes, paths } = result
Object.assign(wrapperEl.style, wrapperStyle)
// Optionally: getSectionsPadding({ sectionCount: n, strokeCount, strokeWidth, horizontalOverflow }) for per-section padding

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

Returns `wrapperStyle`, `svgAttributes` (class, viewBox, style), and `paths`. Pass either `wrapperEl` (measures from the DOM; returns `null` when DOM is unavailable, e.g. SSR) or `width` + `sectionBottomYs` (pure; never returns null). Use **`getSectionsPadding({ sectionCount, strokeCount, strokeWidth, horizontalOverflow })`** for `{ even, odd, last }` — padding objects for even-indexed sections, odd-indexed sections, and the last section so content does not overlap the border.

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

### getSectionsPadding(options)

Returns `{ even, odd, last }` — each is a `{ top, right, bottom, left }` (px) padding object. Use `even` for even-indexed sections (0, 2, …), `odd` for odd-indexed sections (1, 3, …), and `last` for the final section (which has `bottom: 0`). Use the same `strokeCount`, `strokeWidth`, and `horizontalOverflow` as your border; `sectionCount` is the number of sections (e.g. `sectionBottomYs.length - 1`). Handy with the React component: call with the section count and props, then apply `even`/`odd`/`last` to the corresponding section elements.

| Option | Type | Description |
|--------|------|-------------|
| `sectionCount` | `number` | Number of sections. |
| `strokeCount` | `number` | Same as serpentineBorder. |
| `strokeWidth` | `number` | Same as serpentineBorder. |
| `horizontalOverflow` | `number \| 'borderWidth' \| 'halfBorderWidth'` | Same as serpentineBorder. |

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
