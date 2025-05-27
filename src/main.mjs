import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';
import { createRenderer, drawMap } from './engine/renderer.js';
import { loadMap } from './engine/mapLoader.js';
import { createMapUI } from './ui/mapUI.js';
import { runEncounter } from './ui/encounter.js';
import {
  POSITION,
  PROVISIONS,
  WATER,
  addPosition,
  addProvisions,
  addWater
} from './components.js';
import { createHud } from './ui/hud.js';

function boot() {
  const canvas = document.getElementById('game');
  canvas.width = 800;
  canvas.height = 600;

  const rng = createRng();
  const world = createWorld();
  const renderer = createRenderer(canvas);
  const loop = createLoop(step);

  let mapData = null;
  let mapUI = null;
  let hud = null;
  let eventsData = null;

  const player = world.createEntity();
  addPosition(world, player, 0, 0);
  addProvisions(world, player, 10);
  addWater(world, player, 10);
  hud = createHud(world, player);

  fetch('data/events.json')
    .then(r => r.json())
    .then(json => {
      eventsData = json;
    });

  function travelTo(wp) {
    console.log('Traveling to', wp.name);
    if (eventsData && eventsData.encounters && eventsData.encounters.length) {
      const idx = Math.floor(rng.nextFloat() * eventsData.encounters.length);
      runEncounter(eventsData.encounters[idx]);
    }
  }

  loadMap(world).then(map => {
    mapData = map;
    mapUI = createMapUI(canvas, mapData, travelTo);
  });

  function step(_dt) {
    renderer.clear();
    drawMap(renderer.ctx, mapData);
    hud.draw(renderer.ctx);
  }

  loop.start();
}

window.addEventListener('DOMContentLoaded', boot);
