# Fonts (self-hosted)

Generated from the official [google/fonts](https://github.com/google/fonts) sources (SIL Open Font License 1.1, full text in `OFL.txt`), with `fontTools`:

- the original variable font, pinned to the weight used on the site (`instancer`);
- only basic Latin characters + Latin-1 + Romanian diacritics (ă â î ș ț, including ş ţ with cedilla) + common punctuation kept (`subset`);
- saved as `.woff2`.

| File | Source | Where it's used |
|---|---|---|
| `playfair-display-700.woff2`, `-800` | PlayfairDisplay[wght].ttf | headings |
| `lora-400.woff2`, `lora-400-italic.woff2` | Lora[wght].ttf, Lora-Italic[wght].ttf | body text, the "typing…" message in chat |
| `inter-400/600/700.woff2` | Inter[opsz,wght].ttf (opsz 14) | buttons, menu, form |
| `jetbrains-mono-400.woff2` | JetBrainsMono[wght].ttf | labels, metadata |

Reason: on mobile, Google Fonts pulled in 8 files (~290 KB) from 2 extra domains, which competed for load time with the hero photo. Now there are 7 files (~145 KB) from the same domain. If you add a new weight in CSS (e.g. Inter 500), its file needs to be generated too, otherwise the browser fakes it from the closest one available.
