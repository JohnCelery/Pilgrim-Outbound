export function createMapUI(canvas, mapData, onTravel) {
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

  let hovered = null;

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
    if (hovered && onTravel) {
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
    destroy() {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
      overlay.remove();
    }
  };
}

