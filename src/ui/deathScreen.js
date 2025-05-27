import { deathPanel } from '../assets.js';

export function createDeathScreen(message = 'You have perished.', onRestart) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = `rgba(0,0,0,0.8) url('${deathPanel}') center/cover no-repeat`;
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10000';

  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.color = '#fff';
  msg.style.marginBottom = '16px';
  overlay.appendChild(msg);

  const btn = document.createElement('button');
  btn.textContent = 'Restart';
  btn.addEventListener('click', () => {
    overlay.remove();
    if (onRestart) onRestart();
  });
  overlay.appendChild(btn);

  document.body.appendChild(overlay);
  return { remove: () => overlay.remove() };
}
