# Fonturi (găzduite local)

Generate din sursele oficiale [google/fonts](https://github.com/google/fonts) (SIL Open Font License 1.1, textul complet în `OFL.txt`), cu `fontTools`:

- fontul variabil original, fixat la grosimea folosită pe site (`instancer`);
- păstrate doar caracterele latine de bază + Latin-1 + diacriticele românești (ă â î ș ț, inclusiv ş ţ cu sedilă) + punctuația uzuală (`subset`);
- salvat ca `.woff2`.

| Fișier | Sursă | Unde se folosește |
|---|---|---|
| `playfair-display-700.woff2`, `-800` | PlayfairDisplay[wght].ttf | titluri |
| `lora-400.woff2`, `lora-400-italic.woff2` | Lora[wght].ttf, Lora-Italic[wght].ttf | text de corp, mesajul „scrie…” din chat |
| `inter-400/600/700.woff2` | Inter[opsz,wght].ttf (opsz 14) | butoane, meniu, formular |
| `jetbrains-mono-400.woff2` | JetBrainsMono[wght].ttf | etichete, metadate |

Motiv: pe mobil, Google Fonts aducea 8 fișiere (~290 KB) de pe 2 domenii în plus, care concurau la încărcare cu poza din hero. Acum sunt 7 fișiere (~145 KB) de pe același domeniu. Dacă adaugi o grosime nouă în CSS (ex. Inter 500), trebuie generat și fișierul ei, altfel browserul o simulează din cea mai apropiată.
