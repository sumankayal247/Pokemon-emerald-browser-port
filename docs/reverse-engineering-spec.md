# Reverse-engineering specification

This is the living implementation map. “Pending” means not implemented; it is intentionally not represented by a fake approximation.

## Architecture and dependencies

```text
fixed clock → input/tasks/scripts → explicit GameState
                                  ↓
source data → map/collision/objects → field transitions/encounters
                                  ↓
                         renderer/audio adapters

RNG + Pokémon data → party/inventory → battle engine → battle scripts/AI
flags/vars + script VM → world progression → save serializer → IndexedDB
```

The core will stay renderer-independent. Browser adapters own Canvas, Web Audio, keyboard/gamepad, and IndexedDB. Gameplay code receives explicit state and deterministic RNG instances.

## Field/world

**Source:** `overworld.c`, `fieldmap.c`, `field_camera.c`, `field_player_avatar.c`, `event_object_movement.c`, `metatile_behavior.c`, map JSON/layout binaries, tileset binaries.

- Input is sampled once per logic frame. A direction unlike the current movement direction turns in place; the next held frame attempts movement.
- Normal walking is tile constrained. The current implementation advances one pixel-equivalent per logic frame for 16 frames.
- Destination checks are ordered around map collision/directional behavior, camera/map bounds, elevation, and object occupancy. Packed layout words use ID bits 0–9, collision 10–11, elevation 12–15.
- Directional blocking checks the entered edge of the destination and opposite edge of the current metatile.
- Metatiles contain four lower and four upper 8×8 tiles. Layer type determines whether upper graphics are below or above object sprites.
- Connections require a seven-metatile map-buffer margin and coordinate remapping. **Pending.**
- Forced movement, ledges, bikes, surfing, reflection, grass effects, doors, and encounters are **pending** and must follow their source state machines.

## Event scripts

**Source:** `script.c`, `scrcmd.c`, `field_control_avatar.c`, `data/scripts`, per-map `scripts.inc`.

The full engine needs an instruction pointer, call stack, native-wait state, lock state, local result/special variables, global vars/flags, and scheduled object movements. Commands may complete immediately or yield across frames. Map scripts run at load/transition/frame/warp phases. The current vertical slice implements only audited Littleroot message interactions and transition placement; the general bytecode/command VM is **pending**.

Planned command families: flow (`goto/call/return` and conditions), data (`setvar/addvar/copyvar`, flags), message/menu, object movement, warp/door, trainer/battle, inventory/Pokémon, audio/fanfare, and special/native callbacks.

## State and persistence

The central state must include save position/map, player identity/options, party/boxes, bag/money, Pokédex, flags, vars, object persistence, berry/TV systems, weather, script execution, and active battle. Runtime-only rendering resources are excluded. IndexedDB storage will use a versioned schema and transactional slot writes. Logical equivalence is required; byte-identical Flash sectors are not. **Persistence is pending.**

## RNG

**Source:** `random.c`, `random.h`.

`value = value * 1103515245 + 24691 (mod 2^32)` and each call returns bits 16–31. Main and secondary streams remain separate. Call ordering is gameplay state and must never be consumed by rendering.

## Pokémon

**Source:** `pokemon.c`, `pokemon_storage_system.c`, `data/pokemon`, `data/pokemon_graphics`, constants.

Required state includes personality/OT identity, species, language, nickname, moves/PP, EVs/IVs, condition, friendship, held item, Pokerus, met data, ribbons and party-only calculated stats/status. Stats must preserve nature, IV/EV and integer truncation order. Growth tables, learnsets, evolution methods, breeding, forms and encrypted GBA storage semantics must be understood before adaptation. **Pending.**

## Battle

**Source:** `battle_main.c`, `battle_util.c`, `battle_script_commands.c`, `battle_ai_*`, `data/battle_scripts_*`, move/species/item/ability data.

Battle is a script-driven state machine, not one damage function. Inputs are battler commands and deterministic RNG; state includes battlers, parties, side/field timers, statuses, stat stages, chosen actions, turn order, move result flags, scripting stacks and controller queues. Ordering must preserve priority/speed ties, pre-move checks, targeting, accuracy, criticals, damage integer operations, effects, abilities/items, fainting, experience and replacement. Wild/trainer/double/facility/link variants depend on battle type flags. **Entire subsystem pending.**

## Audio

**Source:** `sound/`, `audio/`, `m4a.c`, song tables and map music selection.

Browser replacement: decoded/converted source sequences and samples scheduled through Web Audio, retaining loop points, priority, fanfare waits, panning and map/battle transitions. It must not drive game timing. **Pending.**

## Browser replacements

- GBA VBlank/tasks → fixed-step scheduler plus RAF presentation.
- BG/OAM/VRAM/palettes → immutable decoded assets and Canvas/WebGL layers.
- keypad register → edge/held input snapshot, later Gamepad API.
- Flash save → versioned IndexedDB transactions.
- m4a hardware mixer → Web Audio graph.
- RTC/link hardware → separately specified browser services; never silently approximated.

## Fidelity gates

A subsystem is complete only after source references, data extraction, transition/timing tests, deterministic fixtures, edge cases, and integration tests exist. Visual resemblance alone does not pass. Current gate passed only for the narrow Littleroot rendering/movement/message slice documented in `source-map.md`.
