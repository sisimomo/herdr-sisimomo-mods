# Project Sidebar

The stock Herdr window with a smarter sidebar. Each project gets a colored
badge holding its initials, in the Spaces list and in the agents list, so an
agent row shows which project it works in. Right-click an agent or a tab to
mark it unread again, and it shows as "done" until you go back to it.

![Project Sidebar](preview.png)

## What you see

The stock `main` window, left to right: a 268 px sidebar (chrome background,
not resizable) and the work area. Only the sidebar lists and the tabs change.

- **Spaces list:** each row's single-letter square is replaced by the
  project's badge: 24 px, corner radius 28% of the size, bold white text, on a
  fill of the space's color.
- **Agents list:** the badge takes the AI program icon's place, in the color of
  the agent's space (default `ansi6`). The agent's own icon (a 10 px glyph in a
  14 px circle with a ring in the row's background color) is stacked on the
  badge's lower right corner, like an avatar stack. The slot is 32 px wide, so
  about 6 px of the circle overlaps the badge.
- **Initials:** the name is split into words, and one letter per word is kept,
  up to four, upper-cased. Words split on anything that is not a letter or
  digit and on case changes (`HTTPServer` is `HTTP` and `Server`).

  | Name | Badge |
  |---|---|
  | `ai-chat`, `myCoolApp`, `MyCoolApp`, `snake_case_name` | AC, MC, MC, SC |
  | `MAX_RETRY_COUNT`, `HTTPServer`, `Hello World`, `my.dotted.name` | MR, HS, HW, MD |
  | `herdr` | H |
  | `my_cool_app_v2` | MCAV |

  One or two letters sit on one row. Three or four go on two rows of two, in a
  smaller font. Words with no letter are skipped when another word has one; a
  name with no letters at all uses its first characters, and an empty name
  shows `?`.
- **Worktrees:** a linked git worktree is the same project, so it wears the
  main checkout's badge: same letters, same color. If a repo has no main
  checkout space, the first space of that repo leads.
- **Mark as unread popup:** 180 px wide, `popover` background, 31 px rows,
  12.8 px text. On an agent row it holds one item, **Mark as unread** (or
  **Mark as read** if already marked). On a tab it holds that item, then
  Rename, New tab and Close (this replaces the stock tab menu).
- **Marked agents:** an idle marked agent shows the "done" dot in the agents
  list (and sits in the Done section in Priority view). Its tab shows the 6 px
  done dot.

## How it behaves

- **Statuses:** marking only changes how an idle agent looks. A working or
  blocked agent keeps its own indicator while marked; the mark shows once it
  goes idle. Done and idle look as the stock window draws them.
- **Right-click** an agent row or a tab opens the popup above. Left clicks,
  keys and hovers are the stock ones, including the click on the agent icon
  that folds sub-agents.
- **Clearing a mark:** moving focus onto the agent clears its mark. Marking the
  agent you are on keeps the mark until you leave and come back. **Mark as
  read** clears it at once.
- **On a tab,** the toggle applies to every agent in the tab, and the tab shows
  done if any of them is marked.
- **Colors:** recoloring the main space recolors its worktrees' badges. Picking
  a color on a worktree space itself changes nothing in these lists.
- Herdr's own sounds, toasts, next/previous agent and the real status are
  unchanged. The marks only change what the agents list and the tabs draw.

## Built from

- `layouts/project-sidebar.json`: a clone of `main` (0.1.13), same node tree.
  Its `spaces` block uses `initials-badge-spaces`, `agents` uses
  `initials-badge-agents` and `tabs` uses `mark-unread-tabs`. The other blocks
  stay on the shipped mods `workspace-chrome` (brand and footer), `pane`
  (pane header), `files`, `changes` and `workspace-status`.
- `mods/mark-unread-menu/`: the popup. `mod.json`
  `{ "place": "none", "overlay": { "width": 200, "height": 100 } }`. Props
  `{ kind: "agent", terminal }` or
  `{ kind: "tab", tab, space, terminals: [addresses] }`. Toggles the marks in
  `shared("unread")` (`{ "<terminal address>": true }`) with `setShared`, and
  closes with `closeOverlay(props()?.overlay)`.
- `mods/mark-unread-agents/`: a clone of the shipped `agents` mod. In `render`
  it reads `shared("unread")`, clears the mark of the agent that just became
  focused (tracking `this.lastFocused`), maps marked idle agents to status
  `"done"`, and adds `.on_mouse_down("right", …)` on each row that opens
  `mark-unread-menu` with `{ kind: "agent", terminal }`.
- `mods/mark-unread-tabs/`: a clone of the shipped `tabs` mod. It computes a
  per-tab `status` ("done" if idle and any `agents()` entry of that tab is
  marked), uses it for the dot, and its right-click opens `mark-unread-menu`
  with `{ kind: "tab", … }`. Ships `win-close.svg`, `win-max.svg`,
  `win-min.svg` and `win-restore.svg`.
- `mods/initials-badge-spaces/`: a clone of the shipped `spaces` mod. `row()`
  calls `projectBadge(project?.name ?? w.name, fill, 24)`. It already runs git
  per space (`--git-common-dir` names the main repo). In `ordered()` it picks a
  lead space per repo (the non-linked checkout, else the first space of that
  repo) and, for each linked worktree space, publishes
  `shared("space.projects")`:
  `{ "<space id>": { "name": "<lead space name>", "from": "<lead space id>" } }`.
  The name feeds the initials and `shared("space.colors")[from]` the color,
  read live.
- `mods/initials-badge-agents/`: the `mark-unread-agents` mod with
  `projectBadge(project?.name ?? (a.space_name || label(a)), fill, 24)` where
  the program icon was, plus the stacked mini icon (the slot is `w(32)`; widen
  it to move the icon further out). It has no git of its own and only reads
  `space.projects` and `space.colors`. Its sort popup opens
  `initials-badge-agents`.
- `initials()` and `projectBadge()` are the same code in both
  `initials-badge-*` mods: mods can't import each other, so change both
  together.
- `herdr` functions used: `agents`, `spaces`, `panes`, `terminals`, `focused`,
  `layout`, `window`, `shared` / `setShared`, `setAgentOrder`, `openOverlay` /
  `closeOverlay`, `props`, `theme`, `watchFolder`. Commands: `space.*`,
  `tab.*`, `pane.focus`, `terminal.pin`, `layout.*`, `window.*`.
- Programs: `initials-badge-spaces` runs `git` (read-only `rev-parse` and
  `status`) and `hc machine ls` through `exec` / `hc`, as the shipped `spaces`
  mod does. No network calls.
- Shipped assets used: `mods/workspace-chrome/*.svg`, `mods/pane/close.svg`,
  `mods/files/file.svg`, `mods/changes/changes.svg`.

## Watch out

- The shipped mods and layouts are read-only and replaced on every start, so
  this works on clones. Clones are never updated: later changes to Herdr's
  `agents`, `tabs`, `spaces` or `main` need to be merged by hand.
- `initials-badge-spaces` must be shown too for worktrees: without it
  `space.projects` is never published and agents fall back to the space name.
- `mark-unread-menu`'s `props()` is empty under `herdr-app check`; read it with
  `props() ?? {}`.
- A bare number in `line_height` is a multiplier, not pixels.
- Don't copy `gpui-kit.d.ts` or `jsconfig.json`.
- To add this to another custom layout, point its `spaces`, `agents` and
  `tabs` blocks at `initials-badge-spaces`, `initials-badge-agents` and
  `mark-unread-tabs`.
- Untested: what a mark does across an app restart; the badge on Windows and
  Linux; non-Latin names (the first character is used as is).

## Done when

- `herdr-app check` passes for all five mods in `mods/`.
- After `layout.switch {name: "project-sidebar"}`, a space named `ai-chat`
  shows `AC` and its agents show the same badge in the same color.
- A four-word name shows two rows of two letters, none clipped.
- A worktree space's agents show the same badge letters and color as the main
  space's, even if the worktree space has its own saved color.
- Right-clicking an idle agent and choosing Mark as unread shows the done dot
  on its row and its tab.
- Switching to another agent and back removes the dot; Mark as read removes it
  at once.
- A working or blocked agent keeps its own indicator while marked.
