import '@fontsource-variable/inter/opsz.css'
import '@/styles/reset.css'
import '../app/app.css'
import './components.css'
import './styleguide.css'
import tokensCss from '../app/app.css?raw'
import componentsCss from './components.css?raw'

/**
 * Fill each code block with the real CSS, so what the guide shows is exactly
 * what styles the examples above it.
 */
function sections(css: string): Map<string, string> {
  const map = new Map<string, string>()
  const parts = css.split(/\/\* @section ([a-z-]+) \*\/\n/)
  for (let i = 1; i < parts.length; i += 2) {
    map.set(parts[i]!, (parts[i + 1] ?? '').trim())
  }
  return map
}

const bySection = sections(componentsCss)
for (const pre of document.querySelectorAll<HTMLElement>('pre[data-section]')) {
  pre.textContent = bySection.get(pre.dataset.section ?? '') ?? ''
}

const rootBlock = tokensCss.match(/:root \{[\s\S]*?\n\}/)?.[0] ?? tokensCss
const tokensPre = document.getElementById('tokens-css')
if (tokensPre) tokensPre.textContent = rootBlock

/* Color swatches, read from the same tokens. */
const SWATCHES: { token: string; role: string }[] = [
  { token: '--bg', role: 'Page background' },
  { token: '--bg-card', role: 'Cards, tables, dialogs' },
  { token: '--text', role: 'Primary text' },
  { token: '--text-3', role: 'Secondary text' },
  { token: '--rail', role: 'Workspace rail' },
  { token: '--ink', role: 'Primary buttons, active chips' },
  { token: '--teal', role: 'Brand, focus, confirmed' },
  { token: '--mint', role: 'Success banners, highlights' },
  { token: '--peach', role: 'Warnings, allergy tag' },
  { token: '--coral', role: 'Waiting for triage, badges' },
  { token: '--amber', role: 'Awaiting review, interaction' },
  { token: '--green', role: 'Charting done' },
  { token: '--red', role: 'Allergy text' },
]

const swatches = document.getElementById('swatches')
if (swatches) {
  const style = getComputedStyle(document.documentElement)
  for (const s of SWATCHES) {
    const value = style.getPropertyValue(s.token).trim()
    const item = document.createElement('figure')
    item.className = 'sg-swatch'
    const chip = document.createElement('span')
    chip.className = 'sg-swatch-chip'
    chip.style.background = `var(${s.token})`
    const caption = document.createElement('figcaption')
    const name = document.createElement('code')
    name.textContent = s.token
    const hex = document.createElement('span')
    hex.className = 'sg-swatch-hex'
    hex.textContent = value
    const role = document.createElement('span')
    role.textContent = s.role
    caption.append(name, hex, role)
    item.append(chip, caption)
    swatches.append(item)
  }
}
