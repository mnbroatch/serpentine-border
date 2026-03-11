import React from 'react'
import { createRoot } from 'react-dom/client'
import { SerpentineBorder } from 'serpentine-border'

function parseParams() {
  const q = new URLSearchParams(window.location.search)
  return {
    layoutMode: q.get('layout') || 'border',
    horizontalOverflow: Number(q.get('overflow')) || -100,
    strokeWidth: Number(q.get('strokeWidth')) || 8,
    strokeCount: Number(q.get('strokeCount')) || 5,
    radius: Number(q.get('radius')) || 50,
  }
}

function Fixture() {
  const params = parseParams()
  return (
    <div className="fixture" data-testid="fixture" data-layout-mode={params.layoutMode}>
      <SerpentineBorder
        layoutMode={params.layoutMode}
        horizontalOverflow={params.horizontalOverflow}
        strokeWidth={params.strokeWidth}
        strokeCount={params.strokeCount}
        radius={params.radius}
      >
        <div className="section" data-testid="section-0">Section A</div>
        <div className="section" data-testid="section-1">Section B</div>
      </SerpentineBorder>
    </div>
  )
}

const root = document.getElementById('root')
createRoot(root).render(<Fixture />)
