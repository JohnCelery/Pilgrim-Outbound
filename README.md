# Pilgrim Outbound  
*A zero-dependency browser roguelike set in a mythic age*


---

## Setting  
A great empire has splintered, sea raiders menace every coast, and rumors of plague drift on the trade winds.
You are a battered royal courier who wakes in the aftermath of a raid, far from home, holding a relic that could decide the fate of a kingdom. With only a weary mount, a torn map, and a half-empty saddlebag, you must thread rival realms and warring frontiers to deliver your charge—or die unknown along the road.

---

## Core Fantasy  
* Total isolation on a dangerous medieval road network.  
* Hard choices about where to spend dwindling food, water, and gear integrity.  
* The constant lure of side-paths—ruined Roman forts, plague-stricken towns, secret pilgrim trails—that promise miracle rewards or instant ruin.  
* No restart checkpoints; death erases the run but leaves your abandoned baggage as a discoverable loot cache for the next attempt.

---

## How a Run Plays Out  

| Phase | What Happens |
|-------|--------------|
| **1. Chart the Route** | Study a parchment map dotted with monasteries, markets, and mountain passes.  Click a neighboring waypoint; the game previews the food & water cost and any known dangers. |
| **2. Pay the Price** | Spend provisions and water.  If either meter hits zero, the courier collapses. |
| **3. Face the Unknown** | On arrival, one or two narrative events roll: a Norse ambush, a kindly friar, a field surgeon demanding payment.  Short, choose-your-own-adventure snippets can grant supplies, damage gear, or branch into long mission arcs. |
| **4. Exploit the Locale** | Each node houses 0–4 resource sites: farms (grain), forests (herbs & wood), rivers (water & fish), mines (iron).  Spend tools and stamina to harvest, risking damage with each deeper dig. |
| **5. Repack & Craft** | Tetris-pack loot into the 6 × 4 saddlebag grid.  Recipes—taught by scholars or found in Roman ruins—let you forge upgrades (chainmail, compass, astrolabe) if the required pieces fit adjacent in the grid.  Better packing grants adjacency bonuses. |
| **6. Push On** | Check diary missions (six color-flagged “legends” that can end a run), pick the next waypoint, and repeat until you reach an ending— or run out of life support. |

A successful journey lasts 30–60 minutes.  Most fail in 10–20.

---

## Themes & Tone  
* **Solitude & Fatalism** – No party, no cavalry; the road itself is the antagonist.  
* **Syncretic Mysticism** – Miracles, omens, and science coexist; a Muslim scholar’s astrolabe is as valuable as a saint’s finger-bone.  
* **Determinism** – Every run is driven by a single seed; with perfect memory you could reproduce it move-for-move.  
* **Ephemeral Legacy** – Death wipes the slate, yet leaves ghostly traces: half-decoded languages, graves containing your previous gear, rumors travelers whisper about “the fallen rider.”  

---

## Art-Asset Guidelines  (v0.1)
These specs are “contract values” the code will assume.  
Stick to them unless we explicitly change the baseline in a future PR.

| Category | Canvas units | Native pixel size | Notes / Style |
|----------|--------------|-------------------|---------------|
| **Tiling backgrounds** | full screen | 1024 × 1024 | Seamless parchment or leather tiles. Warm tan #d8c79e base; subtle fiber noise. PNG or high-q WebP. |
| **Map nodes** | 1 × 1 tile | 64 × 64 | Three sprites per node: `node_default.png`, `node_current.png`, `node_visited.png`. Transparent BG. |
| **Courier marker** | ¾ tile | 48 × 48 | Horse-and-rider silhouette + separate 16 px oval shadow (`marker.png`, `marker_shadow.png`). |
| **HUD dials** | 1½ tiles | 96 × 96 | Empty ring only—code will draw meter arc. Center glyphs: wheat = food, droplet = water. |
| **Inventory grid cell** | 1 × 1 tile | 64 × 64 | Weathered-leather square with stitched border (`grid_cell.png`). Must tile seamlessly. |
| **Inventory items** | various | multiples of 48 × 48 (inside 64 × 64 cells) | Keep outline, drop-shadow, and 4 px padding transparent. Example placeholders:<br>• `grain_sack_1x1.png` 48×48<br>• `waterskin_1x2.png` 48×96<br>• `toolkit_2x1.png` 96×48 |
| **Event/modal frame** | n/a | 1280 × 400 | Illuminated manuscript border, transparent center (`modal_frame.png`). |
| **Large illustrations** (future) | width-fit | ≤ 1280 × 720 | Used for cut-scenes / endings; keep file < 300 KB. |

### Naming & Placement
* Place all runtime images in `assets/images/`.
* Use lowercase snake-case filenames; dimensions encoded only when needed (`itemname_2x1.png`).
* The build remains atlas-agnostic for now; code loads each PNG by URL.

### Colour & Finish
* Palette: lapis blue (#2554a3), vermilion (#c0352b), verdigris (#44a167), ochre (#d7a13b), bone (#f9f3e1), and ebony (#232323).
* Bold hand-inked outlines (≈2 px at 1× scale), flat fills, light paper grain overlay.
* Export with premultiplied alpha OFF.

> **Rule of thumb:** if an image won’t align to the 64 px grid or the sizes above,
> decide whether it’s UI (stick to spec) or illustration (free to scale) and name accordingly.

---

## Endgame Paths (When Complete)  
1. **Azure – Pax Romana**: escort the relic to the grand cathedral and secure high sanction.
2. **Vert – Seed of Yggdrasil**: ally with a Norse skald to plant a holy oak on pagan soil.  
3. **Or – House of Wisdom**: ferry four scholars to a distant library to spark a new renaissance.
4. **Gules – The Red Cross**: raise a refugee banner and break a siege.  
5. **Sable – The Black Plague**: venture into a quarantined city bearing a legendary cure—or join the darkness.  
6. **Argent – Homecoming**: thread treacherous borders to lay the relic at a dying king’s bedside.

Each legend unveils organically through events; pursuing one closes others, forcing a strategic narrative choice.

---

## The Promise  
When finished, *Pilgrim Outbound* will be a pick-up-and-die-trying browser game:  
clickable, readable, no installs, but deep enough that veterans will chase perfect runs, dissect seed patterns, and swap campfire stories of the one caravan that almost made it home.

## Current Status
- Title screen boots to a parchment world map
- Travel preview and confirmation overlays show supply costs and modifiers
- Travel limited to adjacent nodes with random encounter events
- Locality overlays support depth-based resource harvesting
- Running out of food or water brings up a death screen
- Drag-and-drop inventory grid for looting

