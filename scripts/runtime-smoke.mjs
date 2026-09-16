import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const root = new URL('..', import.meta.url)
const source = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

const elements = new Map()

class Element {
  constructor() {
    this.id = ''
    this.textContent = ''
    this.parentNode = null
    this.removed = false
  }

  remove() {
    this.removed = true
    if (this.id) elements.delete(this.id)
  }
}

class StyleElement extends Element {}
class DivElement extends Element {}

const body = {
  attributes: new Map(),
  appendChild(element) {
    element.parentNode = this
    if (element.id) elements.set(element.id, element)
  },
  setAttribute(name, value) {
    this.attributes.set(name, value)
  },
  removeAttribute(name) {
    this.attributes.delete(name)
  },
  hasAttribute(name) {
    return this.attributes.has(name)
  },
}

const document = {
  body,
  head: {
    appendChild(element) {
      element.parentNode = this
      if (element.id) elements.set(element.id, element)
    },
  },
  createElement(tag) {
    if (tag === 'style') return new StyleElement()
    if (tag === 'div') return new DivElement()
    throw new Error(`unexpected tag: ${tag}`)
  },
  getElementById(id) {
    return elements.get(id) ?? null
  },
}

let registration
vm.runInNewContext(source, {
  console,
  document,
  HTMLStyleElement: StyleElement,
  HTMLDivElement: DivElement,
  window: {
    __ModuleLoader__: {
      load(value) {
        registration = value
      },
    },
  },
})

assert.equal(registration.id, 'dsh-skin-avemujika')
const client = registration.factory(() => {
  throw new Error('skin client should not require external modules')
})
assert.deepEqual([...client.inject], ['theme'])
assert.equal(typeof client.apply, 'function')

let disposeEffect
let tokenSource
let tokenOverrides
let tokensDisposed = false

client.apply({
  effect(callback) {
    disposeEffect = callback()
  },
  theme: {
    overrideTokens(source, tokens) {
      tokenSource = source
      tokenOverrides = tokens
      return () => {
        tokensDisposed = true
      }
    },
  },
})

const style = document.getElementById('dsh-avemujika-style')
const background = document.getElementById('dsh-avemujika-bg')
assert.ok(style instanceof StyleElement)
assert.ok(background instanceof DivElement)
assert.match(style.textContent, /data:image\/png;base64,/)
assert.equal(body.attributes.get('data-dsh-avemujika'), 'true')
assert.equal(body.attributes.get('data-ds-dark-theme'), '')
assert.equal(body.hasAttribute('data-ds-dark-theme'), true)
assert.equal(tokenSource, 'dsh-skin-avemujika')
assert.equal(tokenOverrides['--dsw-alias-bg-base'].dark, 'rgba(8, 16, 26, 0.30)')
assert.equal(tokenOverrides['--dsw-alias-bg-layer-1'].dark, 'rgba(10, 20, 31, 0.42)')
assert.equal(tokenOverrides['--dsw-specific-sidebar-fill'].dark, 'transparent')

disposeEffect()
assert.equal(tokensDisposed, true)
assert.equal(style.removed, true)
assert.equal(background.removed, true)
assert.equal(body.attributes.has('data-dsh-avemujika'), false)
assert.equal(body.hasAttribute('data-ds-dark-theme'), false)

console.log('runtime smoke test passed')
