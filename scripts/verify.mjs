import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.join(base, ...p.split('/'))
const read = (p) => fs.readFileSync(rel(p), 'utf8')

const required = [
  'package.json', 'skin.json', 'cordis.patch.yml', 'tsconfig.json',
  'README.md', 'SKILL.md', 'LICENSE', '.gitignore',
  'src/index.ts', 'src/client.ts',
  'scripts/wrap-client.mjs', 'scripts/runtime-smoke.mjs',
  'assets/bg-avemujika.png'
]

let allOk = true
for (const file of required) {
  const exists = fs.existsSync(rel(file))
  console.log((exists ? '  OK    ' : 'MISSING ') + file)
  if (!exists) allOk = false
}

const yaml = read('cordis.patch.yml')
console.log('\ncordis.patch.yml: insert=' + yaml.includes('- insert:') +
  ' id=' + yaml.includes('ui-skin-avemujika') +
  ' name=' + yaml.includes('dsh-skin-avemujika'))

const client = read('src/client.ts')
const expects = [
  ['client.ts: named apply', 'export function apply'],
  ["client.ts: Cordis inject", "export const inject = ['theme']"],
  ['client.ts: bundled background import', "import BG_URL from '../assets/bg-avemujika.png'"],
  ['client.ts: overrideTokens call', 'ctx.theme.overrideTokens'],
  ['client.ts: body attribute hook', 'data-dsh-avemujika'],
  ['client.ts: dark theme pin', "data-ds-dark-theme"],
  ['client.ts: preview badge hidden', '_previewBadge'],
  ['client.ts: active-phase composer', 'data-phase="active"'],
  ['client.ts: sidebar fade neutralised', '--dsw-specific-sidebar-fill: transparent'],
  ['client.ts: font token override', '--dsw-font-family']
]
for (const [label, needle] of expects) {
  const ok = client.includes(needle)
  console.log(label + '=' + ok)
  if (!ok) allOk = false
}

const tokenKeys = [...client.matchAll(/^ {2}'(--[^']+)':/gm)].map((m) => m[1])
const badKeys = tokenKeys.filter((k) => !k.startsWith('--dsw-'))
console.log('client.ts: token override keys=' + tokenKeys.length + ' allPrefixed=' + (badKeys.length === 0))
if (badKeys.length > 0) {
  console.log('  unprefixed keys are dropped by setProperty: ' + badKeys.join(', '))
  allOk = false
}
const index = read('src/index.ts')
console.log('index.ts: named apply=' + index.includes('export function apply'))
console.log('index.ts: package name=' + index.includes("export const name = 'dsh-skin-avemujika'"))

const wrap = read('scripts/wrap-client.mjs')
console.log('wrap-client.mjs: ModuleLoader.load=' + wrap.includes('__ModuleLoader__.load'))

const built = read('lib/client.js')
const builtChecks = [
  ['lib/client.js: package id', 'id: "dsh-skin-avemujika"'],
  ['lib/client.js: inlined image', 'data:image/png;base64,']
]
for (const [label, needle] of builtChecks) {
  const ok = built.includes(needle)
  console.log(label + '=' + ok)
  if (!ok) allOk = false
}

console.log('\n' + (allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'))
process.exitCode = allOk ? 0 : 1
