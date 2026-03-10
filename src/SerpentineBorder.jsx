import { useEffect, useRef, useState } from 'react'

// Vertical SVG offset: choose so that SVG y-coordinates used for
// section junctions (the Y[] values) map 1:1 to wrapper coordinates.
// With viewBox y-origin at -2 * STROKE_WIDTH, setting TOP_OFFSET to
// 2 * STROKE_WIDTH makes screenY == svgY for all Y-based math below.
// Shift so the horizontal band at each turn is centered on the section junction (yCurr)
// Shift applied only to the top entry arc so the middle stripe's first horizontal
// is at Y[0]; junction math is unchanged. Equals (middle stripe's o) + Y_OFFSET.

// Overlap is applied to both sides: BORDER_EXTRA (overlapPerSide) px on left and right.
function buildPathD(W, Y, N, R, STROKE_WIDTH, COLORS, TOP_ARC_SHIFT, Y_OFFSET, O_TOTAL, BORDER_EXTRA) {
  const R1 = STROKE_WIDTH * (N - 1)
  const RIGHT_EXTEND = STROKE_WIDTH / 2
  const n = Y.length - 1
  const parts = []
  for (let i = 0; i < N; i++) {
    const o = i * STROKE_WIDTH
    const j = N - 1 - i
    const oj = j * STROKE_WIDTH
    const r  = R - o   // radius when stripe i is the outer/reference stripe
    const rj = R - oj  // radius when stripe i is the inner/flipped stripe
    const r1  = R1 - o   // radius when stripe i is the outer/reference stripe
    const rj1 = R1 - oj  // radius when stripe i is the inner/flipped stripe

    // Positive BORDER_EXTRA: border extends past [0,W]. Negative: border recedes. Same formula for both.
    const leftOffset = O_TOTAL - BORDER_EXTRA + RIGHT_EXTEND
    const xLeft = o - O_TOTAL + leftOffset
    const rightExt = BORDER_EXTRA
    const xRight = W + rightExt - oj - RIGHT_EXTEND
    const xLeftArc = xLeft + (R - o)
    const xRightArc = W + rightExt - R - RIGHT_EXTEND
    const xRightR1 = W + rightExt - R1 - RIGHT_EXTEND

    // yExit: the y-coordinate where arc-2 exits at each turn
    // Derived: cy = yCurr + R - O_TOTAL (fixed for all stripes at any turn)
    // so exit y = cy = yCurr + R - O_TOTAL

    const yCurrTop = O_TOTAL + Y_OFFSET
    const segs = [
      `M ${xRight} ${yCurrTop - R1 - STROKE_WIDTH / 2 - TOP_ARC_SHIFT}`,
      `L ${xRight} ${yCurrTop - R1 - TOP_ARC_SHIFT}`,
      `A ${rj1} ${rj1} 0 0 1 ${xRightR1} ${yCurrTop - oj - TOP_ARC_SHIFT}`,
      `L ${xLeftArc} ${o + Y_OFFSET - TOP_ARC_SHIFT}`,
      `A ${r} ${r} 0 0 0 ${xLeft} ${R + Y_OFFSET - TOP_ARC_SHIFT}`,
      `L ${xLeft} ${R + Y_OFFSET}`,
    ]

    for (let t = 0; t < n - 1; t++) {
      const yCurr = Y[t + 1]
      const yNext = Y[t + 2]
      const yExit = yCurr + R - O_TOTAL + Y_OFFSET  // fixed exit y for arc-2 of this turn

      if (t % 2 === 0) {
        // Even turn: left vertical (x=o)  right vertical (x=Wr-oj)
        segs.push(`L ${xLeft} ${yCurr - R + Y_OFFSET}`)
        segs.push(`A ${r}  ${r}  0 0 0 ${xLeftArc}      ${yCurr - o + Y_OFFSET}`)   // DOWN RIGHT, center (R, yCurr-R)
        segs.push(`L ${xRightArc} ${yCurr - o + Y_OFFSET}`)
        segs.push(`A ${rj} ${rj} 0 0 1 ${xRight} ${yExit}`)      // RIGHT DOWN, center (Wr-R, yExit)
        segs.push(`L ${xRight} ${yNext - R + Y_OFFSET}`)
      } else {
        // Odd turn: right vertical (x=Wr-oj)  left vertical (x=o)
        segs.push(`L ${xRight} ${yCurr - R + Y_OFFSET}`)
        segs.push(`A ${rj} ${rj} 0 0 1 ${xRightArc} ${yCurr - oj + Y_OFFSET}`)  // DOWN LEFT,  center (Wr-R, yCurr-R)
        segs.push(`L ${xLeftArc} ${yCurr - oj + Y_OFFSET}`)
        segs.push(`A ${r}  ${r}  0 0 0 ${xLeft}      ${yExit}`)        // LEFT DOWN,  center (R, yExit)
        segs.push(`L ${xLeft} ${yNext - R + Y_OFFSET}`)
      }
    }

    // End path at content bottom so border is flush with last section
    const lastY = Y[n]
    if ((n - 2) % 2 === 0) {
      segs.push(`L ${xRight} ${lastY}`)  // ended on right vertical
    } else {
      segs.push(`L ${xLeft} ${lastY}`)         // ended on left vertical
    }
    parts.push({ d: segs.join(' '), color: COLORS[i % COLORS.length] })
  }
  return parts
}

function resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH) {
  if (typeof horizontalOverlap === 'number') return horizontalOverlap
  const totalBorderWidth = N * STROKE_WIDTH
  if (horizontalOverlap === 'borderWidth') return totalBorderWidth
  if (horizontalOverlap === 'halfBorderWidth') return totalBorderWidth / 2
  return 0
}

function getLayoutStyles(layoutMode, horizontalOverlap, strokeCount, strokeWidth) {
  const N = strokeCount
  const STROKE_WIDTH = strokeWidth
  const BORDER_EXTRA = resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH)
  const TOTAL_BORDER_WIDTH = N * STROKE_WIDTH
  const wrapperStyle =
    layoutMode === 'border'
      ? {
          boxSizing: 'border-box',
          marginTop: TOTAL_BORDER_WIDTH / 2,
          ...(BORDER_EXTRA > 0 && {
            paddingLeft: BORDER_EXTRA,
            paddingRight: BORDER_EXTRA,
          }),
        }
      : { boxSizing: 'border-box' }
  const O_TOTAL = (N - 1) * STROKE_WIDTH
  const TOP_OFFSET = 2 * STROKE_WIDTH
  const TOP_ARC_SHIFT = ((N - 1) / 2) * STROKE_WIDTH + O_TOTAL / 2
  const svgStyle =
    layoutMode === 'border'
      ? {
          width: '100%',
          left: 0,
          top: -(TOP_OFFSET + TOP_ARC_SHIFT),
          height: `calc(100% + ${TOP_OFFSET + TOP_ARC_SHIFT}px)`,
        }
      : {
          width: `calc(100% + ${2 * BORDER_EXTRA}px)`,
          left: -BORDER_EXTRA,
          top: -(TOP_OFFSET + TOP_ARC_SHIFT),
          height: `calc(100% + ${TOP_OFFSET + TOP_ARC_SHIFT}px)`,
        }
  return { wrapperStyle, svgStyle, BORDER_EXTRA, viewBoxMinX: BORDER_EXTRA > 0 ? -BORDER_EXTRA : 0 }
}

function SerpentineBorder({
  children,
  strokeCount = 5,
  strokeWidth = 8,
  radius = 50,
  horizontalOverlap = 0,
  colors = ['#561d25', '#ce8147', '#ecdd7b', '#68b0ab', '#696d7d'],
  // 'content': sections define layout box (original behavior, border may overflow)
  // 'border': outer border edge defines layout box (current behavior)
  layoutMode = 'content',
}) {
  const N = strokeCount
  const STROKE_WIDTH = strokeWidth
  const R = radius
  // Overlap is per-side; total extra width = 2 * overlapPerSide
  const BORDER_EXTRA = resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH)
  const COLORS = colors

  const O_TOTAL = (N - 1) * STROKE_WIDTH
  const TOP_OFFSET = 2 * STROKE_WIDTH
  const Y_OFFSET = O_TOTAL / 2
  const TOP_ARC_SHIFT = ((N - 1) / 2) * STROKE_WIDTH + Y_OFFSET
  const TOTAL_BORDER_WIDTH = N * STROKE_WIDTH
  const wrapperRef = useRef(null)
  const [paths, setPaths] = useState([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const measure = () => {
      // Use direct children but exclude our own SVG (injected first)
      const sections = Array.from(wrapper.children).filter(
        (el) => !el.classList.contains('serpentine-border-svg')
      )
      if (sections.length === 0) return
      const rect = wrapper.getBoundingClientRect()
      const baseWidth = rect.width

      const W =
        layoutMode === 'border'
          ? Math.max(1, baseWidth - 2 * BORDER_EXTRA)
          : Math.max(1, baseWidth)
      const Y = [0]
      for (let i = 0; i < sections.length; i++) {
        const r = sections[i].getBoundingClientRect()
        Y.push((r.top - rect.top) + r.height)
      }
      const totalHeight = Y[Y.length - 1]
      const totalWidth =
        layoutMode === 'border'
          ? Math.max(1, W + 2 * BORDER_EXTRA)
          : Math.max(1, W + 2 * BORDER_EXTRA)
      setDimensions({ width: totalWidth, height: totalHeight })
      setPaths(buildPathD(W, Y, N, R, STROKE_WIDTH, COLORS, TOP_ARC_SHIFT, Y_OFFSET, O_TOTAL, BORDER_EXTRA))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [children, N, STROKE_WIDTH, R, BORDER_EXTRA, COLORS, layoutMode])

  const RIGHT_EXTEND = STROKE_WIDTH / 2
  const viewBoxMinX = BORDER_EXTRA > 0 ? -BORDER_EXTRA : 0
  const viewBoxWidth = dimensions.width
  const viewBoxHeight = dimensions.height + TOP_OFFSET + TOP_ARC_SHIFT

  const wrapperStyle =
    layoutMode === 'border'
      ? {
          position: 'relative',
          boxSizing: 'border-box',
          marginTop: TOTAL_BORDER_WIDTH / 2,
          ...(BORDER_EXTRA > 0 && {
            paddingLeft: BORDER_EXTRA,
            paddingRight: BORDER_EXTRA,
          }),
        }
      : {
          position: 'relative',
          boxSizing: 'border-box',
        }

  const svgStyle =
    layoutMode === 'border'
      ? {
          position: 'absolute',
          width: '100%',
          left: 0,
          top: -(TOP_OFFSET + TOP_ARC_SHIFT),
          height: `calc(100% + ${TOP_OFFSET + TOP_ARC_SHIFT}px)`,
        }
      : {
          position: 'absolute',
          width: `calc(100% + ${2 * BORDER_EXTRA}px)`,
          left: -BORDER_EXTRA,
          top: -(TOP_OFFSET + TOP_ARC_SHIFT),
          height: `calc(100% + ${TOP_OFFSET + TOP_ARC_SHIFT}px)`,
        }

  return (
    <div ref={wrapperRef} className="serpentine-wrapper" style={wrapperStyle} data-testid="serpentine-wrapper">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <svg
          className="serpentine-border-svg"
          data-testid="serpentine-svg"
          style={{ ...svgStyle, overflow: 'hidden' }}
          viewBox={`${viewBoxMinX} ${-STROKE_WIDTH * 2 - TOP_ARC_SHIFT} ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {paths.map(({ d, color }, i) => (
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
