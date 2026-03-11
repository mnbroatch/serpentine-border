/**
 * Vanilla JS core for serpentine border SVG generation.
 * Single export: call with measured dimensions and options to get everything needed to render.
 */

import { DEFAULT_COLORS } from './constants.js'

function resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH) {
  if (typeof horizontalOverlap === 'number') return horizontalOverlap
  const totalBorderWidth = N * STROKE_WIDTH
  if (horizontalOverlap === 'borderWidth') return totalBorderWidth
  if (horizontalOverlap === 'halfBorderWidth') return totalBorderWidth / 2
  return 0
}

function styleObjectToCss(obj) {
  return Object.entries(obj)
    .map(([k, v]) => {
      const key = k.replace(/([A-Z])/g, '-$1').toLowerCase()
      const val = typeof v === 'number' && !Number.isNaN(v) ? `${v}px` : String(v)
      return `${key}: ${val}`
    })
    .join('; ')
}

function buildPathD(W, Y, N, R, STROKE_WIDTH, COLORS, TOP_ARC_SHIFT, Y_OFFSET, O_TOTAL, BORDER_EXTRA) {
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
    parts.push({
      d: segs.join(' '),
      stroke: COLORS[i % COLORS.length],
      'stroke-width': STROKE_WIDTH,
      fill: 'none',
    })
  }
  return parts
}

const DEFAULT_SVG_CLASS = 'serpentine-border-svg'

const DEFAULTS = {
  strokeCount: 5,
  strokeWidth: 8,
  radius: 50,
  horizontalOverlap: 0,
  layoutMode: 'border',
}

/**
 * Compute everything needed to render the serpentine border.
 * Accepts either (width + sectionBottomYs) for pure/custom use, or wrapperEl to measure from the DOM.
 * When using wrapperEl, returns null in non-DOM environments (e.g. SSR) or when measurement fails.
 *
 * @param {{
 *   width?: number
 *   sectionBottomYs?: number[]
 *   wrapperEl?: HTMLElement
 *   strokeCount?: number
 *   strokeWidth?: number
 *   radius?: number
 *   horizontalOverlap?: number | 'borderWidth' | 'halfBorderWidth'
 *   colors?: string[]
 *   layoutMode?: 'content' | 'border'
 *   svgClassName?: string
 * }} options
 * @returns {{
 *   wrapperStyle: Record<string, unknown>
 *   svgAttributes: { class?: string, viewBox: string, style: string }
 *   paths: Array<{ d: string, stroke: string, 'stroke-width': number, fill: string }>
 * } | null}
 */
export function serpentineBorder(options) {
  const N = options.strokeCount ?? DEFAULTS.strokeCount
  const STROKE_WIDTH = options.strokeWidth ?? DEFAULTS.strokeWidth
  const R = options.radius ?? DEFAULTS.radius
  const horizontalOverlap = options.horizontalOverlap ?? DEFAULTS.horizontalOverlap
  const COLORS = options.colors ?? DEFAULT_COLORS
  const layoutMode = options.layoutMode ?? DEFAULTS.layoutMode
  const svgClassName = options.svgClassName ?? DEFAULT_SVG_CLASS

  let W, Y
  if (options.wrapperEl != null) {
    const wrapperEl = options.wrapperEl
    const hasDOM = typeof document !== 'undefined' && typeof wrapperEl.getBoundingClientRect === 'function'
    if (!hasDOM) return null
    const measured = measureSections(wrapperEl, {
      layoutMode,
      horizontalOverlap,
      strokeCount: N,
      strokeWidth: STROKE_WIDTH,
      excludeClassName: svgClassName,
    })
    if (!measured) return null
    W = measured.width
    Y = measured.sectionBottomYs
  } else {
    if (options.width == null || options.sectionBottomYs == null) return null
    W = options.width
    Y = options.sectionBottomYs
  }

  const BORDER_EXTRA = resolveOverlapToPixels(horizontalOverlap, N, STROKE_WIDTH)
  const O_TOTAL = (N - 1) * STROKE_WIDTH
  const TOTAL_BORDER_WIDTH = N * STROKE_WIDTH
  const TOP_OFFSET = 2 * STROKE_WIDTH
  const Y_OFFSET = O_TOTAL / 2
  const TOP_ARC_SHIFT = ((N - 1) / 2) * STROKE_WIDTH + Y_OFFSET

  const wrapperStyle =
    layoutMode === 'border'
      ? {
          boxSizing: 'border-box',
          position: 'relative',
          marginTop: `${TOTAL_BORDER_WIDTH / 2}px`,
          ...(BORDER_EXTRA > 0 && {
            paddingLeft: `${BORDER_EXTRA}px`,
            paddingRight: `${BORDER_EXTRA}px`,
          }),
        }
      : {
          position: 'relative',
          boxSizing: 'border-box',
        }

  const svgStyleObj =
    layoutMode === 'border'
      ? {
          position: 'absolute',
          overflow: 'hidden',
          width: '100%',
          left: 0,
          top: -(TOP_OFFSET + TOP_ARC_SHIFT),
          height: `calc(100% + ${TOP_OFFSET + TOP_ARC_SHIFT}px)`,
        }
      : {
          position: 'absolute',
          overflow: 'hidden',
          width: `calc(100% + ${2 * BORDER_EXTRA}px)`,
          left: -BORDER_EXTRA,
          top: -(TOP_OFFSET + TOP_ARC_SHIFT),
          height: `calc(100% + ${TOP_OFFSET + TOP_ARC_SHIFT}px)`,
        }
  const svgStyle = styleObjectToCss(svgStyleObj)

  const paths = buildPathD(W, Y, N, R, STROKE_WIDTH, COLORS, TOP_ARC_SHIFT, Y_OFFSET, O_TOTAL, BORDER_EXTRA)

  const totalHeight = Y[Y.length - 1] ?? 0
  const totalWidth = Math.max(1, W + 2 * BORDER_EXTRA)
  const viewBoxHeight = totalHeight + TOP_OFFSET + TOP_ARC_SHIFT
  const viewBoxMinX = BORDER_EXTRA > 0 ? -BORDER_EXTRA : 0
  const viewBoxMinY = -STROKE_WIDTH * 2 - TOP_ARC_SHIFT
  const viewBoxStr = `${viewBoxMinX} ${viewBoxMinY} ${totalWidth} ${viewBoxHeight}`

  return {
    wrapperStyle,
    svgAttributes: {
      class: svgClassName,
      viewBox: viewBoxStr,
      style: svgStyle,
    },
    paths,
  }
}

/**
 * Measure wrapper and section elements to get width and section bottom Ys.
 * Children with the excludeClassName (default: same class used on the SVG by serpentineBorder) are excluded.
 * horizontalOverlap is resolved to pixels using strokeCount and strokeWidth.
 *
 * @param {HTMLElement} wrapperEl
 * @param {{
 *   layoutMode: 'content' | 'border'
 *   horizontalOverlap?: number | 'borderWidth' | 'halfBorderWidth'
 *   strokeCount: number
 *   strokeWidth: number
 *   excludeClassName?: string
 * }} options
 * @returns {{ width: number, sectionBottomYs: number[] } | null}
 */
export function measureSections(wrapperEl, options) {
  const { layoutMode, horizontalOverlap = 0, strokeCount, strokeWidth, excludeClassName = DEFAULT_SVG_CLASS } = options
  const BORDER_EXTRA = resolveOverlapToPixels(horizontalOverlap, strokeCount, strokeWidth)
  if (!wrapperEl) return null

  const sectionEls = excludeClassName
    ? Array.from(wrapperEl.children).filter((el) => !el.classList.contains(excludeClassName))
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

  return { width: W, sectionBottomYs: Y }
}
