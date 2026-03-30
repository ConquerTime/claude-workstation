# claude-workstation

One command to launch multiple [Claude Code](https://docs.anthropic.com/en/docs/claude-code) instances in a tmux session — each with its own role, model, and working directory.

```
claude-workstation myproject
```

```
┌──────── Planner ─────────┬──────── Backend ──────────┬──────── Frontend ─────────┐
│ Claude Code (opus)       │ Claude Code (sonnet)      │ Claude Code (sonnet)      │
│ > Planning the next      │ > Implementing the API    │ > Building the UI         │
│   feature...             │   endpoint...             │   components...           │
├──────── DevOps ──────────┼──────── Reviewer ─────────┼──────── Tests ────────────┤
│ Claude Code (haiku)      │ Claude Code (opus)        │ Claude Code (sonnet)      │
│ > Checking CI config...  │ > Reviewing the PR...     │ > Writing test cases...   │
└──────────────────────────┴──────────────────────────┴───────────────────────────┘
```

## Why

When working on complex projects, you often need multiple Claude Code agents running simultaneously — a planner, coders, a reviewer, etc. Setting these up manually every time is tedious.

claude-workstation solves this:

- **One command** launches all your Claude Code instances with the right models and directories
- **Session persistence** — close the terminal, sessions keep running in tmux. Reattach anytime
- **Named panes** — each pane shows its role in the border, so you always know which agent is which
- **Config-driven** — add projects by editing a YAML file, no script changes needed
- **Auto grid layout** — panes arrange in a two-row grid that scales with the number of agents

## Install

### Prerequisites

- [tmux](https://github.com/tmux/tmux) (`brew install tmux`)
- [yq](https://github.com/mikefarah/yq) (`brew install yq`)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (`npm install -g @anthropic-ai/claude-code`)

### Install via npm (recommended)

```bash
npm install -g claude-workstation
```

A default config will be created at `~/.config/claude-workstation/projects.yaml` automatically.

### Install from source

```bash
# Clone
git clone https://github.com/ConquerTime/claude-workstation.git
cd claude-workstation

npm install -g .
```

### Manual install

```bash
git clone https://github.com/ConquerTime/claude-workstation.git
cd claude-workstation

cp claude-workstation ~/.local/bin/
chmod +x ~/.local/bin/claude-workstation

mkdir -p ~/.config/claude-workstation
cp examples/projects.yaml ~/.config/claude-workstation/projects.yaml
```

Make sure `~/.local/bin` is in your `PATH`. If not, add to your shell profile:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Configuration

Edit `~/.config/claude-workstation/projects.yaml`:

```yaml
projects:
  webapp:
    desc: "Full-stack web app"
    dir: ~/projects/my-webapp
    windows:
      - name: Planner
        model: opus
      - name: Backend
        model: sonnet
      - name: Frontend
        model: sonnet
      - name: Reviewer
        model: opus
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `desc` | Yes | Short description shown in the project picker |
| `dir` | Yes | Default working directory for all panes |
| `skip_permissions` | No | Pass `--dangerously-skip-permissions` to all panes (default: `true`) |
| `windows` | Yes | List of Claude Code instances |
| `windows[].name` | Yes | Pane label (shown in border + Claude's `/resume` list) |
| `windows[].model` | Yes | Claude model: `opus`, `sonnet`, or `haiku` |
| `windows[].dir` | No | Override working directory for this specific pane |
| `windows[].skip_permissions` | No | Override `skip_permissions` for this specific pane |

### Per-pane directory override

Useful for monorepos where each agent works in a different package:

```yaml
projects:
  monorepo:
    desc: "Monorepo"
    dir: ~/projects/monorepo
    windows:
      - name: API
        model: sonnet
        dir: ~/projects/monorepo/packages/api
      - name: Web
        model: sonnet
        dir: ~/projects/monorepo/packages/web
```

### Adding a new project

**Quick way** — run `--create` from your project directory, or use `--edit` to modify an existing project:

```bash
cd ~/projects/my-app
claude-workstation --create

# Custom name:
claude-workstation --create my-custom-name
```

This prompts you to choose a template:

| Template | Panes | Roles | Layout |
|----------|-------|-------|--------|
| 1 | 6 | Planner×2 + Coder×2 + Tool-Executor + Reviewer | 3+3 grid |
| 2 | 8 | Planner×2 + Coder×4 + Tool-Executor + Reviewer | 4+4 grid |

Then confirms and writes the entry to `~/.config/claude-workstation/projects.yaml`.

To edit an existing project (rename or change layout):

```bash
claude-workstation --edit my-app
# → prompts: rename and/or change template
```

**Manual way** — add an entry under `projects:` directly:

```yaml
projects:
  existing-project:
    # ...
  new-project:
    desc: "My new project"
    dir: ~/projects/new-project
    windows:
      - name: Dev
        model: sonnet
      - name: Review
        model: opus
```

## Usage

### Launch a project

```bash
# Interactive project picker
claude-workstation

# Launch specific project
claude-workstation webapp

# Force new session (kills existing)
claude-workstation webapp --new
```

### Manage sessions

```bash
# List configured projects
claude-workstation --list

# Show active tmux sessions
claude-workstation --status

# Kill a project's session
claude-workstation --kill webapp
```

### Session persistence

The killer feature: **tmux sessions survive terminal closure**.

```bash
# Launch
claude-workstation webapp

# Detach (Ctrl+B D by default, or just close the terminal)
# All Claude Code instances keep running in the background!

# Reattach later — full conversation history preserved
claude-workstation webapp
```

### Recovering after reboot

After a system reboot, tmux sessions are lost. To restore Claude Code conversations:

1. Launch the workstation: `claude-workstation webapp`
2. In each pane, use Claude Code's `/resume` command to pick up where you left off
3. The `--name` flag makes it easy to identify which session belongs to which role

### tmux navigation

Default prefix is `Ctrl+B` (configurable in `~/.tmux.conf`):

| Shortcut | Action |
|----------|--------|
| `prefix D` | Detach (session stays in background) |
| `prefix O` | Cycle through panes |
| `prefix Z` | Zoom / unzoom current pane |
| `prefix Q` | Show pane numbers |
| `prefix arrow` | Move to adjacent pane |

## Layout

Panes auto-arrange in a **two-row, N-column grid**:

| Panes | Layout |
|-------|--------|
| 2 | 1 column, 2 rows |
| 3 | 2 top + 1 bottom |
| 4 | 2x2 grid |
| 5 | 3 top + 2 bottom |
| 6 | 3x2 grid |
| 8 | 4x2 grid |

The top row gets the extra pane when the count is odd.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_WORKSTATION_CONFIG` | `~/.config/claude-workstation/projects.yaml` | Path to config file |

## License

MIT
