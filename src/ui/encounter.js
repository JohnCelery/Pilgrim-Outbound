import { PROVISIONS, WATER } from '../components.js';

let panel;

export function showEncounter(data) {
  // TODO: remove once runEncounter fully replaces this.
  console.log('Encounter:', data);
}

export function runEncounter(world, playerId, data, onComplete) {
  if (panel) panel.remove();

  function applyCost(cost) {
    for (const [key, val] of Object.entries(cost)) {
      let type = null;
      if (key === 'food') type = PROVISIONS;
      else if (key === 'water') type = WATER;
      if (!type) continue;
      const res = world.query(type).find(r => r.id === playerId);
      if (res) {
        const comp = res.comps[0];
        comp.amount = Math.max(0, comp.amount - val);
      }
    }
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
      applyCost(choice.cost || {});
      panel.remove();
      if (onComplete) onComplete();
    });
    choices.appendChild(btn);
  });

  panel.appendChild(choices);

  document.body.appendChild(panel);
}
