declare module 'claude-code' {
  interface PluginState {
    'prompt-master': { isBusy: boolean; original: string | null }
  }
}
