import {
  PROVISIONS,
  WATER,
  GEAR,
  IRON,
  WOOD,
  STAMINA,
  FORTUNE
} from '../components.js';
import { grainFieldTile, forestWoodTile, riverFishTile, oreVeinTile } from '../assets.js';

export function createHarvestMenu(world, playerId, diaryFn = null, inventory = null) {
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '50%';
  panel.style.top = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.background = 'rgba(0, 0, 0, 0.85)';
  panel.style.color = '#fff';
  panel.style.padding = '8px';
  panel.style.border = '2px solid #d7a13b';
  panel.style.zIndex = '1000';
  panel.style.display = 'none';

  const title = document.createElement('h3');
  title.textContent = 'Harvest';
  panel.appendChild(title);

  const list = document.createElement('div');
  panel.appendChild(list);

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.marginTop = '8px';
  close.addEventListener('click', () => hide());
  panel.appendChild(close);

  document.body.appendChild(panel);

  const RES_MAP = {
    food: PROVISIONS,
    water: WATER,
    gear: GEAR,
    iron: IRON,
    wood: WOOD,
    stamina: STAMINA,
    fortune: FORTUNE
  };

  const SITE_DATA = {
    farm: {
      icon: grainFieldTile,
      loot: [{ type: 'food', amount: 5 }]
    },
    forest: {
      icon: forestWoodTile,
      loot: [{ type: 'wood', amount: 5 }]
    },
    river: {
      icon: riverFishTile,
      loot: [{ type: 'water', amount: 5 }]
    },
    mine: {
      icon: oreVeinTile,
      loot: [{ type: 'iron', amount: 3 }]
    }
  };

  function modify(type, delta) {
    const res = world.query(type).find(r => r.id === playerId);
    if (res) {
      const comp = res.comps[0];
      comp.amount = Math.max(0, (comp.amount || 0) + delta);
    }
  }

  function rollLoot(site) {
    const data = SITE_DATA[site];
    if (!data || !data.loot) return [];
    return data.loot;
  }

  function harvest(site, depth) {
    const foodCost = depth * 5;
    const gearCost = depth * 1;
    modify(PROVISIONS, -foodCost);
    modify(GEAR, -gearCost);

    const gained = {};
    for (let i = 0; i < depth; i++) {
      for (const item of rollLoot(site)) {
        const type = RES_MAP[item.type];
        if (type) {
          modify(type, item.amount);
          gained[item.type] = (gained[item.type] || 0) + item.amount;
        }
      }
    }

    if (Math.random() < 0.2) {
      modify(GEAR, -5);
      if (diaryFn) diaryFn('Mishap damaged gear during harvest.');
    }

    const parts = [];
    for (const [k, v] of Object.entries(gained)) {
      parts.push(`${k}+${v}`);
    }
    if (parts.length && diaryFn) diaryFn(`Harvested ${site}: ${parts.join(', ')}`);
  }

  const depthPanel = document.createElement('div');
  depthPanel.style.marginTop = '8px';
  depthPanel.style.display = 'none';
  list.appendChild(depthPanel);

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '1';
  slider.max = '3';
  slider.value = '1';
  depthPanel.appendChild(slider);

  const depthConfirm = document.createElement('button');
  depthConfirm.textContent = 'Extract';
  depthConfirm.style.marginLeft = '4px';
  depthPanel.appendChild(depthConfirm);

  let currentSite = null;
  depthConfirm.addEventListener('click', () => {
    if (currentSite) {
      const depth = parseInt(slider.value, 10) || 1;
      harvest(currentSite, depth);
    }
    depthPanel.style.display = 'none';
  });

  function show(sites = []) {
    list.innerHTML = '';
    list.appendChild(depthPanel);
    depthPanel.style.display = 'none';
    for (const site of sites) {
      const data = SITE_DATA[site] || {};
      const btn = document.createElement('button');
      if (data.icon) {
        const img = new Image();
        img.src = data.icon;
        img.style.width = '32px';
        img.style.height = '32px';
        btn.appendChild(img);
      } else {
        btn.textContent = site;
      }
      btn.style.display = 'inline-block';
      btn.style.margin = '4px';
      btn.addEventListener('click', () => {
        currentSite = site;
        depthPanel.style.display = 'block';
      });
      list.appendChild(btn);
    }
    panel.style.display = 'block';
  }

  function hide() {
    panel.style.display = 'none';
  }

  return { element: panel, show, hide };
}

