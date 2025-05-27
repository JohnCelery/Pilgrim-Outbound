import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';
import { createRenderer, drawMap } from './engine/renderer.js';
import { loadMap } from './engine/mapLoader.js';
import { createMapUI } from './ui/mapUI.js';
import { runEncounter } from './ui/encounter.js';
import { createDiary } from './ui/diary.js';
import { createInventory } from './ui/inventory.js';
// Keep both imports:
import { createTitleScreen } from './ui/titleScreen.js';
import { createResourceMenu } from './ui/resourceMenu.js';

import {
  POSITION,
  PROVISIONS,
  WATER,
  GEAR,
  IRON,
  SILVER,
  WOOD,
  FORTUNE,
  FLAGS,
  addPosition,
  addProvisions,
  addWater,
  addGear,
  addIron,
  addSilver,
  addWood,
  addFortune,
  addFlags
} from './components.js';
import { createHud } from './ui/hud.js';

function startGame() {
  const canvas = document.getElementById('game');
  canvas.width = 800;
  canvas.height = 600;

  const rng = createRng();
  const world = createWorld();
  const renderer = createRenderer(canvas);
  const loop = createLoop(step);

  let mapData = null;
  let currentWaypoint = null;
  const visitedWaypoints = new Set();
  let mapUI = null;
  let hud = null;
  let eventsData = null;
  let inventory = null;
  let resources = null;
  let gameOver = false;

  const player = world.createEntity();
  addPosition(world, player, 0, 0);
  addProvisions(world, player, 10);
  addWater(world, player, 10);
  addGear(world, player, 10);
  addIron(world, player, 0);
  addSilver(world, player, 0);
  addWood(world, player, 0);
  addFortune(world, player, 0);
  addFlags(world, player);

  hud = createHud(world, player);
  inventory = createInventory();
  inventory.hide();
  resources = createResourceMenu(world, player);
  resources.update();

  // A button to toggle the resource menu
  const resBtn = document.createElement('button');
  resBtn.textContent = 'Resources';
  resBtn.style.position = 'absolute';
  resBtn.style.left = '10px';
  resBtn.style.top = '130px';
  resBtn.style.zIndex = '6';
  resBtn.addEventListener('click', () => resources.toggle());
  document.body.appendChild(resBtn);

  // Button to toggle the inventory
  const invBtn = document.createElement('button');
  invBtn.textContent = 'Inventory';
  invBtn.style.position = 'absolute';
  invBtn.style.left = '10px';
  invBtn.style.top = '160px';
  invBtn.style.zIndex = '6';
  invBtn.addEventListener('click', () => inventory.toggle());
  document.body.appendChild(invBtn);

  const diary = createDiary();

  fetch('data/encounters.json')
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

    // Mark waypoint as visited, then update current waypoint info
    wp.visited = true;
    currentWaypoint = wp.name;
    visitedWaypoints.add(wp.name);
    if (mapData) {
      mapData.current = currentWaypoint;
      mapData.visited = visitedWaypoints;
    }

    // Possibly trigger 0-2 random encounters (weighted)
    if (eventsData && eventsData.encounters && eventsData.encounters.length) {
      const draws = Math.floor(rng.nextFloat() * 3); // 0, 1, or 2
      const queue = [];
      const available = eventsData.encounters.filter(e => {
        if (e.once && e._used) return false;
        return true;
      });
      for (let i = 0; i < draws && available.length; i++) {
        const total = available.reduce((s, ev) => s + (ev.weight || 1), 0);
        let roll = rng.nextFloat() * total;
        let pickedIndex = 0;
        for (let j = 0; j < available.length; j++) {
          roll -= available[j].weight || 1;
          if (roll <= 0) {
            pickedIndex = j;
            break;
          }
        }
        const ev = available.splice(pickedIndex, 1)[0];
        ev._used = ev.once ? true : ev._used;
        queue.push(ev);
      }

      const next = () => {
        if (!queue.length) {
          checkGameOver();
          return;
        }
        const ev = queue.shift();
        runEncounter(world, player, ev, diary.add, next);
      };
      if (queue.length) next();
    }

    if (mapUI) mapUI.update();
    checkGameOver();
  }

  loadMap(world).then(map => {
    mapData = map;
    const posRes = world.query(POSITION).find(r => r.id === player);
    if (posRes) {
      const { x, y } = posRes.comps[0];
      const start = mapData.waypoints.find(w => w.coords[0] === x && w.coords[1] === y);
      if (start) {
        start.visited = true;
        currentWaypoint = start.name;
        visitedWaypoints.add(start.name);
        mapData.current = currentWaypoint;
        mapData.visited = visitedWaypoints;
      }
    }
    mapUI = createMapUI(canvas, mapData, world, player, travelTo);
    // Initially disable, then enable once loaded or after title screen
    mapUI.disable();
    mapUI.update();
    mapUI.enable();
  });

  function step(_dt) {
    renderer.clear();
    const posRes = world.query(POSITION).find(r => r.id === player);
    const pos = posRes ? posRes.comps[0] : null;
    drawMap(renderer.ctx, mapData, pos);
    hud.draw(renderer.ctx);
    if (resources) resources.update();
  }

  loop.start();
}

function boot() {
  // Show title screen and pass startGame as callback
  createTitleScreen(startGame);
}

window.addEventListener('DOMContentLoaded', boot);

