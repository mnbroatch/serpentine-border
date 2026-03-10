/**
 * Vanilla JS core for serpentine border SVG generation.
 * No React dependency. Use from React via SerpentineBorder or from any other environment.
 */

/**
 * Build path 'd' and color for each stripe.
 * @param {number} W - content width
 * @param {number[]} Y - cumulative section bottom Y coordinates (Y[0]=0, Y[i]=bottom of section i)
 * @param {number} N - stroke count
 * @param {number} R - corner radius
 * @param {number} STROKE_WIDTH
 * @param {string[]} COLORS
 * @param {number} TOP_ARC_SHIFT
 * @param {number} Y_OFFSET
 * @param {number} O_TOTAL
 * @param {number} BORDER_EXTRA - horizontal overlap per side (pixels)
 * @returns {{ d: string, color: string }[]}
 */
export function buildPathD(W, Y, N, R, STROKE_WIDTH, COLORS, TOP_ARC_SHIFT, Y_OFFSET, O_TOTAL, BORDER_EXTRA) {
  const R1 = STROKE_WIDTH * (N - 1)
  const RIGHT_EXTEND = STROKE_WIDTH / 2
  const n = Y.length - 1
  const parts = []
  for (let i = 0; i < N; i++) {
    const o = i * STROKE_WIDTH
    const j = N - 1 - i
    const oj = j * STROKE_WIDTH
    const r = R - o
    const rj = R - oj
    const r1 = R1 - o
    const rj1 = R1 - oj

    const leftOffset = O_TOTAL - BORDER_EXTRA + RIGHT_EXTEND
    const xLeft = o - O_TOTAL + leftOffset
    const rightExt = BORDER_EXTRA
    const xRight = W + rightExt - oj - RIGHT_EXTEND
    const xLeftArc = xLeft + (R - o)
    const xRightArc = W + rightExt - R - RIGHT_EXTEND
    const xRightR1 = W + rightExt - R1 - RIGHT_EXTEND

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
      const yExit = yCurr + R - O_TOTAL + Y_OFFSET

      if (t % 2 === 0) {
        segs.push(`L ${xLeft} ${yCurr - R + Y_OFFSET}`)
        segs.push(`A ${r}  ${r}  0 0 0 ${xLeftArc}      ${yCurr - o + Y_OFFSET}`)
        segs.push(`L ${xRightArc} ${yCurr - o + Y_OFFSET}`)
        segs.push(`A ${rj} ${rj} 0 0 1 ${xRight} ${yExit}`)
        segs.push(`L ${xRight} ${yNext - R + Y_OFFSET}`)
      } else {
        segs.push(`L ${xRight} ${yCurr - R + Y_OFFSET}`)
        segs.push(`A ${rj} ${rj} 0 0 1 ${xRightArc} ${yCurr - oj + Y_OFFSET}`)
        segs.push(`L ${xLeftArc} ${yCurr - oj + Y_OFFSET}`)
        segs.push(`A ${r}  ${r}  0 0 0 ${xLeft}      ${yExit}`)
        segs.push(`L ${xLeft} ${yNext - R + Y_OFFSET}`)
      }
    }

    const lastY = Y[n]
    if ((n - 2) % 2 === 0) {
      segs.push(`L ${xRight} ${lastY}`)
    } else {
      segs.push(`L ${xLeft} ${lastY}`)
    }
    parts.push({ d: segs.join(' '), color: COLORS[i % COLORS.length] })
  }
  return parts
}

/**
 * Resolve horizontalOverlap to pixels.
 * @param {number | 'borderWidth' | 'halfBorderWidth'} horizontalOverlap
 * @param {number} N - stroke count
 * @param {number} STROKE_WIDTH
 * @returns {number}
 */
export function resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH) {
  if (typeof horizontalOverlap === 'number') return horizontalOverlap
  const totalBorderWidth = N * STROKE_WIDTH
  if (horizontalOverlap === 'borderWidth') return totalBorderWidth
  if (horizontalOverlap === 'halfBorderWidth') return totalBorderWidth / 2
  return 0
}

/**
 * Compute layout style objects for wrapper and SVG (no React dependency).
 * @param {'content' | 'border'} layoutMode
 * @param {number} horizontalOverlapPx - result of resolveOverlapToPixels
 * @param {number} strokeCount
 * @param {number} strokeWidth
 * @returns {{ wrapperStyle: Record<string, unknown>, svgStyle: Record<string, unknown>, BORDER_EXTRA: number, viewBoxMinX: number, TOP_OFFSET: number, TOP_ARC_SHIFT: number }}
 */
export function getLayoutStyles(layoutMode, horizontalOverlapPx, strokeCount, strokeWidth) {
  const N = strokeCount
  const STROKE_WIDTH = strokeWidth
  const BORDER_EXTRA = horizontalOverlapPx
  const TOTAL_BORDER_WIDTH = N * STROKE_WIDTH
  const O_TOTAL = (N - 1) * STROKE_WIDTH
  const TOP_OFFSET = 2 * STROKE_WIDTH
  const TOP_ARC_SHIFT = ((N - 1) / 2) * STROKE_WIDTH + O_TOTAL / 2

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

  return {
    wrapperStyle,
    svgStyle,
    BORDER_EXTRA,
    viewBoxMinX: BORDER_EXTRA > 0 ? -BORDER_EXTRA : 0,
    TOP_OFFSET,
    TOP_ARC_SHIFT,
  }
}

/**
 * Compute all data needed to render the serpentine border SVG.
 * Pure function: no DOM, no side effects.
 *
 * @param {{
 *   width: number
 *   sectionBottomYs: number[]
 *   strokeCount: number
 *   strokeWidth: number
 *   radius: number
 *   horizontalOverlapPx: number
 *   colors: string[]
 * }} options
 * @returns {{ paths: { d: string, color: string }[], viewBox: { minX: number, minY: number, width: number, height: number }, totalWidth: number, totalHeight: number }}
 */
export function computeSerpentineBorder(options) {
  const {
    width: W,
    sectionBottomYs: Y,
    strokeCount: N,
    strokeWidth: STROKE_WIDTH,
    radius: R,
    horizontalOverlapPx: BORDER_EXTRA,
    colors: COLORS,
  } = options

  const O_TOTAL = (N - 1) * STROKE_WIDTH
  const TOP_OFFSET = 2 * STROKE_WIDTH
  const Y_OFFSET = O_TOTAL / 2
  const TOP_ARC_SHIFT = ((N - 1) / 2) * STROKE_WIDTH + Y_OFFSET

  const paths = buildPathD(W, Y, N, R, STROKE_WIDTH, COLORS, TOP_ARC_SHIFT, Y_OFFSET, O_TOTAL, BORDER_EXTRA)

  const totalHeight = Y[Y.length - 1] ?? 0
  const totalWidth = Math.max(1, W + 2 * BORDER_EXTRA)
  const viewBoxHeight = totalHeight + TOP_OFFSET + TOP_ARC_SHIFT
  const viewBoxMinX = BORDER_EXTRA > 0 ? -BORDER_EXTRA : 0
  const viewBoxMinY = -STROKE_WIDTH * 2 - TOP_ARC_SHIFT

  return {
    paths,
    viewBox: {
      minX: viewBoxMinX,
      minY: viewBoxMinY,
      width: totalWidth,
      height: viewBoxHeight,
    },
    totalWidth,
    totalHeight,
    TOP_OFFSET,
    TOP_ARC_SHIFT,
  }
}

/**
 * Measure wrapper and section elements to get width and section bottom Ys.
 * Use from React by passing wrapperRef.current and an predicate to exclude the SVG.
 *
 * @param {HTMLElement} wrapperEl
 * @param {{
 *   layoutMode: 'content' | 'border'
 *   horizontalOverlapPx: number
 *   isSectionElement?: (el: Element) => boolean
 * }} options - isSectionElement(el): true = include as section; default is to include all children
 */
export function measureSections(wrapperEl, options) {
  const { layoutMode, horizontalOverlapPx: BORDER_EXTRA, isSectionElement } = options
  if (!wrapperEl) return null

  const sectionEls = isSectionElement
    ? Array.from(wrapperEl.children).filter(isSectionElement)
    : Array.from(wrapperEl.children)

  if (sectionEls.length === 0) return null

  const rect = wrapperEl.getBoundingClientRect()
  const baseWidth = rect.width

  const W =
    layoutMode === 'border'
      ? Math.max(1, baseWidth - 2 * BORDER_EXTRA)
      : Math.max(1, baseWidth)

  const Y = [0]
  for (let i = 0; i < sectionEls.length; i++) {
    const r = sectionEls[i].getBoundingClientRect()
    Y.push(r.top - rect.top + r.height)
  }

  const totalHeight = Y[Y.length - 1]
  const totalWidth =
    layoutMode === 'border'
      ? Math.max(1, W + 2 * BORDER_EXTRA)
      : Math.max(1, baseWidth)

  return { width: W, sectionBottomYs: Y, totalWidth, totalHeight }
}
