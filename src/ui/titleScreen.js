export function createTitleScreen(onStart) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0, 0, 0, 0.85)';
  overlay.style.color = '#fff';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';

  const title = document.createElement('h1');
  title.textContent = 'Pilgrim Outbound';
  overlay.appendChild(title);

  const flavor = document.createElement('p');
  flavor.textContent = 'A lone courier rides into the unknown.';
  flavor.style.marginBottom = '16px';
  overlay.appendChild(flavor);

  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start Journey';
  startBtn.addEventListener('click', () => {
    overlay.remove();
    if (onStart) onStart();
  });
  overlay.appendChild(startBtn);

  document.body.appendChild(overlay);

  return {
    destroy() { overlay.remove(); }
  };
}
