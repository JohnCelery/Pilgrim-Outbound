import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';
import { createRenderer, drawMap } from './engine/renderer.js';
import { loadMap } from './engine/mapLoader.js';
import { createMapUI } from './ui/mapUI.js';
import { runEncounter } from './ui/encounter.js';
import { createDiary } from './ui/diary.js';
import { createInventory } from './ui/inventory.js';
import { createGameState } from './gameState.js';
// Keep both imports:
import { createTitleScreen } from './ui/titleScreen.js';
import { createResourceMenu } from './ui/resourceMenu.js';
import { createHarvestMenu } from './ui/harvestMenu.js';
import { createTravelConfirm } from './ui/travelConfirm.js';
import { createDeathScreen } from './ui/deathScreen.js';

import {
  POSITION,
  PROVISIONS,
  WATER,
  GEAR,
  IRON,
  SILVER,
  WOOD,
  FORTUNE,
  STAMINA,
  FLAGS,
  addPosition,
  addProvisions,
  addWater,
  addHealth,
  addStamina,
  addGear,
  addIron,
  addSilver,
  addWood,
  addFortune,
  addFlags
} from './components.js';
import { createHud } from './ui/hud.js';

const COMBAT_EVENTS = {
  bandit_ambush: {
    title: 'Bandit Ambush',
    text: 'Bandits spring from the brush with crude blades.',
    options: [
      {
        option: 'Fight them off',
        outcome: { diary: 'You scatter the bandits.', clearFlags: ['bandit_ambush'] }
      },
      {
        option: 'Flee and drop supplies',
        outcome: { resources: { food: -5 }, diary: 'You escape but lose rations.', clearFlags: ['bandit_ambush'] }
      }
    ]
  },
  blood_oath: {
    title: 'Blood Oath',
    text: 'The oath upon you demands combat.',
    options: [
      {
        option: 'Accept the duel',
        outcome: { resources: { stamina: -10 }, diary: 'You honor the oath in battle.', clearFlags: ['blood_oath'] }
      },
      {
        option: 'Break the oath',
        outcome: { setFlags: ['oath_broken'], diary: 'Shame burns as you turn away.', clearFlags: ['blood_oath'] }
      }
    ]
  }
};

function startGame(seedStr = '') {
  const canvas = document.getElementById('game');
  canvas.width = 800;
  canvas.height = 600;

  const seed = seedStr ? BigInt(seedStr) : BigInt(Date.now());
  const state = createGameState(seed);
  window.gameState = state;

  const rng = createRng(seed);
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
  let harvest = null;
  let travelConfirm = null;
  let deathScreen = null;
  let markerTween = null;
  let gameOver = false;

  const player = world.createEntity();
  addPosition(world, player, 0, 0);
  addProvisions(world, player, state.meters.food);
  addWater(world, player, state.meters.water);
  addHealth(world, player, 100);
  addStamina(world, player, 100);
  addGear(world, player, state.meters.gear);
  addIron(world, player, 0);
  addSilver(world, player, 0);
  addWood(world, player, 0);
  addFortune(world, player, 0);
  addFlags(world, player);

  hud = createHud(world, player);
  inventory = createInventory(['grain_sack', 'waterskin', 'toolkit']);
  inventory.hide();
  resources = createResourceMenu(world, player);
  resources.update();
  harvest = createHarvestMenu(world, player);
  travelConfirm = createTravelConfirm();

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

  const diary = createDiary(state);

  fetch('data/encounters.json')
    .then(r => r.json())
    .then(json => {
      eventsData = json;
    });

  function calculateTravelCost(wp) {
    const startWp = mapData.waypoints.find(w => w.name === currentWaypoint);
    const flagRes = world.query(FLAGS).find(r => r.id === player);
    const flags = flagRes ? flagRes.comps[0] : {};
    let food = wp.travelCosts?.food || 0;
    let water = wp.travelCosts?.water || 0;
    if (flags.dog_companion) food = Math.max(0, food - 1);
    if (flags.marsh_curse) water += 1;
    const coastalHop = (startWp?.tags || []).includes('coastal') || (wp.tags || []).includes('coastal');
    if (flags.silk_sail && coastalHop) food = Math.max(0, food - 1);
    return { food, water };
  }

  function canAfford(costs) {
    const provRes = world.query(PROVISIONS).find(r => r.id === player);
    const waterRes = world.query(WATER).find(r => r.id === player);
    const prov = provRes ? provRes.comps[0].amount : 0;
    const wat = waterRes ? waterRes.comps[0].amount : 0;
    return prov - costs.food >= 0 && wat - costs.water >= 0;
  }

  function checkGameOver() {
    const provRes = world.query(PROVISIONS).find(r => r.id === player);
    const waterRes = world.query(WATER).find(r => r.id === player);
    const prov = provRes ? provRes.comps[0].amount : 0;
    const wat = waterRes ? waterRes.comps[0].amount : 0;
    if ((prov <= 0 || wat <= 0) && !gameOver) {
      gameOver = true;
      if (mapUI) mapUI.disable();
      if (!deathScreen) deathScreen = createDeathScreen(() => location.reload());
    }
  }

  function performTravel(wp, costs) {
    console.log('Traveling to', wp.name);

    if (harvest) harvest.hide();

    if (!costs) costs = calculateTravelCost(wp);

    diary.add(`Day ${state.day} — Departed ${currentWaypoint}.`);

    const provRes = world.query(PROVISIONS).find(r => r.id === player);
    if (provRes) {
      const prov = provRes.comps[0];
      prov.amount = Math.max(0, prov.amount - costs.food);
    }

    const waterRes = world.query(WATER).find(r => r.id === player);
    if (waterRes) {
      const wat = waterRes.comps[0];
      wat.amount = Math.max(0, wat.amount - costs.water);
    }

    const provLeft = provRes ? provRes.comps[0].amount : 0;
    const waterLeft = waterRes ? waterRes.comps[0].amount : 0;
    if (provLeft <= 0 || waterLeft <= 0) {
      checkGameOver();
      if (gameOver) return;
    }

    state.day += 1;

    const posRes = world.query(POSITION).find(r => r.id === player);
    if (posRes) {
      const pos = posRes.comps[0];
      const startPos = { x: pos.x, y: pos.y };
      const [x, y] = wp.coords;
      pos.x = x;
      pos.y = y;
      markerTween = { start: startPos, end: { x, y }, t: 0, dur: 500 };
    }

    if (wp.name === 'Rome') {
      alert('Victory! You reached Rome.');
      if (mapUI) mapUI.disable();
    }

    // Mark waypoint as visited, then update current waypoint info
    wp.visited = true;
    currentWaypoint = wp.name;
    visitedWaypoints.add(wp.name);
    if (mapData) {
      mapData.current = currentWaypoint;
      mapData.visited = visitedWaypoints;
    }

    // Build encounter queue: forced combat flags first
    const flagRes = world.query(FLAGS).find(r => r.id === player);
    const flags = flagRes ? flagRes.comps[0] : {};
    const queue = [];
    if (flags.bandit_ambush) queue.push(COMBAT_EVENTS.bandit_ambush);
    if (flags.blood_oath) queue.push(COMBAT_EVENTS.blood_oath);

    // Then add 0-2 weighted random encounters
    if (eventsData && eventsData.encounters && eventsData.encounters.length) {
      const draws = Math.floor(rng.nextFloat() * 3); // 0, 1, or 2
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
    }

    const next = () => {
      if (!queue.length) {
        if (harvest && wp.sites) harvest.show(wp.sites);
        if (inventory) inventory.show();
        checkGameOver();
        return;
      }
      const ev = queue.shift();
      runEncounter(world, player, ev, diary.add, next);
    };
    if (queue.length) next();
    else {
      if (harvest && wp.sites) harvest.show(wp.sites);
      if (inventory) inventory.show();
    }

    if (mapUI) mapUI.update();
    diary.add(`Day ${state.day} — Arrived at ${wp.name}.`);
    checkGameOver();
  }

  function travelTo(wp) {
    const costs = calculateTravelCost(wp);
    const afford = canAfford(costs);
    if (travelConfirm) travelConfirm.show(wp, costs, () => { if (mapUI) mapUI.clearSelection(); performTravel(wp, costs); }, () => mapUI && mapUI.clearSelection(), afford);
    else performTravel(wp, costs);
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
    mapUI = createMapUI(canvas, mapData, world, player, travelTo, calculateTravelCost);
    // Initially disable, then enable once loaded or after title screen
    mapUI.disable();
    mapUI.update();
    mapUI.enable();
    diary.add(`Day 1 — Set forth from ${currentWaypoint}.`);
  });

  function step(dt) {
    renderer.clear();
    const posRes = world.query(POSITION).find(r => r.id === player);
    const pos = posRes ? posRes.comps[0] : null;
    if (markerTween) {
      markerTween.t += dt;
      if (markerTween.t >= markerTween.dur) {
        markerTween = null;
      }
    }
    const tweenData = markerTween ? { start: markerTween.start, end: markerTween.end, progress: markerTween.t / markerTween.dur } : null;
    drawMap(renderer.ctx, mapData, pos, tweenData);
    hud.draw(renderer.ctx);
    if (resources) resources.update();
  }

  loop.start();
}

function boot() {
  // Show title screen and pass startGame as callback
  createTitleScreen(seed => startGame(seed));
}

window.addEventListener('DOMContentLoaded', boot);

