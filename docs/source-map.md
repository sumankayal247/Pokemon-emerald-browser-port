# Source-to-browser traceability

| Browser subsystem | `pokeemerald` reference | Preserved behavior in current slice |
|---|---|---|
| Fixed clock | `src/main.c`, VBlank-driven field updates | 59.7275 Hz deterministic updates independent of RAF |
| RNG | `src/random.c`, `include/random.h` `ISO_RANDOMIZE1` | unsigned 32-bit LCG and high-16 return |
| Input/player state | `src/overworld.c:FieldInput_Process`, `src/field_player_avatar.c:PlayerStep`, `CheckMovementInputNotOnBike` | one cardinal direction, turn before movement, movement lock |
| Collision | `src/event_object_movement.c:GetCollisionAtCoords`, `IsMetatileDirectionallyImpassable`, `IsElevationMismatchAt` | packed collision bits, directional behavior edges, elevations, map/object bounds |
| Map buffer/data | `src/fieldmap.c`, `include/global.fieldmap.h`, `include/fieldmap.h` | 10-bit metatile IDs, collision/elevation unpacking, metatile behavior/layer attributes |
| Field rendering | `src/field_camera.c:DrawMetatile` | 8 constituent tiles, flips, palette selection, covered/normal/split sprite priority |
| Tileset palette load | `src/fieldmap.c:LoadMapTilesetPalettes`; `NUM_PALS_IN_PRIMARY` | General palettes 0–5 plus Petalburg palettes 6–12 |
| Littleroot layout | `data/layouts/layouts.json`, `data/layouts/LittlerootTown/map.bin` | exact 20×20 packed block layout |
| Littleroot events | `data/maps/LittlerootTown/map.json`, `scripts.inc` | map object coordinates, transition placement of the twin, signs and initial NPC messages |
| Player animation | `src/data/object_events/object_event_anims.h`, `object_event_pic_tables.h` | source frame order, east flip, 8-frame walking animation halves; OBJ palette index 0 converted to browser alpha |
| Field dialogue UI | `src/menu.c:WindowFunc_DrawDialogueFrame`, `src/fonts.c`, `charmap.txt`, `graphics/fonts/latin_normal.png`, `graphics/text_window/message_box.png` | original 8×8 frame tiles, 16×16 glyph cells, Emerald character codes, and per-glyph advances |

## Asset extraction

`tools/extract-littleroot.cjs` parses indexed 4bpp PNG data without color-index loss, applies JASC palettes, decodes GBA metatile descriptors (tile, horizontal/vertical flip, palette), and emits separate lower/upper RGBA atlases. It copies source object-event PNGs and serializes map/event data. Generated assets retain a `source` field.
