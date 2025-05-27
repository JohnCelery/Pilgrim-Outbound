import { parchmentTile, tooltipPanel, btnPlank, titleGraphic } from '../assets.js';

export function createTitleScreen(onRide) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundImage = `url('${parchmentTile}')`;
  overlay.style.backgroundSize = 'cover';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';
  overlay.style.opacity = '1';
  overlay.style.transition = 'opacity 0.5s';

  const titleImg = new Image();
  titleImg.src = titleGraphic;
  titleImg.style.marginBottom = '16px';
  overlay.appendChild(titleImg);

  const beginBtn = document.createElement('button');
  beginBtn.textContent = 'Begin Journey';
  beginBtn.style.backgroundImage = `url('${btnPlank}')`;
  beginBtn.style.transition = 'filter 0.2s';
  beginBtn.addEventListener('mouseover', () => {
    beginBtn.style.filter = 'brightness(1.2)';
  });
  beginBtn.addEventListener('mouseout', () => {
    beginBtn.style.filter = 'brightness(1)';
  });

  const seedPanel = document.createElement('div');
  seedPanel.style.position = 'absolute';
  seedPanel.style.left = '50%';
  seedPanel.style.top = '50%';
  seedPanel.style.transform = 'translate(-50%, -50%)';
  seedPanel.style.backgroundImage = `url('${tooltipPanel}')`;
  seedPanel.style.backgroundSize = 'cover';
  seedPanel.style.padding = '16px';
  seedPanel.style.display = 'none';

  const seedInput = document.createElement('input');
  seedInput.placeholder = 'Run Seed (optional)';
  seedInput.style.display = 'block';
  seedInput.style.marginBottom = '8px';
  seedPanel.appendChild(seedInput);

  const rideBtn = document.createElement('button');
  rideBtn.textContent = 'Ride';
  rideBtn.style.backgroundImage = `url('${btnPlank}')`;
  rideBtn.addEventListener('click', () => {
    const seed = seedInput.value.trim();
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      if (onRide) onRide(seed);
    }, 500);
  });
  seedPanel.appendChild(rideBtn);

  overlay.appendChild(beginBtn);
  overlay.appendChild(seedPanel);
  document.body.appendChild(overlay);

  beginBtn.addEventListener('click', () => {
    beginBtn.style.display = 'none';
    seedPanel.style.display = 'block';
  });

  return {
    destroy() { overlay.remove(); }
  };
}
