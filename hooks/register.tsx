import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

const isBusy = atom({ plugin: 'prompt-master', key: 'isBusy' } as const, false)
const original = atom({ plugin: 'prompt-master', key: 'original' } as const, null)

const SYSTEM = `You are Prompt Master. You rewrite a user's rough prompt for an AI assistant into a clearer, more effective prompt.

Rules:
- Keep the user's intent, facts, names, code and constraints exactly. Never invent requirements, data or context they did not give.
- Make the goal explicit. Add structure (context, task, constraints, desired output format) only where it helps.
- Where important details are missing, add a short line asking the assistant to ask clarifying questions first, instead of guessing.
- Keep it concise. Do not pad. Match the user's language.
- Write it in the user's voice, addressed to the assistant.
- Output ONLY the rewritten prompt. No preamble, no quotes, no commentary.`

async function ask($: EngineInterface, model: string, rough: string) {
  return $.model.complete({
    model,
    system: SYSTEM,
    prompt: 'Rough prompt:\n<<<\n' + rough + '\n>>>',
    maxTokens: 2048,
  })
}

async function rewrite($: EngineInterface, rough: string): Promise<string | null> {
  let r
  try {
    r = await ask($, 'sonnet', rough)
  } catch {
    r = await ask($, 'haiku', rough)
  }
  return r.isAnswered ? r.text.trim() : null
}

async function run($: EngineInterface): Promise<void> {
  if (await read($, isBusy)) return
  const { text } = await $.prompt.read()
  const rough = text.trim()
  if (!rough) {
    $.ui.toast('Prompt Master: type a rough prompt first')
    return
  }
  await update($, isBusy, () => true)
  try {
    const better = await rewrite($, rough)
    if (!better) {
      $.ui.toast('Prompt Master: rewrite failed, your prompt is unchanged')
      return
    }
    await update($, original, () => text)
    const { isFilled } = await $.prompt.fill({ text: better, mode: 'replace' })
    $.ui.toast(isFilled ? 'Prompt Master: rewritten. Review, then send.' : 'Prompt Master: could not update the prompt box')
  } finally {
    await update($, isBusy, () => false)
  }
}

async function undo($: EngineInterface, prev: string): Promise<void> {
  await $.prompt.fill({ text: prev, mode: 'replace' })
  await update($, original, () => null)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'prompt-master',
      description: 'Rewrite a rough prompt into a better one and put it in the prompt box',
      argumentHint: '<rough prompt>',
    })
    return next(e)
  })

  on('command.run', { command: 'prompt-master' }, async ($, e) => {
    const rough = e.args.trim()
    if (!rough) return { text: 'Usage: /prompt-master <your rough prompt>' }
    const better = await rewrite($, rough)
    if (!better) return { text: 'Prompt Master: rewrite failed.' }
    await update($, original, () => rough)
    await $.prompt.fill({ text: better, mode: 'replace' })
    return { text: 'Prompt Master: the rewritten prompt is in your prompt box. Review, then send.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const busy = await read($, isBusy)
    const prev = await read($, original)

    return (
      <Box>
        {busy ? (
          <Text dimColor>✨ Prompt Master is rewriting…</Text>
        ) : (
          <Button key="pm" label="✨ Prompt Master" onPress={() => run($)} />
        )}
        {prev !== null && !busy ? (
          <Button key="undo" label="Undo" onPress={() => undo($, prev)} />
        ) : null}
      </Box>
    )
  })
}
