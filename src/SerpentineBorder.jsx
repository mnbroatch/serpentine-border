import { useLayoutEffect, useRef, useState } from 'react'
import { measureSections, serpentineBorder } from './serpentineCore.js'

function cssStringToStyleObject(css) {
  const obj = {}
  if (!css || typeof css !== 'string') return obj
  for (const decl of css.split(';')) {
    const colon = decl.indexOf(':')
    if (colon === -1) continue
    const key = decl.slice(0, colon).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const value = decl.slice(colon + 1).trim()
    if (key) obj[key] = value
  }
  return obj
}

function pathAttrsForReact(attrs) {
  return Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => [k === 'stroke-width' ? 'strokeWidth' : k, v])
  )
}

function SerpentineBorder({
  children,
  strokeCount,
  strokeWidth,
  radius,
  horizontalOverflow,
  colors,
  layoutMode,
}) {
  const wrapperRef = useRef(null)
  const [borderData, setBorderData] = useState(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const measure = () => {
      const measured = measureSections(wrapper, {
        layoutMode,
        horizontalOverflow,
        strokeCount,
        strokeWidth,
      })
      if (!measured) return

      const data = serpentineBorder({
        width: measured.width,
        sectionBottomYs: measured.sectionBottomYs,
        strokeCount,
        strokeWidth,
        radius,
        horizontalOverflow,
        colors,
        layoutMode,
      })
      setBorderData(data)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [strokeCount, strokeWidth, radius, horizontalOverflow, colors, layoutMode])

  return (
    <div
      ref={wrapperRef}
      className="serpentine-wrapper"
      style={borderData?.wrapperStyle ?? { position: 'relative', boxSizing: 'border-box' }}
      data-testid="serpentine-wrapper"
    >
      {borderData && (() => {
        const { class: className, style: styleStr, ...restSvgAttrs } = borderData.svgAttributes
        const style = typeof styleStr === 'string' ? cssStringToStyleObject(styleStr) : styleStr
        return (
          <svg
            data-testid="serpentine-svg"
            className={className}
            style={style}
            {...restSvgAttrs}
          >
            {borderData.paths.map((pathAttributes, i) => (
              <path key={i} {...pathAttrsForReact(pathAttributes)} />
            ))}
          </svg>
        )
      })()}
      {children}
    </div>
  )
}

export default SerpentineBorder
