import { POSITION } from '../components.js';

export function createMapUI(canvas, mapData, world, playerId, onTravel) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.pointerEvents = 'none';
  overlay.style.background = 'rgba(0, 0, 0, 0.6)';
  overlay.style.color = '#fff';
  overlay.style.padding = '2px 4px';
  overlay.style.font = '12px sans-serif';
  overlay.style.borderRadius = '3px';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  const highlightLayer = document.createElement('div');
  highlightLayer.style.position = 'absolute';
  highlightLayer.style.pointerEvents = 'none';
  highlightLayer.style.left = '0';
  highlightLayer.style.top = '0';
  highlightLayer.style.width = '100%';
  highlightLayer.style.height = '100%';
  highlightLayer.style.zIndex = '5';
  document.body.appendChild(highlightLayer);

  let validNeighbors = new Set();
  let enabled = true;

  let hovered = null;

  function updateHighlights() {
    highlightLayer.innerHTML = '';
    validNeighbors = new Set();
    const posRes = world.query(POSITION).find(r => r.id === playerId);
    if (!posRes) return;
    const { x, y } = posRes.comps[0];
    const current = mapData.waypoints.find(w => w.coords[0] === x && w.coords[1] === y);
    if (!current) return;
    for (const name of current.neighbors || []) {
      validNeighbors.add(name);
      const wp = mapData.waypoints.find(w => w.name === name);
      if (!wp) continue;
      const rect = canvas.getBoundingClientRect();
      const [gx, gy] = wp.coords;
      const px = rect.left + canvas.width / 2 + gx * 64 - 32;
      const py = rect.top + canvas.height / 2 + gy * 64 - 32;
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = `${px}px`;
      div.style.top = `${py}px`;
      div.style.width = '64px';
      div.style.height = '64px';
      div.style.border = '2px solid #d7a13b';
      div.style.borderRadius = '50%';
      highlightLayer.appendChild(div);
    }
  }

  function waypointAt(x, y) {
    if (!mapData) return null;
    for (const wp of mapData.waypoints) {
      const [gx, gy] = wp.coords;
      const px = canvas.width / 2 + gx * 64 - 32;
      const py = canvas.height / 2 + gy * 64 - 32;
      if (x >= px && x < px + 64 && y >= py && y < py + 64) {
        return wp;
      }
    }
    return null;
  }

  function onMove(ev) {
    if (!enabled) return;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const wp = waypointAt(x, y);
    hovered = wp;
    if (wp) {
      const { food, water } = wp.travelCosts || { food: 0, water: 0 };
      overlay.textContent = `Food ${food}, Water ${water}`;
      overlay.style.left = `${ev.clientX + 8}px`;
      overlay.style.top = `${ev.clientY + 8}px`;
      overlay.style.display = 'block';
    } else {
      overlay.style.display = 'none';
    }
  }

  function onClick() {
    if (!enabled) return;
    if (hovered && onTravel && validNeighbors.has(hovered.name)) {
      overlay.style.display = 'none';
      onTravel(hovered);
    }
  }

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', () => {
    overlay.style.display = 'none';
    hovered = null;
  });
  canvas.addEventListener('click', onClick);

  return {
    update: updateHighlights,
    disable() { enabled = false; highlightLayer.innerHTML = ''; overlay.style.display = 'none'; },
    enable() { enabled = true; updateHighlights(); },
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
      overlay.remove();
      highlightLayer.remove();
    }
  };
}

