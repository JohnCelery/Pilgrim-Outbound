1 Game in one breath
A lone courier, a tired horse, and a relic that might save what’s left of Charlemagne’s realm.
Spend food, water, and gear while crossing a parchment map. Survive bleak, mystical encounters, harvest ruined lands for supplies, and chase one of six colour-coded legends before starvation, plague, or fate ends the journey.

2 Core play loop
Title → Ride
Click “Begin Journey,” optionally type a seed, then “Ride.”

World Map
Parchment Europe appears. The courier marker stands on the start node; adjacent nodes light up on hover with their food/water cost and tags.

Travel
Clicking Fold Road subtracts resources, advances the day, animates the marker, and writes departure/arrival diary lines.
If food or water hits zero, a death panel ends the run. (Gear depletion is also a potential death condition—see below.)

Arrival Encounters
Zero-to-two story cards pop in a framed modal. Each card shows art, text, and three choices. Choosing one applies its whole bundle of resource deltas, items, flags, RNG, and a diary sentence—then closes the modal or, if fatal, shows the death panel.

Locality Sites
The node’s resource sites appear as clickable tiles (farm, forest, mine, etc.). Each click opens a depth slider; every step costs 5 Food + 1 Gear, rolls loot, risks mishap, and logs to the diary. Gear can reach zero here if the player spends too much; see ‘Death causes’ below.

Camp / Inventory
The leather 6 × 4 grid fills the centre screen. Drag items to rearrange, click Craft to build modules, click Repair to spend iron or fortune on Gear. Flags like plague tick here.

Legend Check
If the node matches an active legend coordinate and the required cargo is on board, an ending illustration plays, credits roll, a score screen lists days, leftover fortune, and flags, and the caravan is archived as a “grave” discoverable in future runs.

Back to Map
If no ending triggers, the camp screen closes and the map awaits the next move. The loop repeats until victory or any death condition fires.

Death causes: starvation, thirst, gear break, instant-death event, or manual abandon.

3 Where you can arrive and what you can do
Market towns: trade food, water, iron, silver; hire healer or translator; haggle; pay church tithe.

Monasteries: repair gear, cure plague, study Latin, safe vespers rest, tempt theft of relics.

Farmland hamlets: harvest grain by depth, help peasants for goodwill, fend off bandits.

Forest clearings: gather wood and herbs, hunt game, seek hidden shortcuts, track clockwork stag.

Mountain passes: mine iron and stone, scavenge Roman debris, light signal fires, risk avalanches.

River fords or bridges: refill water, fish, hire ferry, inspect singing chains.

Ports: buy silk and copper, book sea passage, gossip for rumours, barter with raiders.

Roman ruins: explore aqueducts for tech shards, collect mosaic, meditate for visions.

Battlefields: scavenge scrap, tend wounded, loot siege engines, burn plague piles.

Hidden pilgrim paths: pay fortune to worm-hole skip, hide entrance, trace runes.

Crossroads encampments: rest free, read rumour board, gamble, visit swordsmith, patrol for ambush.

Cathedral cities (hubs): grand market, unlimited crafting benches, audience with high clergy or emir, commission manuscripts, pray under stained glass.

4 Art asset checklist (create in this order)
parchment_tile.png – seamless 1024 × 1024 background.

europe_map.png – 1152 × 768 inked continent.

Node icons: node_default, node_current, node_visited.

marker.png (+ optional shadow).

UI chrome: button plank, tooltip panel, modal frame.

grid_cell.png – inventory tile.

Starter item sprites – grain sack, waterskin, toolkit.

Site-extraction tiles – grain field, woodpile, ore vein, fish net, scrap heap, mosaic shard.

HUD rings – food, water.

Twelve locality hero panels (one per node class).

Encounter hero panels – one per story card.

Six ending illustrations.

(Any not finished should be referenced with the literal URL PASTE_URL_HERE.)

Global style: hand-inked 1–3 px lines, muted earth palette plus lapis, vermilion, gold accents, parchment grain overlay 15%, dramatic single-source lighting, lonely and ominous.

5 Project layout (zero build)
index.html – loads ES modules.

css/ – root styles.

js/core/ – rng, ecs, scheduler, save.

js/scenes/ – map, encounter, inventory.

js/data/ – nodes.json, encounters.json, recipes.json.

assets/images/ – all PNGs above.

sw.js – optional offline stub.

Run locally with python3 -m http.server and open http://localhost:8080.

6 Open implementation tasks
Bootstrap: title → seed prompt → map with state initialized and diary line.

Travel: preview cost, consume meters, move marker, death on zero.

Encounter modal: show art, text, three buttons, apply outcomes, diary write, fatal jumps.

Locality & craft: site-depth harvesting, inventory drag-drop, crafting, repair, legend ending.
