import type { ReactNode, ReactElement } from 'react'

export interface SerpentineBorderProps {
  children?: ReactNode
  strokeCount?: number
  strokeWidth?: number
  radius?: number
  horizontalOverflow?: number | 'borderWidth' | 'halfBorderWidth'
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
  horizontalOverflow?: number | 'borderWidth' | 'halfBorderWidth'
  colors?: string[]
  layoutMode?: 'content' | 'border'
  svgClassName?: string
}

export interface SectionPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface SerpentineBorderResult {
  wrapperStyle: Record<string, unknown>
  svgAttributes: { class?: string; viewBox: string; style: string }
  paths: Array<{ d: string; stroke: string; 'stroke-width': number; fill: string }>
}

export interface GetSectionsPaddingOptions {
  sectionCount: number
  strokeCount: number
  strokeWidth: number
  horizontalOverflow?: number | 'borderWidth' | 'halfBorderWidth'
}

export interface SectionsPaddingMap {
  even: SectionPadding
  odd: SectionPadding
  last: SectionPadding
}

export declare function getSectionsPadding(options: GetSectionsPaddingOptions): SectionsPaddingMap

export declare function serpentineBorder(options: SerpentineBorderOptions): SerpentineBorderResult | null
