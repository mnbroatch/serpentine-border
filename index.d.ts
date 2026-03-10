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
