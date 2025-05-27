import {
  PROVISIONS,
  WATER,
  GEAR,
  IRON,
  WOOD,
  STAMINA
} from '../components.js';

export function createHarvestMenu(world, playerId) {
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
    stamina: STAMINA
  };

  const SITE_DATA = {
    farm: { cost: { stamina: 5 }, gain: { food: 5 } },
    forest: { cost: { stamina: 5 }, gain: { wood: 5 } },
    river: { cost: { stamina: 5 }, gain: { water: 5 } },
    mine: { cost: { stamina: 5, gear: 1 }, gain: { iron: 3 } }
  };

  function modify(type, delta) {
    const res = world.query(type).find(r => r.id === playerId);
    if (res) {
      const comp = res.comps[0];
      comp.amount = Math.max(0, (comp.amount || 0) + delta);
    }
  }

  function apply(site) {
    const data = SITE_DATA[site];
    if (!data) return;
    for (const [k, v] of Object.entries(data.cost || {})) {
      const type = RES_MAP[k];
      if (type) modify(type, -v);
    }
    for (const [k, v] of Object.entries(data.gain || {})) {
      const type = RES_MAP[k];
      if (type) modify(type, v);
    }
  }

  function show(sites = []) {
    list.innerHTML = '';
    for (const site of sites) {
      const btn = document.createElement('button');
      btn.textContent = `Harvest ${site}`;
      btn.style.display = 'block';
      btn.style.marginBottom = '4px';
      btn.addEventListener('click', () => apply(site));
      list.appendChild(btn);
    }
    panel.style.display = 'block';
  }

  function hide() {
    panel.style.display = 'none';
  }

  return { element: panel, show, hide };
}

