import {
  PROVISIONS,
  WATER,
  GEAR,
  IRON,
  SILVER,
  WOOD,
  FORTUNE
} from '../components.js';

export function createResourceMenu(world, playerId) {
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '10px';
  panel.style.top = '160px';
  panel.style.background = 'rgba(0,0,0,0.8)';
  panel.style.color = '#fff';
  panel.style.padding = '4px 6px';
  panel.style.border = '1px solid #d7a13b';
  panel.style.display = 'none';
  panel.style.zIndex = '5';
  document.body.appendChild(panel);

  const types = [
    ['Food', PROVISIONS],
    ['Water', WATER],
    ['Gear', GEAR],
    ['Iron', IRON],
    ['Silver', SILVER],
    ['Wood', WOOD],
    ['Fortune', FORTUNE]
  ];

  const lines = new Map();
  for (const [label] of types) {
    const div = document.createElement('div');
    div.textContent = `${label}: 0`;
    panel.appendChild(div);
    lines.set(label, div);
  }

  function update() {
    for (const [label, type] of types) {
      const res = world.query(type).find(r => r.id === playerId);
      const amt = res ? res.comps[0].amount : 0;
      const div = lines.get(label);
      if (div) div.textContent = `${label}: ${amt}`;
    }
  }

  function show() { panel.style.display = 'block'; }
  function hide() { panel.style.display = 'none'; }
  function toggle() {
    if (panel.style.display === 'none') show();
    else hide();
  }

  return { element: panel, show, hide, toggle, update };
}
