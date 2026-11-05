# herdr-sisimomo-mods

Mods for [Herdr](https://herdr.dev). One folder per mod, each with its own
`RECIPE.md`.

| Folder | What it does |
|---|---|
| [`project-picker/`](project-picker/RECIPE.md) | Press a key, type a project's name, jump to its space or open a new one. |
| [`project-sidebar/`](project-sidebar/RECIPE.md) | The `project-sidebar` layout: right-click an agent or tab to mark it unread, and a colored initials badge per project in the Spaces and agents lists. |

Each folder is laid out like the Herdr home (`~/.config/herdr-app`): copy its
`mods/<name>/` (and `layouts/` if present) into place, and merge `keys.json`
if there is one. `project-sidebar/` is a layout: it needs every mod in its
`mods/` folder.
