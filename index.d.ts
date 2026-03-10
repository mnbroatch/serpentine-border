import type { ReactNode, ReactElement } from 'react'

export interface SerpentineBorderProps {
  children?: ReactNode
  strokeCount?: number
  strokeWidth?: number
  radius?: number
  horizontalOverlap?: number | 'borderWidth' | 'halfBorderWidth'
  colors?: string[]
  layoutMode?: 'content' | 'border'
}

export declare function SerpentineBorder(props: SerpentineBorderProps): ReactElement

export declare const DEFAULT_COLORS: string[]

/** Vanilla JS core (no React). Use for custom rendering or non-React environments. */
export declare function buildPathD(
  W: number,
  Y: number[],
  N: number,
  R: number,
  STROKE_WIDTH: number,
  COLORS: string[],
  TOP_ARC_SHIFT: number,
  Y_OFFSET: number,
  O_TOTAL: number,
  BORDER_EXTRA: number
): { d: string; color: string }[]

export declare function resolveOverlapToPixels(
  horizontalOverlap: number | 'borderWidth' | 'halfBorderWidth',
  N: number,
  STROKE_WIDTH: number
): number

export interface LayoutStylesResult {
  wrapperStyle: Record<string, unknown>
  svgStyle: Record<string, unknown>
  BORDER_EXTRA: number
  viewBoxMinX: number
  TOP_OFFSET: number
  TOP_ARC_SHIFT: number
}

export declare function getLayoutStyles(
  layoutMode: 'content' | 'border',
  horizontalOverlapPx: number,
  strokeCount: number,
  strokeWidth: number
): LayoutStylesResult

export interface ComputeSerpentineBorderOptions {
  width: number
  sectionBottomYs: number[]
  strokeCount: number
  strokeWidth: number
  radius: number
  horizontalOverlapPx: number
  colors: string[]
}

export interface ViewBox {
  minX: number
  minY: number
  width: number
  height: number
}

export declare function computeSerpentineBorder(options: ComputeSerpentineBorderOptions): {
  paths: { d: string; color: string }[]
  viewBox: ViewBox
  totalWidth: number
  totalHeight: number
  TOP_OFFSET: number
  TOP_ARC_SHIFT: number
}

export declare function measureSections(
  wrapperEl: HTMLElement,
  options: {
    layoutMode: 'content' | 'border'
    horizontalOverlapPx: number
    isSectionElement?: (el: Element) => boolean
  }
): { width: number; sectionBottomYs: number[]; totalWidth: number; totalHeight: number } | null
