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

/** Vanilla JS core (no React). Single function for custom rendering or non-React environments. */
export interface SerpentineBorderOptions {
  /** Content width in px (use with sectionBottomYs, or omit when using wrapperEl). */
  width?: number
  /** Cumulative section bottom Y coordinates (use with width, or omit when using wrapperEl). */
  sectionBottomYs?: number[]
  /** When set, width and sectionBottomYs are measured from this element; returns null in SSR or when measurement fails. */
  wrapperEl?: HTMLElement
  strokeCount?: number
  strokeWidth?: number
  radius?: number
  horizontalOverlap?: number | 'borderWidth' | 'halfBorderWidth'
  colors?: string[]
  layoutMode?: 'content' | 'border'
  svgClassName?: string
}

export interface SerpentineBorderResult {
  wrapperStyle: Record<string, unknown>
  svgAttributes: { class?: string; viewBox: string; style: Record<string, unknown> }
  paths: Array<{ d: string; stroke: string; strokeWidth: number; fill: string }>
}

export declare function serpentineBorder(options: SerpentineBorderOptions): SerpentineBorderResult | null

export declare function measureSections(
  wrapperEl: HTMLElement,
  options: {
    layoutMode: 'content' | 'border'
    horizontalOverlap?: number | 'borderWidth' | 'halfBorderWidth'
    strokeCount: number
    strokeWidth: number
    excludeClassName?: string
  }
): { width: number; sectionBottomYs: number[] } | null
