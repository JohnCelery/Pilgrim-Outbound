import { modalFrame } from '../assets.js';
import { PROVISIONS, WATER, GEAR, IRON, SILVER, WOOD, FORTUNE, FLAGS } from '../components.js';

export function createLocationMenu(world, playerId, diaryFn = null, inventory = null) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.zIndex = '999';
  overlay.style.display = 'none';

  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '50%';
  panel.style.top = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.zIndex = '1000';
  panel.style.backgroundImage = `url('${modalFrame}')`;
  panel.style.backgroundSize = 'contain';
  panel.style.backgroundRepeat = 'no-repeat';
  panel.style.width = '1280px';
  panel.style.height = '400px';
  panel.style.maxWidth = '90%';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.justifyContent = 'flex-end';
  panel.style.alignItems = 'center';
  panel.style.padding = '16px';
  panel.style.boxSizing = 'border-box';
  panel.style.color = '#fff';
  panel.style.fontFamily = 'serif';

  const heroImg = document.createElement('img');
  heroImg.style.width = '100%';
  heroImg.style.flex = '1';
  heroImg.style.objectFit = 'cover';
  heroImg.style.border = 'none';
  panel.appendChild(heroImg);

  const choiceContainer = document.createElement('div');
  choiceContainer.style.width = '100%';
  panel.appendChild(choiceContainer);

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  function hide() {
    overlay.style.display = 'none';
    panel.style.display = 'none';
    choiceContainer.innerHTML = '';
  }

  function modify(type, delta) {
    const res = world.query(type).find(r => r.id === playerId);
    if (res) {
      const comp = res.comps[0];
      comp.amount = Math.max(0, (comp.amount || 0) + delta);
    }
  }

  const WATER_MAX = 140;
  const GEAR_MAX = 100;

  function promptDepth() {
    let d = parseInt(prompt('Depth (1-3)?'), 10);
    if (isNaN(d)) d = 1;
    return Math.min(3, Math.max(1, d));
  }

  function tradeResources() {
    const type = prompt('Trade for which resource? (food, water, iron)');
    if (!RES[type]) return;
    const silverRes = world.query(SILVER).find(r => r.id === playerId);
    const maxSpend = silverRes ? silverRes.comps[0].amount : 0;
    if (maxSpend <= 0) return;
    let amt = parseInt(prompt(`Spend how many silver? (1-${maxSpend})`), 10);
    if (isNaN(amt) || amt <= 0) return;
    amt = Math.min(maxSpend, amt);
    modify(SILVER, -amt);
    modify(RES[type], amt * 2);
  }

  function gambleSilver(winAmt, loseAmt) {
    if (Math.random() < 0.5) modify(SILVER, winAmt); else modify(SILVER, loseAmt);
  }

  function setResourceToMax(type, max) {
    const res = world.query(type).find(r => r.id === playerId);
    if (res) res.comps[0].amount = max;
  }

  const RES = { food: PROVISIONS, water: WATER, gear: GEAR, iron: IRON, silver: SILVER, wood: WOOD, fortune: FORTUNE };

  function makeChoice(text, outcome, onComplete) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.display = 'block';
    btn.style.margin = '4px auto';
    btn.addEventListener('click', () => {
      if (typeof outcome.action === 'function') outcome.action();
      for (const [k,v] of Object.entries(outcome.resources || {})) {
        const t = RES[k];
        if (t) modify(t, v);
      }
      const flagRes = world.query(FLAGS).find(r => r.id === playerId);
      const flags = flagRes ? flagRes.comps[0] : {};
      for (const f of outcome.setFlags || []) flags[f] = true;
      for (const f of outcome.clearFlags || []) delete flags[f];
      if (diaryFn && outcome.diary) diaryFn(outcome.diary);
      hide();
      if (onComplete) onComplete();
    });
    choiceContainer.appendChild(btn);
  }

  const DATA = {
    market: {
      hero: 'heroMarket',
      options: [
        { text: 'Trade at Stalls', diary: 'Bartering for goods.', action: () => tradeResources() },
        { text: 'Hire Healer', diary: 'A healer tends your kit.', resources: { silver: -10, gear: 30 } },
        { text: 'Haggling Gamble', diary: 'You test your luck.', action: () => gambleSilver(10, -10) },
        { text: 'Pay Tithe', diary: 'You pay church dues.', resources: { silver: -10 } }
      ]
    },
    monastery: {
      hero: 'heroMonastery',
      options: [
        { text: 'Repair Gear', diary: 'The monks mend your gear.', resources: { iron: -10, gear: 30 } },
        { text: 'Herbal Cure', diary: 'Soothing tonics are shared.', resources: { silver: -5, water: 10, food: 10 } },
        { text: 'Donate Grain', diary: 'You offer grain to the poor.', resources: { food: -15, water: 15 } },
        { text: 'Rest in Cloister', diary: 'Quiet rest restores you.', resources: { food: -5, water: 5 } }
      ]
    },
    farmland: {
      hero: 'heroFarmland',
      options: [
        { text: 'Harvest Fields', diary: 'You reap the crops.', action: () => { const d = promptDepth(); modify(GEAR, -5*d); modify(PROVISIONS, 20*d); } },
        { text: 'Barter with Peasants', diary: 'Simple trade made.', resources: { iron: -10, food: 20 } },
        { text: 'Guard Grain Stores', diary: 'You stand watch for coin.', resources: { water: -10, silver: 10 } }
      ]
    },
    forest: {
      hero: 'heroForest',
      options: [
        { text: 'Gather Timber', diary: 'You chop usable wood.', action: () => { const d = promptDepth(); modify(GEAR, -5*d); modify(WOOD, 15*d); } },
        { text: 'Hunt Game', diary: 'Fresh meat acquired.', resources: { water: -5, food: 25 } },
        { text: 'Collect Herbs', diary: 'You gather fragrant herbs.', resources: { gear: -5, food: 10, water: 10 } }
      ]
    },
    mountain: {
      hero: 'heroMountain',
      options: [
        { text: 'Mine Ore', diary: 'You pry loose veins.', action: () => { const d = promptDepth(); modify(GEAR, -5*d); modify(IRON, 15*d); } },
        { text: 'Break Stone for Road', diary: 'You hew heavy blocks.', resources: { food: -10, iron: 20 } },
        { text: 'Clear Snow Cave', diary: 'Shelter yields supplies.', resources: { gear: -15, food: 10, water: 20 } }
      ]
    },
    river: {
      hero: 'heroRiver',
      options: [
        { text: 'Refill Waterskins', diary: 'Your skins brim once more.', action: () => setResourceToMax(WATER, WATER_MAX) },
        { text: 'Fish Shallows', diary: 'The nets are heavy.', resources: { water: -10, food: 25 } },
        { text: 'Pay Ferry Shortcut', diary: 'You cross swiftly.', resources: { silver: -5 }, setFlags: ['ferry_discount'] },
        { text: 'Mend Nets for Locals', diary: 'Grateful folk pay you.', resources: { food: -10, silver: 10 } }
      ]
    },
    port: {
      hero: 'heroPort',
      options: [
        { text: 'Buy Exotic Cargo', diary: 'Rare goods loaded.', action: () => { modify(SILVER, -10); inventory && inventory.addItem('silk_bundle'); } },
        { text: 'Book Sea Passage', diary: 'Voyage arranged.', resources: { silver: -10 }, setFlags: ['sea_passage_discount'] },
        { text: 'Sell Dried Fish', diary: 'Local cooks pay well.', resources: { food: -30, silver: 15 } },
        { text: 'Help Unload Barrels', diary: 'Heavy labour earns iron.', resources: { water: -10, iron: 10 } }
      ]
    },
    ruin: {
      hero: 'heroRuin',
      options: [
        { text: 'Scavenge Valves', diary: 'Ancient metal recovered.', action: () => { const d = promptDepth(); modify(GEAR, -5*d); modify(IRON, 10*d); modify(WATER, 10); } },
        { text: 'Collect Mosaic Pieces', diary: 'Colorful stones gathered.', resources: { gear: -5, iron: 20 } },
        { text: 'Draw Water from Cistern', diary: 'Cool depths refresh.', resources: { food: -5, water: 40 } }
      ]
    },
    battlefield: {
      hero: 'heroBattlefield',
      options: [
        { text: 'Scrounge Scrap', diary: 'You sift the ruins.', action: () => { const d = promptDepth(); modify(GEAR, -5*d); modify(IRON, 10*d); modify(SILVER, 5*d); } },
        { text: 'Strip Armour', diary: 'Useful plates salvaged.', resources: { water: -20, iron: 40 } },
        { text: 'Bury Bodies for Loot', diary: 'Morbid work yields coin.', resources: { food: -15, silver: 25 } }
      ]
    },
    hiddenPath: {
      hero: 'heroHiddenPath',
      options: [
        { text: 'Pay Guide', diary: 'The guide shows a quicker way.', resources: { fortune: -1 }, setFlags: ['skip_path'] },
        { text: 'Forage Wild Berries', diary: 'Bushes offer sustenance.', resources: { gear: -5, food: 20, water: 10 } }
      ]
    },
    encampment: {
      hero: 'heroEncampment',
      options: [
        { text: 'Rest by Fire', diary: 'The flames ease your burden.', resources: { water: 5 }, setFlags: ['no_drain'] },
        { text: 'Gamble at Dice', diary: 'The cup rattles.', action: () => gambleSilver(15, -10) },
        { text: 'Sharpen Weapons', diary: 'Edges honed keen.', resources: { iron: -10, gear: 20 } }
      ]
    },
    cathedral: {
      hero: 'heroCathedral',
      options: [
        { text: 'Grand Market Trade', diary: 'Coins change many hands.', action: () => tradeResources() },
        { text: 'Commission Repair', diary: 'Craftsmen restore all gear.', action: () => { modify(SILVER, -20); setResourceToMax(GEAR, GEAR_MAX); } },
        { text: 'Feast in Refectory', diary: 'Tables groan with bounty.', resources: { silver: -10, food: 40, water: 40 } },
        { text: 'Donate Alms', diary: 'Your charity is noted.', resources: { silver: -15, fortune: 1 } }
      ]
    }
  };

  function show(type, heroMap, onComplete) {
    const def = DATA[type];
    if (!def) return onComplete && onComplete();
    heroImg.src = heroMap[def.hero] || '';
    choiceContainer.innerHTML = '';
    def.options.forEach(opt => makeChoice(opt.text, opt, onComplete));
    overlay.style.display = 'block';
    panel.style.display = 'flex';
  }

  return { show, hide };
}

