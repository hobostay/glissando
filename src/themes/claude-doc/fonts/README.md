# Fonts — claude-doc theme

## Default fonts (free, auto-installed)

| Font | Role | License |
|---|---|---|
| **DM Serif Display** | Slide titles, headings | OFL — [Google Fonts](https://fonts.google.com/specimen/DM+Serif+Display) |
| **Inter** | Body text, bullets, UI | OFL — [Google Fonts](https://fonts.google.com/specimen/Inter) |
| **JetBrains Mono** | Code blocks | OFL — [GitHub](https://github.com/JetBrains/JetBrainsMono) |

These are downloaded and installed automatically by `./scripts/install-fonts.sh`.

## Premium upgrades (commercial, optional)

| Font | Replaces | Source |
|---|---|---|
| **Tiempos Headline** | DM Serif Display | [Klim Type Foundry](https://klim.co.nz/retail-fonts/tiempos-headline/) |
| **Styrene A** | Inter | [Commercial Type](https://commercialtype.com/catalog/styrene/styrene-a) |

To use premium fonts:

1. Purchase and place `.otf`/`.ttf` files in this directory
2. Run `./scripts/install-fonts.sh`
3. Update `src/themes/claude-doc/config.ts`:
   ```ts
   fonts: {
     heading: "Tiempos Headline",
     sans:    "Styrene A",
     serif:   "Tiempos Text",
     mono:    "JetBrains Mono",
   },
   ```

## Install

```bash
# macOS / Linux
./scripts/install-fonts.sh

# Windows (PowerShell)
.\scripts\install-fonts.ps1
```
