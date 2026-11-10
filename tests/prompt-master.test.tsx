import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'prompt-master',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false },
} as const

test('the button rewrites the draft, and Undo brings it back', async ($, on) => {
  let box = 'make me a todo app'
  on('prompt.read', () => ({ value: { text: box, cursor: box.length } }))
  on('prompt.fill', (_, e) => {
    box = e.text
    return { isFilled: true }
  })
  on('model.complete', () => ({
    value: { isAnswered: true, text: '  Build a to-do app in React.  ', usage: {} },
  }))
  on('ui.toast', () => ({ value: undefined }))

  for (const surface of ['terminal', 'desktop'] as const) {
    box = 'make me a todo app'
    const ui = await $.ui.mount({ ...BAND, surface } as any)
    await ui.press({ key: 'pm' })
    expect(box).toBe('Build a to-do app in React.')
    await ui.press({ key: 'undo' })
    expect(box).toBe('make me a todo app')
    await ui.unmount()
  }
})
