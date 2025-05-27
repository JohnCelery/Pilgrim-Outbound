import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';
import { createRenderer, drawMap } from './engine/renderer.js';
import { loadMap } from './engine/mapLoader.js';
import { createMapUI } from './ui/mapUI.js';
import {
  POSITION,
  PROVISIONS,
  WATER,
  addPosition,
  addProvisions,
  addWater
} from './components.js';
import { createHud } from './ui/hud.js';
import { showEncounter } from './ui/encounter.js';

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

  // Preload encounter events
  fetch('data/events.json')
    .then(res => res.json())
    .then(data => {
      eventsData = data;
    });

  function travelTo(wp) {
    if (!mapData) return;
    const posRes = world.query(POSITION).find(r => r.id === player);
    const provRes = world.query(PROVISIONS).find(r => r.id === player);
    const waterRes = world.query(WATER).find(r => r.id === player);
    if (!posRes || !provRes || !waterRes) return;

    const pos = posRes.comps[0];
    const prov = provRes.comps[0];
    const wat = waterRes.comps[0];

    const currentWp = mapData.waypoints.find(
      w => w.coords[0] === pos.x && w.coords[1] === pos.y
    );
    if (!currentWp || !currentWp.neighbors?.includes(wp.name)) {
      console.warn('Cannot travel to non-neighbor waypoint');
      return;
    }

    const { food = 0, water = 0 } = wp.travelCosts || {};
    prov.amount -= food;
    wat.amount -= water;

    pos.x = wp.coords[0];
    pos.y = wp.coords[1];

    if (eventsData?.encounters?.length) {
      const idx = Math.floor(rng.nextFloat() * eventsData.encounters.length);
      showEncounter(eventsData.encounters[idx]);
    }
  }

  loadMap(world).then(map => {
    mapData = map;
    mapUI = createMapUI(canvas, mapData, travelTo);
  });

  function step(_dt) {
    renderer.clear();
    const posRes = world.query(POSITION).find(r => r.id === player);
    const pos = posRes ? posRes.comps[0] : null;
    drawMap(renderer.ctx, mapData, pos);
    hud.draw(renderer.ctx);
  }

  loop.start();
}

window.addEventListener('DOMContentLoaded', boot);
