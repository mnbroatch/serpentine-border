# react-serpentine-border

A multi-stroke serpentine (wavy) border drawn with SVG. Use from vanilla JS or as a React component.

## Install

```bash
npm install react-serpentine-border
```

## Usage

Pass a wrapper element; the border is computed from the measured heights of its children.

```js
import { serpentineBorder } from 'react-serpentine-border'

const wrapper = document.getElementById('wrapper')
const result = serpentineBorder({ wrapperEl: wrapper })
if (result) {
  Object.assign(wrapper.style, result.wrapperStyle)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  if (result.svgAttributes.class) svg.setAttribute('class', result.svgAttributes.class)
  svg.setAttribute('viewBox', result.svgAttributes.viewBox)
  Object.assign(svg.style, result.svgAttributes.style)
  result.paths.forEach((p) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', p.d)
    path.setAttribute('stroke', p.stroke)
    path.setAttribute('stroke-width', String(p.strokeWidth))
    path.setAttribute('fill', p.fill)
    svg.appendChild(path)
  })
  wrapper.insertBefore(svg, wrapper.firstChild)
}
```

## API

### serpentineBorder(options)

Returns `wrapperStyle`, `svgAttributes` (class, viewBox, style), and `paths`. Pass either `wrapperEl` (measures from the DOM; returns `null` when DOM is unavailable, e.g. SSR) or `width` + `sectionBottomYs` (pure; never returns null).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wrapperEl` | `HTMLElement` | — | Measure width and section heights from this element. Omit for pure/SSR. |
| `width` | `number` | — | Content width in px (use with `sectionBottomYs`). |
| `sectionBottomYs` | `number[]` | — | Cumulative section bottom Y coordinates. |
| `strokeCount` | `number` | `5` | Number of parallel strokes. |
| `strokeWidth` | `number` | `8` | Width of each stroke in px. |
| `radius` | `number` | `50` | Radius of the wavy turns in px. |
| `horizontalOverlap` | `number \| 'borderWidth' \| 'halfBorderWidth'` | `0` | Extra width per side (px or keyword). |
| `colors` | `string[]` | `['#ffffff', '#000000']` | Stroke colors (hex/CSS). |
| `layoutMode` | `'content' \| 'border'` | `'content'` | `'content'`: layout from content; `'border'`: outer border edge defines box. |
| `svgClassName` | `string` | `'serpentine-border-svg'` | Class applied to the SVG (and used to exclude it when measuring). |

### measureSections(wrapperEl, options)

Measures a wrapper and its section children; returns `{ width, sectionBottomYs }` or `null`. Options: `layoutMode`, `horizontalOverlap`, `strokeCount`, `strokeWidth`, and optional `excludeClassName` (default: same as `serpentineBorder`’s `svgClassName`). Use when you want to measure once and pass dimensions into `serpentineBorder`, or in environments without a DOM.

### React: SerpentineBorder

Wrap your content with the React component; it accepts the same options as `serpentineBorder` as props.

```jsx
import { SerpentineBorder } from 'react-serpentine-border'

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

## Explicit dimensions and SSR

When you need to measure once and reuse, or run without a DOM (SSR, workers), use `measureSections` then call `serpentineBorder` with `width` and `sectionBottomYs`:

```js
import { measureSections, serpentineBorder } from 'react-serpentine-border'

const wrapper = document.getElementById('wrapper')
const measured = measureSections(wrapper, {
  layoutMode: 'content',
  horizontalOverlap: 20,
  strokeCount: 5,
  strokeWidth: 8,
})
if (measured) {
  const result = serpentineBorder({
    width: measured.width,
    sectionBottomYs: measured.sectionBottomYs,
    horizontalOverlap: 20,
  })
  if (result) {
    // Apply result.wrapperStyle, result.svgAttributes, result.paths
  }
}
```

## License

MIT
