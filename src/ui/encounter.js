import {
  PROVISIONS,
  WATER,
  HEALTH,
  STAMINA,
  GEAR,
  IRON,
  SILVER,
  WOOD,
  FORTUNE,
  FLAGS
} from '../components.js';
import { createDeathScreen } from './deathScreen.js';

let panel;
let overlay;

export function runEncounter(world, playerId, data, diaryFn, inventory, state, onComplete) {
  if (panel) panel.remove();
  if (overlay) overlay.remove();

  const RES_MAP = {
    food: PROVISIONS,
    water: WATER,
    health: HEALTH,
    stamina: STAMINA,
    gear: GEAR,
    iron: IRON,
    silver: SILVER,
    wood: WOOD,
    fortune: FORTUNE
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

  function applyOutcome(outcome) {
    if (!outcome) return;
    if (outcome.random) {
      const roll = Math.random();
      if (roll < outcome.random.chance) {
        applyOutcome({ ...outcome.random.success, diaryFn: outcome.diaryFn });
      }
      else {
        applyOutcome({ ...outcome.random.fail, diaryFn: outcome.diaryFn });
      }
      return;
    }
    for (const [k, v] of Object.entries(outcome.resources || {})) {
      modifyResource(k, v);
    }
    for (const item of outcome.addItems || []) {
      inventory && inventory.addItem(item);
    }
    for (const item of outcome.removeItems || []) {
      inventory && inventory.removeItem(item);
    }
    if (outcome.setFlags || outcome.clearFlags) {
      const flagRes = world.query(FLAGS).find(r => r.id === playerId);
      if (flagRes) {
        const flags = flagRes.comps[0];
        for (const f of outcome.setFlags || []) flags[f] = true;
        for (const f of outcome.clearFlags || []) delete flags[f];
      }
    }
    for (const r of outcome.recipes || []) {
      if (state && state.recipes) state.recipes.add(r);
    }
    for (const w of outcome.words || []) {
      if (state && state.lexicon) state.lexicon.add(w);
    }
    if (outcome.diary && outcome.diaryFn) outcome.diaryFn(outcome.diary);

    let fatal = false;
    if (!fatal) {
      for (const type of Object.values(RES_MAP)) {
        const res = world.query(type).find(r => r.id === playerId);
        if (res && res.comps[0].amount <= 0) { fatal = true; break; }
      }
    }

    panel.remove();
    overlay.remove();

    if (fatal) {
      createDeathScreen(outcome.death || 'You have perished.', () => location.reload());
    } else if (onComplete) {
      onComplete();
    }
  }

  overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.zIndex = '999';
  document.body.appendChild(overlay);

  panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '50%';
  panel.style.top = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.backgroundImage = "url('PASTE_URL_HERE')";
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
  panel.style.zIndex = '1000';

  const hero = new Image();
  hero.src = data.image || 'PASTE_URL_HERE';
  hero.style.width = '100%';
  hero.style.flex = '1';
  hero.style.objectFit = 'cover';
  hero.style.border = 'none';
  panel.appendChild(hero);

  const text = document.createElement('p');
  text.textContent = data.text || '';
  text.style.margin = '8px 0';
  panel.appendChild(text);

  const choices = document.createElement('div');
  choices.style.width = '100%';

  const flagRes = world.query(FLAGS).find(r => r.id === playerId);
  const playerFlags = flagRes ? flagRes.comps[0] : {};

  const opts = (data.options || [])
    .filter(o => {
      const req = o.outcome?.requiresFlag;
      return !req || playerFlags[req];
    })
    .slice(0, 3);

  opts.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.option || choice;
    btn.style.display = 'block';
    btn.style.margin = '4px auto';
    btn.style.backgroundImage = "url('PASTE_URL_HERE')";
    btn.style.backgroundSize = 'cover';
    btn.style.border = 'none';
    btn.style.padding = '8px 16px';
    btn.style.fontFamily = 'serif';
    btn.addEventListener('click', () => {
      const out = choice.outcome || {};
      applyOutcome({ ...out, diaryFn });
    });
    choices.appendChild(btn);
  });

  if (opts.length === 0) {
    const btn = document.createElement('button');
    btn.textContent = 'Continue';
    btn.style.display = 'block';
    btn.style.margin = '4px auto';
    btn.style.backgroundImage = "url('PASTE_URL_HERE')";
    btn.style.backgroundSize = 'cover';
    btn.style.border = 'none';
    btn.style.padding = '8px 16px';
    btn.style.fontFamily = 'serif';
    btn.addEventListener('click', () => {
      applyOutcome({});
    });
    choices.appendChild(btn);
  }

  panel.appendChild(choices);

  document.body.appendChild(panel);
}
