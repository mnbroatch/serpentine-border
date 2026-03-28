import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SerpentineBorder } from 'serpentine-border'

const PRESETS = [
  { h0: 100, h1: 110, label: 'Compact' },
  { h0: 140, h1: 180, label: 'Medium' },
  { h0: 220, h1: 90, label: 'Tall + short' },
]

function Demo() {
  const [animateHeightResize, setAnimateHeightResize] = useState(true)
  const [presetIndex, setPresetIndex] = useState(1)
  const [autoCycle, setAutoCycle] = useState(false)
  const { h0, h1 } = PRESETS[presetIndex]

  useEffect(() => {
    if (!autoCycle) return undefined
    const id = window.setInterval(() => {
      setPresetIndex((i) => (i + 1) % PRESETS.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [autoCycle])

  return (
    <>
      <h1>Serpentine border — vertical resize demo</h1>
      <p className="hint">
        Change section heights with the buttons or auto-cycle. The checkbox controls both section
        min-height easing and the SVG border stretch; off means everything snaps.
      </p>
      <div className="controls">
        <label>
          <input
            type="checkbox"
            checked={animateHeightResize}
            onChange={(e) => setAnimateHeightResize(e.target.checked)}
          />
          Animate height resize
        </label>
        <label>
          <input type="checkbox" checked={autoCycle} onChange={(e) => setAutoCycle(e.target.checked)} />
          Auto-cycle sizes
        </label>
        <button type="button" onClick={() => setPresetIndex((i) => (i + 1) % PRESETS.length)}>
          Next layout ({PRESETS[(presetIndex + 1) % PRESETS.length].label})
        </button>
        <button type="button" className="secondary" onClick={() => setPresetIndex(1)}>
          Reset to medium
        </button>
      </div>
      <div className="fixture" data-testid="sample-fixture">
        <SerpentineBorder
          layoutMode="content"
          horizontalOverflow={16}
          strokeWidth={8}
          strokeCount={5}
          radius={44}
          animateHeightResize={animateHeightResize}
          heightResizeTransitionMs={380}
        >
          <div
            className="section"
            style={{
              minHeight: h0,
              transition: animateHeightResize ? 'min-height 0.35s ease' : 'none',
            }}
          >
            Section A — min-height {h0}px
          </div>
          <div
            className="section"
            style={{
              minHeight: h1,
              transition: animateHeightResize ? 'min-height 0.35s ease' : 'none',
            }}
          >
            Section B — min-height {h1}px
          </div>
        </SerpentineBorder>
      </div>
    </>
  )
}

const root = document.getElementById('root')
createRoot(root).render(<Demo />)
