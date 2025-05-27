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

let panel;

export function runEncounter(world, playerId, data, diaryFn, onComplete) {
  if (panel) panel.remove();

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
      if (roll < outcome.random.chance) applyOutcome(outcome.random.success);
      else applyOutcome(outcome.random.fail);
      return;
    }
    for (const [k, v] of Object.entries(outcome.resources || {})) {
      modifyResource(k, v);
    }
    if (outcome.setFlags || outcome.clearFlags) {
      const flagRes = world.query(FLAGS).find(r => r.id === playerId);
      if (flagRes) {
        const flags = flagRes.comps[0];
        for (const f of outcome.setFlags || []) flags[f] = true;
        for (const f of outcome.clearFlags || []) delete flags[f];
      }
    }
    if (outcome.diary && outcome.diaryFn) outcome.diaryFn(outcome.diary);
  }

  panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '50%';
  panel.style.top = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.background = 'rgba(0, 0, 0, 0.85)';
  panel.style.color = '#fff';
  panel.style.padding = '16px';
  panel.style.border = '2px solid #d7a13b';
  panel.style.maxWidth = '80%';
  panel.style.zIndex = '1000';

  const title = document.createElement('h3');
  title.textContent = data.title || 'Encounter';
  panel.appendChild(title);

  if (data.image) {
    const img = new Image();
    img.src = data.image;
    img.style.display = 'block';
    img.style.maxWidth = '100%';
    img.style.marginBottom = '8px';
    panel.appendChild(img);
  }

  const text = document.createElement('p');
  text.textContent = data.text || '';
  panel.appendChild(text);

  const choices = document.createElement('div');
  choices.style.marginTop = '8px';

  (data.choices || []).slice(0, 3).forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.option || choice;
    btn.style.marginRight = '6px';
    btn.addEventListener('click', () => {
      const out = choice.outcome || {};
      applyOutcome({ ...out, diaryFn });
      panel.remove();
      if (onComplete) onComplete();
    });
    choices.appendChild(btn);
  });

  panel.appendChild(choices);

  document.body.appendChild(panel);
}
