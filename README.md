# Key Copier (Web)

A browser port of [zinongli/KeyCopier](https://github.com/zinongli/KeyCopier), a Flipper Zero app
for reading a key's bitting depths by eye. Lay a physical key on the screen, line it up with the
on-screen contour, and nudge each pin's depth until the notches match the key.

No install, no app — it's a static site, and it runs entirely in the browser (no data leaves your
device).

## Why calibration matters

The Flipper's screen is a fixed, known physical size, so its firmware can draw the contour at true
scale without asking. A phone, tablet, or laptop screen can't be assumed — screen density varies
wildly across devices — so this version has you calibrate once by matching an on-screen box to
something you already have on hand (a card, a banknote, a coin, or a known px/inch value). That
calibration is what makes the contour line up 1:1 with a real key.

## Running it locally

It's plain HTML/CSS/JS with no build step, but it uses ES modules, which browsers block over
`file://`. Serve it with any static file server, for example:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`.

A `.claude/launch.json` is included for Claude Code's preview tooling, but the app itself has no
framework or dependency requirements.

## What's included

- All 23 key formats from the original firmware (Kwikset, Schlage, Arrow, Master Lock, American,
  Yale, Sargent, National, Corbin, Lockwood, Russwin, Weiser, Best/SFIC, several automotive
  double-sided/tip-stop formats, and RV locks) — see [js/keyFormats.js](js/keyFormats.js)
- The same contour geometry as the original — pin spacing, V-cut slope, and the MACS/clearance
  adjacent-cut logic — generalized from the Flipper's fixed 128×64 screen to an arbitrary
  calibrated px-per-inch scale — see [js/renderer.js](js/renderer.js)
- Screen calibration against a credit/ID card, an AU $20 note, an AU $1 or $2 coin, or a manual
  px/inch entry — see [js/calibration.js](js/calibration.js)
- Tap-and-drag, +/- buttons, or arrow keys to set each pin's depth, with live MACS clamping
- Save/load keys to `localStorage`, JSON export/import, and a shareable link that encodes the
  format and bitting pattern in the URL — see [js/storage.js](js/storage.js) and
  [js/app.js](js/app.js)

## Notes on the data

The key format database is a straight port of the original firmware's spec sheet, which is
overwhelmingly US lock-industry standards (Kwikset, Schlage, etc.), plus Japanese motorcycle
formats and one Australian brand, Lockwood. It doesn't cover most other regional hardware.

## License

MIT, same as the original project. Bitting geometry and key format data are ported from
[zinongli/KeyCopier](https://github.com/zinongli/KeyCopier) (MIT License, © 2024 zinongli).
