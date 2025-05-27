import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';
import { createRenderer, drawMap } from './engine/renderer.js';
import { loadMap } from './engine/mapLoader.js';
import { createMapUI } from './ui/mapUI.js';
import { runEncounter } from './ui/encounter.js';
import { createInventory } from './ui/inventory.js';
import {
  POSITION,
  PROVISIONS,
  WATER,
  HEALTH,
  STAMINA,
  addPosition,
  addProvisions,
  addWater,
  addHealth,
  addStamina
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
  let inventory = null;
  let gameOver = false;

  const player = world.createEntity();
  addPosition(world, player, 0, 0);
  addProvisions(world, player, 10);
  addWater(world, player, 10);
  addHealth(world, player, 10);
  addStamina(world, player, 10);
  hud = createHud(world, player);
  inventory = createInventory();

  fetch('data/events.json')
    .then(r => r.json())
    .then(json => {
      eventsData = json;
    });

  function checkGameOver() {
    const provRes = world.query(PROVISIONS).find(r => r.id === player);
    const waterRes = world.query(WATER).find(r => r.id === player);
    const prov = provRes ? provRes.comps[0].amount : 0;
    const wat = waterRes ? waterRes.comps[0].amount : 0;
    if ((prov <= 0 || wat <= 0) && !gameOver) {
      gameOver = true;
      alert('You have collapsed from exhaustion. Game over.');
      if (mapUI) mapUI.disable();
    }
  }

  function travelTo(wp) {
    console.log('Traveling to', wp.name);

    // Spend provisions and water according to travel costs
    const costs = wp.travelCosts || { food: 0, water: 0 };

    const provRes = world.query(PROVISIONS).find(r => r.id === player);
    if (provRes) {
      const prov = provRes.comps[0];
      prov.amount = Math.max(0, prov.amount - (costs.food || 0));
    }

    const waterRes = world.query(WATER).find(r => r.id === player);
    if (waterRes) {
      const wat = waterRes.comps[0];
      wat.amount = Math.max(0, wat.amount - (costs.water || 0));
    }

    // Update player position
    const posRes = world.query(POSITION).find(r => r.id === player);
    if (posRes) {
      const pos = posRes.comps[0];
      const [x, y] = wp.coords;
      pos.x = x;
      pos.y = y;
    }

    if (eventsData && eventsData.encounters && eventsData.encounters.length) {
      const idx = Math.floor(rng.nextFloat() * eventsData.encounters.length);
      runEncounter(world, player, eventsData.encounters[idx], checkGameOver);
    }

    if (mapUI) mapUI.update();
    checkGameOver();
  }

  loadMap(world).then(map => {
    mapData = map;
    mapUI = createMapUI(canvas, mapData, world, player, travelTo);
    mapUI.update();
  });

  function step(_dt) {
    renderer.clear();
    drawMap(renderer.ctx, mapData);
    hud.draw(renderer.ctx);
  }

  loop.start();
}

window.addEventListener('DOMContentLoaded', boot);
