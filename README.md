# Prompt Master

A Claude Code mod that rewrites your rough prompt into a clearer, stronger one before you send it.

## Use

- Type a rough prompt, then click **✨ Prompt Master** in the band above the prompt box. The rewritten prompt replaces your draft; nothing is sent until you press Enter. **Undo** restores your original.
- Or run `/prompt-master <your rough prompt>`.

The button shows in the terminal and the desktop app; the slash command works wherever slash commands do. Each rewrite is one extra model call (Sonnet, falling back to Haiku).

## Install

At the prompt of a terminal session:

```
/plugin install prompt-master --marketplace sarieeeh/prompt-master
```

From a shell:

```bash
claude plugin install prompt-master --marketplace sarieeeh/prompt-master
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `sarieeeh/prompt-master`, then Add plugin.

This repository is private: installing needs read access on GitHub and a git credential for github.com on your machine (an SSH key, or `gh auth login` then `gh auth setup-git`).
