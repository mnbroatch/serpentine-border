import { useEffect, useRef, useState } from 'react'
import { measureSections, serpentineBorder } from './serpentineCore.js'

function SerpentineBorder({
  children,
  strokeCount,
  strokeWidth,
  radius,
  horizontalOverlap,
  colors,
  layoutMode,
}) {
  const wrapperRef = useRef(null)
  const [borderData, setBorderData] = useState(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const measure = () => {
      const measured = measureSections(wrapper, {
        layoutMode,
        horizontalOverlap,
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
        horizontalOverlap,
        colors,
        layoutMode,
      })
      setBorderData(data)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [strokeCount, strokeWidth, radius, horizontalOverlap, colors, layoutMode])

  return (
    <div
      ref={wrapperRef}
      className="serpentine-wrapper"
      style={borderData?.wrapperStyle ?? { position: 'relative', boxSizing: 'border-box' }}
      data-testid="serpentine-wrapper"
    >
      {borderData && (() => {
        const { class: className, ...restSvgAttrs } = borderData.svgAttributes
        return (
          <svg
            data-testid="serpentine-svg"
            className={className}
            {...restSvgAttrs}
          >
            {borderData.paths.map((pathAttributes, i) => (
              <path key={i} {...pathAttributes} />
            ))}
          </svg>
        )
      })()}
      {children}
    </div>
  )
}

export default SerpentineBorder
