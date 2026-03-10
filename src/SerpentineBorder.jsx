import { useEffect, useRef, useState } from 'react'
import {
  computeSerpentineBorder,
  getLayoutStyles,
  measureSections,
  resolveOverlapToPixels,
} from './serpentineCore.js'

function SerpentineBorder({
  children,
  strokeCount = 5,
  strokeWidth = 8,
  radius = 50,
  horizontalOverlap = 0,
  colors = ['#561d25', '#ce8147', '#ecdd7b', '#68b0ab', '#696d7d'],
  layoutMode = 'content',
}) {
  const N = strokeCount
  const STROKE_WIDTH = strokeWidth
  const R = radius
  const BORDER_EXTRA = resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH)
  const COLORS = colors

  const wrapperRef = useRef(null)
  const [result, setResult] = useState(null)
  const layoutStyles = getLayoutStyles(layoutMode, BORDER_EXTRA, N, STROKE_WIDTH)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const measure = () => {
      const measured = measureSections(wrapper, {
        layoutMode,
        horizontalOverlapPx: BORDER_EXTRA,
        isSectionElement: (el) => !el.classList.contains('serpentine-border-svg'),
      })
      if (!measured) return

      const { width, sectionBottomYs, totalWidth, totalHeight } = measured
      const computed = computeSerpentineBorder({
        width,
        sectionBottomYs,
        strokeCount: N,
        strokeWidth: STROKE_WIDTH,
        radius: R,
        horizontalOverlapPx: BORDER_EXTRA,
        colors: COLORS,
      })
      setResult({
        paths: computed.paths,
        viewBox: computed.viewBox,
        totalWidth,
        totalHeight,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [children, N, STROKE_WIDTH, R, BORDER_EXTRA, COLORS, layoutMode])

  const wrapperStyle = {
    position: 'relative',
    ...layoutStyles.wrapperStyle,
  }

  const svgStyle = {
    position: 'absolute',
    overflow: 'hidden',
    ...layoutStyles.svgStyle,
  }

  const viewBox = result?.viewBox
  const viewBoxStr =
    viewBox &&
    `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`

  return (
    <div
      ref={wrapperRef}
      className="serpentine-wrapper"
      style={wrapperStyle}
      data-testid="serpentine-wrapper"
    >
      {result && result.totalWidth > 0 && result.totalHeight > 0 && (
        <svg
          className="serpentine-border-svg"
          data-testid="serpentine-svg"
          style={svgStyle}
          viewBox={viewBoxStr}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {result.paths.map(({ d, color }, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={STROKE_WIDTH}
            />
          ))}
        </svg>
      )}
      {children}
    </div>
  )
}

export default SerpentineBorder
