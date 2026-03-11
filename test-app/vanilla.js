import { serpentineBorder } from 'serpentine-border'

function setAttributes(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue
    el.setAttribute(key, String(value))
  }
}

function parseParams() {
  const q = new URLSearchParams(window.location.search)
  return {
    layoutMode: q.get('layout') || 'border',
    horizontalOverlap: Number(q.get('overlap')) || 20,
    strokeWidth: Number(q.get('strokeWidth')) || 8,
    strokeCount: Number(q.get('strokeCount')) || 5,
    radius: Number(q.get('radius')) || 50,
  }
}

const params = parseParams()
const root = document.getElementById('root')

const fixture = document.createElement('div')
fixture.className = 'fixture'
fixture.setAttribute('data-testid', 'fixture')
fixture.setAttribute('data-layout-mode', params.layoutMode)

const wrapper = document.createElement('div')
wrapper.className = 'serpentine-wrapper'
wrapper.setAttribute('data-testid', 'serpentine-wrapper')

const section0 = document.createElement('div')
section0.className = 'section'
section0.setAttribute('data-testid', 'section-0')
section0.textContent = 'Section A'

const section1 = document.createElement('div')
section1.className = 'section'
section1.setAttribute('data-testid', 'section-1')
section1.textContent = 'Section B'

wrapper.appendChild(section0)
wrapper.appendChild(section1)
fixture.appendChild(wrapper)
root.appendChild(fixture)

const result = serpentineBorder({
  wrapperEl: wrapper,
  ...params,
})
const { wrapperStyle, svgAttributes, paths } = result
Object.assign(wrapper.style, wrapperStyle)

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
setAttributes(svg, svgAttributes)
svg.setAttribute('data-testid', 'serpentine-svg')

for (const p of paths) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  setAttributes(path, p)
  svg.appendChild(path)
}
wrapper.insertBefore(svg, wrapper.firstChild)
