/** SerpentineBorder e2e tests. */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5174'
const TOLERANCE = 2

function withinTolerance(actual, expected) {
  return Math.abs(actual - expected) <= TOLERANCE
}

const PARAM_SETS = [
  { strokeWidth: 8, strokeCount: 5, radius: 50, label: 'Set A' },
  { strokeWidth: 6, strokeCount: 4, radius: 30, label: 'Set B' },
]

const HORIZONTAL_OVERFLOW = 20
const FIXTURE_WIDTH = 400
const SECTION_HEIGHT = 150

function queryString(params) {
  const q = new URLSearchParams()
  if (params.layoutMode != null) q.set('layout', params.layoutMode)
  q.set('overflow', String(params.horizontalOverflow ?? HORIZONTAL_OVERFLOW))
  q.set('strokeWidth', String(params.strokeWidth))
  q.set('strokeCount', String(params.strokeCount))
  q.set('radius', String(params.radius))
  return q.toString()
}

for (const params of PARAM_SETS) {
  test.describe(`SerpentineBorder (${params.label}: strokeWidth=${params.strokeWidth}, strokeCount=${params.strokeCount}, radius=${params.radius})`, () => {
    test('1a. vertical segments overlap content side edges (content mode)', async ({ page }) => {
      await page.goto(`${BASE_URL}/?${queryString({ ...params, layoutMode: 'content' })}`, { waitUntil: 'networkidle' })
      await expect(page.getByTestId('fixture')).toHaveAttribute('data-layout-mode', 'content')
      await expect(page.getByTestId('fixture')).toBeVisible()
      const wrapper = page.getByTestId('serpentine-wrapper')
      const svg = page.getByTestId('serpentine-svg')
      await expect(wrapper).toBeVisible()
      await expect(svg).toBeVisible()

      const leftPx = await svg.evaluate((el) => parseFloat(getComputedStyle(el).left) || 0)
      expect(withinTolerance(leftPx, -HORIZONTAL_OVERFLOW), `svg left: ${leftPx}, expected ~${-HORIZONTAL_OVERFLOW}`).toBe(true)

      const wrapperRect = await wrapper.boundingBox()
      const svgRect = await svg.boundingBox()
      expect(wrapperRect).toBeTruthy()
      expect(svgRect).toBeTruthy()
      const overflowLeft = wrapperRect.x - svgRect.x
      const overflowRight = svgRect.x + svgRect.width - (wrapperRect.x + wrapperRect.width)
      const totalOverflow = overflowLeft + overflowRight
      expect(withinTolerance(totalOverflow, 2 * HORIZONTAL_OVERFLOW), `totalOverflow: ${totalOverflow}, expected ~${2 * HORIZONTAL_OVERFLOW} ± ${TOLERANCE}`).toBe(true)
      expect(svgRect.width >= wrapperRect.width + 2 * HORIZONTAL_OVERFLOW - TOLERANCE, `svg width ${svgRect.width} should be >= wrapper ${wrapperRect.width} + ${2 * HORIZONTAL_OVERFLOW}`).toBe(true)
    })

    test('1b. vertical segments (border mode)', async ({ page }) => {
      await page.goto(`${BASE_URL}/?${queryString({ ...params, layoutMode: 'border' })}`, { waitUntil: 'networkidle' })
      await expect(page.getByTestId('fixture')).toBeVisible()
      const wrapper = page.getByTestId('serpentine-wrapper')
      const svg = page.getByTestId('serpentine-svg')
      await expect(wrapper).toBeVisible()
      await expect(svg).toBeVisible()

      const leftPx = await svg.evaluate((el) => parseFloat(getComputedStyle(el).left) || 0)
      expect(withinTolerance(leftPx, 0), `svg left: ${leftPx}, expected ~0 in border mode`).toBe(true)
    })

    test('2. horizontal segments overlap space between children (content mode)', async ({ page }) => {
      await page.goto(`${BASE_URL}/?${queryString({ ...params, layoutMode: 'content' })}`, { waitUntil: 'networkidle' })
      await expect(page.getByTestId('fixture')).toBeVisible()
      const wrapper = page.getByTestId('serpentine-wrapper')
      const section0 = page.getByTestId('section-0')
      const section1 = page.getByTestId('section-1')
      const svg = page.getByTestId('serpentine-svg')
      await expect(wrapper).toBeVisible()
      await expect(svg).toBeVisible()

      const wrapperRect = await wrapper.boundingBox()
      const r0 = await section0.boundingBox()
      const r1 = await section1.boundingBox()
      expect(wrapperRect).toBeTruthy()
      expect(r0).toBeTruthy()
      expect(r1).toBeTruthy()
      // Path d is in SVG/viewBox coordinates; first junction is at SECTION_HEIGHT (150)
      const junctionY = SECTION_HEIGHT
      const gapMin = junctionY - 60
      const gapMax = junctionY + 60

      const pathD = await page.locator('.serpentine-border-svg path').first().getAttribute('d')
      expect(pathD).toBeTruthy()
      // Path d: M x y, L x y, A rx ry 0 0 0 x y — extract y from L/M (2nd number) and from A (7th number)
      const yFromLM = pathD.match(/[LM]\s+[-.\d]+\s+([-.\d]+)/g)
      const yFromA = pathD.match(/A\s+[-.\d]+\s+[-.\d]+(?:\s+[-.\d]+){4}\s+[-.\d]+\s+([-.\d]+)/g)
      const yCoords = [
        ...(yFromLM || []).map((s) => Number(s.split(/\s+/).pop())),
        ...(yFromA || []).map((s) => Number(s.split(/\s+/).pop())),
      ]
      const inGap = yCoords.some((y) => y >= gapMin && y <= gapMax)
      expect(inGap, `No path y in junction band [${gapMin}, ${gapMax}]. Path y values (sample): ${yCoords.slice(0, 10).join(', ')}`).toBe(true)
    })

    test('2b. horizontal segments overlap (border mode)', async ({ page }) => {
      await page.goto(`${BASE_URL}/?${queryString({ ...params, layoutMode: 'border' })}`, { waitUntil: 'networkidle' })
      await expect(page.getByTestId('fixture')).toBeVisible()
      const pathD = await page.locator('.serpentine-border-svg path').first().getAttribute('d')
      expect(pathD).toBeTruthy()
      const junctionY = SECTION_HEIGHT
      const gapMin = junctionY - 60
      const gapMax = junctionY + 60
      const yFromLM = pathD.match(/[LM]\s+[-.\d]+\s+([-.\d]+)/g)
      const yFromA = pathD.match(/A\s+[-.\d]+\s+[-.\d]+(?:\s+[-.\d]+){4}\s+[-.\d]+\s+([-.\d]+)/g)
      const yCoords = [
        ...(yFromLM || []).map((s) => Number(s.split(/\s+/).pop())),
        ...(yFromA || []).map((s) => Number(s.split(/\s+/).pop())),
      ]
      const inGap = yCoords.some((y) => y >= gapMin && y <= gapMax)
      expect(inGap, `No path y in junction band [${gapMin}, ${gapMax}]`).toBe(true)
    })

    test('3. content layout mode: same space as content', async ({ page }) => {
      await page.goto(`${BASE_URL}/?${queryString({ ...params, layoutMode: 'content' })}`, { waitUntil: 'networkidle' })
      await expect(page.getByTestId('fixture')).toBeVisible()
      const wrapper = page.getByTestId('serpentine-wrapper')
      await expect(wrapper).toBeVisible()

      const paddingLeft = await wrapper.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft) || 0)
      const paddingRight = await wrapper.evaluate((el) => parseFloat(getComputedStyle(el).paddingRight) || 0)
      const marginTop = await wrapper.evaluate((el) => parseFloat(getComputedStyle(el).marginTop) || 0)
      expect(withinTolerance(paddingLeft, 0)).toBe(true)
      expect(withinTolerance(paddingRight, 0)).toBe(true)
      expect(withinTolerance(marginTop, 0)).toBe(true)

      const wrapperRect = await wrapper.boundingBox()
      const section0 = page.getByTestId('section-0')
      const section1 = page.getByTestId('section-1')
      const r0 = await section0.boundingBox()
      const r1 = await section1.boundingBox()
      expect(wrapperRect).toBeTruthy()
      expect(r0).toBeTruthy()
      expect(r1).toBeTruthy()
      const contentHeight = (r1.y + r1.height) - wrapperRect.y
      expect(withinTolerance(wrapperRect.height, contentHeight), `wrapper height: ${wrapperRect.height}, content height: ${contentHeight}`).toBe(true)
      expect(withinTolerance(wrapperRect.width, FIXTURE_WIDTH), `wrapper width: ${wrapperRect.width}, expected: ${FIXTURE_WIDTH}`).toBe(true)
    })

    test('4. border layout mode: correct amount of space', async ({ page }) => {
      await page.goto(`${BASE_URL}/?${queryString({ ...params, layoutMode: 'border' })}`, { waitUntil: 'networkidle' })
      await expect(page.getByTestId('fixture')).toBeVisible()
      const wrapper = page.getByTestId('serpentine-wrapper')
      await expect(wrapper).toBeVisible()

      const paddingLeft = await wrapper.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft) || 0)
      const paddingRight = await wrapper.evaluate((el) => parseFloat(getComputedStyle(el).paddingRight) || 0)
      const marginTop = await wrapper.evaluate((el) => parseFloat(getComputedStyle(el).marginTop) || 0)
      const expectedMarginTop = (params.strokeCount * params.strokeWidth) / 2
      expect(withinTolerance(paddingLeft, HORIZONTAL_OVERFLOW)).toBe(true)
      expect(withinTolerance(paddingRight, HORIZONTAL_OVERFLOW)).toBe(true)
      expect(withinTolerance(marginTop, expectedMarginTop)).toBe(true)

      const wrapperRect = await wrapper.boundingBox()
      // In border mode wrapper has box-sizing: border-box and padding; it stays FIXTURE_WIDTH (content + padding inside)
      const expectedWidth = FIXTURE_WIDTH
      expect(withinTolerance(wrapperRect.width, expectedWidth), `wrapper width: ${wrapperRect.width}, expected: ${expectedWidth} ± ${TOLERANCE}`).toBe(true)
    })
  })
}
