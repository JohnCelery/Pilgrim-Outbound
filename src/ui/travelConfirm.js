import { scorePanel } from '../assets.js';

export function createTravelConfirm() {
  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.right = '10px';
  panel.style.bottom = '10px';
  panel.style.background = `url('${scorePanel}') no-repeat center/contain`;
  panel.style.color = '#fff';
  panel.style.padding = '8px';
  panel.style.border = '2px solid #d7a13b';
  panel.style.zIndex = '1000';
  panel.style.display = 'none';

  const nameEl = document.createElement('h3');
  panel.appendChild(nameEl);

  const costEl = document.createElement('p');
  panel.appendChild(costEl);

  const btnRow = document.createElement('div');
  btnRow.style.marginTop = '8px';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Travel';
  confirmBtn.style.marginRight = '4px';
  btnRow.appendChild(confirmBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  btnRow.appendChild(cancelBtn);

  panel.appendChild(btnRow);

  document.body.appendChild(panel);

  let confirmFn = null;
  let cancelFn = null;

  function hide() {
    panel.style.display = 'none';
    confirmFn = null;
    cancelFn = null;
  }

  confirmBtn.addEventListener('click', () => {
    const fn = confirmFn;
    hide();
    if (fn) fn();
  });

  cancelBtn.addEventListener('click', () => { hide(); if (cancelFn) cancelFn(); });

  function show(wp, costs, onConfirm, onCancel, enabled = true) {
    nameEl.textContent = wp.name;
    costEl.textContent = `Food ${costs.food || 0}, Water ${costs.water || 0}`;
    confirmFn = onConfirm;
    cancelFn = onCancel;
    confirmBtn.disabled = !enabled;
    panel.style.display = 'block';
  }

  return { show, hide, element: panel };
}
