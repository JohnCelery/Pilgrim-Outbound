import { POSITION } from '../components.js';
import { tooltipPanel } from '../assets.js';

export function createMapUI(canvas, mapData, world, playerId, onSelect, costFn) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.pointerEvents = 'none';
  overlay.style.background = `url('${tooltipPanel}') no-repeat center/contain`;
  overlay.style.color = '#000';
  overlay.style.padding = '4px 6px';
  overlay.style.font = '12px sans-serif';
  overlay.style.border = '1px solid #b9975b';
  overlay.style.borderRadius = '3px';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  const nameEl = document.createElement('div');
  nameEl.style.fontWeight = 'bold';
  overlay.appendChild(nameEl);

  const costEl = document.createElement('div');
  overlay.appendChild(costEl);

  const tagEl = document.createElement('div');
  overlay.appendChild(tagEl);

  const highlightLayer = document.createElement('div');
  highlightLayer.style.position = 'absolute';
  highlightLayer.style.pointerEvents = 'none';
  highlightLayer.style.left = '0';
  highlightLayer.style.top = '0';
  highlightLayer.style.width = '100%';
  highlightLayer.style.height = '100%';
  highlightLayer.style.zIndex = '5';
  document.body.appendChild(highlightLayer);

  const pathCanvas = document.createElement('canvas');
  pathCanvas.width = canvas.width;
  pathCanvas.height = canvas.height;
  pathCanvas.style.position = 'absolute';
  pathCanvas.style.left = '0';
  pathCanvas.style.top = '0';
  pathCanvas.style.pointerEvents = 'none';
  pathCanvas.style.zIndex = '6';
  document.body.appendChild(pathCanvas);
  const pathCtx = pathCanvas.getContext('2d');

  let selected = null;

  let validNeighbors = new Set();
  let enabled = true;

  let hovered = null;

  function drawPath() {
    pathCtx.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
    if (!selected) return;
    const posRes = world.query(POSITION).find(r => r.id === playerId);
    if (!posRes) return;
    const { x, y } = posRes.comps[0];
    const rect = canvas.getBoundingClientRect();
    const startX = rect.left + canvas.width / 2 + x * 64;
    const startY = rect.top + canvas.height / 2 + y * 64;
    const [gx, gy] = selected.coords;
    const endX = rect.left + canvas.width / 2 + gx * 64;
    const endY = rect.top + canvas.height / 2 + gy * 64;
    pathCtx.strokeStyle = '#d7a13b';
    pathCtx.lineWidth = 3;
    pathCtx.beginPath();
    pathCtx.moveTo(startX, startY);
    pathCtx.lineTo(endX, endY);
    pathCtx.stroke();
  }

  function selectWaypoint(wp) {
    selected = wp;
    drawPath();
    if (onSelect) onSelect(wp);
  }

  function clearSelection() {
    selected = null;
    drawPath();
  }

  function updateHighlights() {
    highlightLayer.innerHTML = '';
    validNeighbors = new Set();
    const posRes = world.query(POSITION).find(r => r.id === playerId);
    if (!posRes) return;
    const { x, y } = posRes.comps[0];
    const current = mapData.waypoints.find(w => w.coords[0] === x && w.coords[1] === y);
    if (!current) return;
    const neigh = (current.neighbors || []).slice(0, 2);
    for (const name of neigh) {
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
    drawPath();
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
    if (wp && validNeighbors.has(wp.name)) {
      const costs = costFn ? costFn(wp) : (wp.travelCosts || { food: 0, water: 0 });
      nameEl.textContent = wp.name;
      costEl.textContent = `Food ${costs.food}, Water ${costs.water}`;
      tagEl.textContent = (wp.tags || []).join(', ');
      overlay.style.left = `${ev.clientX + 8}px`;
      overlay.style.top = `${ev.clientY + 8}px`;
      overlay.style.display = 'block';
    } else {
      overlay.style.display = 'none';
    }
  }

  function onClick() {
    if (!enabled) return;
    if (hovered && validNeighbors.has(hovered.name)) {
      overlay.style.display = 'none';
      selectWaypoint(hovered);
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
    clearSelection,
    disable() { enabled = false; highlightLayer.innerHTML = ''; overlay.style.display = 'none'; pathCtx.clearRect(0,0,pathCanvas.width,pathCanvas.height); },
    enable() { enabled = true; updateHighlights(); },
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
      overlay.remove();
      highlightLayer.remove();
      pathCanvas.remove();
    }
  };
}

