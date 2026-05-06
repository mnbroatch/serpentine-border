import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getWrapperBoxStyle, measureSections, serpentineBorder } from './serpentineCore.js'

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

/** Ignore subpixel / float noise from getBoundingClientRect so ResizeObserver does not thrash setState. */
function measurementCloseEnough(a, b, eps = 0.75) {
  if (!a || !b) return false
  if (Math.abs(a.width - b.width) > eps) return false
  if (a.sectionBottomYs.length !== b.sectionBottomYs.length) return false
  for (let i = 0; i < a.sectionBottomYs.length; i++) {
    if (Math.abs(a.sectionBottomYs[i] - b.sectionBottomYs[i]) > eps) return false
  }
  return true
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
  const lastMeasuredRef = useRef(null)
  const [borderData, setBorderData] = useState(null)

  const wrapperStyle = useMemo(
    () =>
      getWrapperBoxStyle({
        strokeCount,
        strokeWidth,
        horizontalOverflow,
        layoutMode,
      }),
    [strokeCount, strokeWidth, horizontalOverflow, layoutMode]
  )

  useLayoutEffect(() => {
    lastMeasuredRef.current = null
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

      const prev = lastMeasuredRef.current
      if (prev && measurementCloseEnough(prev, measured)) {
        return
      }
      lastMeasuredRef.current = {
        width: measured.width,
        sectionBottomYs: [...measured.sectionBottomYs],
      }

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
      style={wrapperStyle}
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
            preserveAspectRatio="none"
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
