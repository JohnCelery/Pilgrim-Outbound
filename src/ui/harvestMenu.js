import {
  PROVISIONS,
  WATER,
  STAMINA,
  GEAR,
  IRON,
  WOOD
} from '../components.js';

export function createHarvestMenu(world, playerId, onChange) {
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '50%';
  panel.style.top = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.background = 'rgba(0, 0, 0, 0.85)';
  panel.style.color = '#fff';
  panel.style.padding = '8px';
  panel.style.border = '2px solid #d7a13b';
  panel.style.display = 'none';
  panel.style.zIndex = '1000';
  document.body.appendChild(panel);

  const RES_MAP = {
    food: PROVISIONS,
    water: WATER,
    stamina: STAMINA,
    gear: GEAR,
    iron: IRON,
    wood: WOOD
  };

  const SITE_INFO = {
    farm: { label: 'Farm', gain: { food: 2 }, cost: { stamina: 1 } },
    forest: { label: 'Forest', gain: { wood: 1 }, cost: { stamina: 1 } },
    river: { label: 'River', gain: { water: 1, food: 1 }, cost: { stamina: 1 } },
    mine: { label: 'Mine', gain: { iron: 1 }, cost: { stamina: 2, gear: 1 } }
  };

  function modifyResource(key, delta) {
    const type = RES_MAP[key];
    if (!type) return;
    const res = world.query(type).find(r => r.id === playerId);
    if (res) {
      const comp = res.comps[0];
      comp.amount = Math.max(0, (comp.amount || 0) + delta);
    }
  }

  function hide() {
    panel.style.display = 'none';
  }

  function showForWaypoint(wp) {
    panel.innerHTML = '';
    hide();
    const title = document.createElement('div');
    title.textContent = 'Harvest';
    title.style.marginBottom = '6px';
    panel.appendChild(title);

    (wp.sites || []).forEach(site => {
      const info = SITE_INFO[site];
      if (!info) return;
      const btn = document.createElement('button');
      btn.textContent = info.label;
      btn.style.marginRight = '6px';
      btn.addEventListener('click', () => {
        for (const [k, v] of Object.entries(info.cost || {})) {
          modifyResource(k, -v);
        }
        for (const [k, v] of Object.entries(info.gain || {})) {
          modifyResource(k, v);
        }
        btn.disabled = true;
        if (onChange) onChange();
      });
      panel.appendChild(btn);
    });

    const close = document.createElement('button');
    close.textContent = 'Close';
    close.style.marginLeft = '6px';
    close.addEventListener('click', hide);
    panel.appendChild(close);

    panel.style.display = 'block';
  }

  return { showForWaypoint, hide, element: panel };
}
