# Pokémon Emerald browser runtime

A browser-native, deterministic reimplementation guided directly by [`pret/pokeemerald`](https://github.com/pret/pokeemerald). It does not execute or compile the ROM and is not an emulator.

## Current playable slice

The app opens directly into a full-screen GBA-sized viewport and renders the real Littleroot Town layout from the decompilation. The current slice includes:

- extracted primary/secondary metatiles, palettes, layers, map blocks, attributes, events, and object sprites;
- fixed 59.7275 Hz logic clock and Emerald's ISO C RNG;
- tile movement with the original 16-frame normal walking cadence, turn-before-walk behavior, packed collision, elevation, directional blockers, and object collision;
- lower/covered/top metatile priority around sprites;
- real Littleroot sign/NPC interactions transcribed from its event script;
- keyboard input: arrows = D-pad, **Z = A**, **X = B**, Enter = Start, Shift = Select.

This is a foundation and vertical slice, **not a claim that the full game is complete**. Warps, the complete script VM, interiors, battles, save data, audio, and most Emerald systems remain to be ported.

## Run

```bash
npm install
npm run dev
```

Build and tests:

```bash
npm run build
npm test
```

## Re-extract from the reference source

The generated runtime assets are checked in. To reproduce them from source:

```bash
git clone --depth 1 https://github.com/pret/pokeemerald reference/pokeemerald
npm run extract:emerald
```

See [`docs/reverse-engineering-spec.md`](docs/reverse-engineering-spec.md) and [`docs/source-map.md`](docs/source-map.md).
