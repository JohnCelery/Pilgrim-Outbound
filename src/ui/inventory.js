import { gridCell, grainSack, waterskin, toolkit, silkBundle, leatherTile } from '../assets.js';

export function createInventory(starterItems = []) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.right = '10px';
  container.style.bottom = '10px';
  container.style.backgroundImage = `url('${leatherTile}')`;
  container.style.backgroundSize = '64px 64px';
  // Hidden by default; show() will switch display back to grid
  container.style.display = 'none';
  container.style.gridTemplateColumns = 'repeat(6, 64px)';
  container.style.gridTemplateRows = 'repeat(4, 64px)';
  container.style.gap = '2px';
  container.style.zIndex = '2';
  document.body.appendChild(container);

  const cells = [];
  for (let i = 0; i < 24; i++) {
    const cell = document.createElement('div');
    cell.style.width = '64px';
    cell.style.height = '64px';
    cell.style.border = '1px solid #555';
    cell.style.boxSizing = 'border-box';
    cell.style.position = 'relative';
    cell.style.backgroundImage = `url('${gridCell}')`;
    cell.style.backgroundSize = 'cover';
    container.appendChild(cell);
    cells.push(cell);
  }

  let dragging = null;
  let offsetX = 0;
  let offsetY = 0;

  function ensureCell() {
    let cell = cells.find(c => c.children.length === 0);
    if (!cell) {
      cell = document.createElement('div');
      cell.style.width = '64px';
      cell.style.height = '64px';
      cell.style.border = '1px solid #555';
      cell.style.boxSizing = 'border-box';
      cell.style.position = 'relative';
      cell.style.backgroundImage = `url('${gridCell}')`;
      cell.style.backgroundSize = 'cover';
      container.appendChild(cell);
      cells.push(cell);
      const rows = Math.ceil(cells.length / 6);
      container.style.gridTemplateRows = `repeat(${rows}, 64px)`;
    }
    return cell;
  }

  function makeItemElement(item) {
    const img = new Image();
    const ITEM_MAP = {
      grain_sack: grainSack,
      waterskin: waterskin,
      toolkit: toolkit,
      silk_bundle: silkBundle
    };
    img.src = ITEM_MAP[item] || 'PASTE_URL_HERE';
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.position = 'absolute';
    img.style.left = '8px';
    img.style.top = '8px';
    img.dataset.item = item;
    img.addEventListener('mousedown', ev => {
      dragging = img;
      offsetX = ev.offsetX + 8;
      offsetY = ev.offsetY + 8;
      img.style.pointerEvents = 'none';
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onDrop);
    });
    return img;
  }

  function addItem(item) {
    const cell = ensureCell();
    const img = makeItemElement(item);
    cell.appendChild(img);
    return true;
  }

  function removeItem(item) {
    for (const cell of cells) {
      const img = Array.from(cell.children).find(el => el.dataset.item === item);
      if (img) { img.remove(); return true; }
    }
    return false;
  }

  function onDrag(ev) {
    if (!dragging) return;
    dragging.style.left = ev.pageX - offsetX + 'px';
    dragging.style.top = ev.pageY - offsetY + 'px';
  }

  function onDrop(ev) {
    if (!dragging) return;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onDrop);
    dragging.style.pointerEvents = 'auto';
    const cell = cells.find(c => {
      const r = c.getBoundingClientRect();
      return (
        ev.clientX >= r.left &&
        ev.clientX < r.right &&
        ev.clientY >= r.top &&
        ev.clientY < r.bottom
      );
    });
    if (cell) {
      cell.appendChild(dragging);
      dragging.style.left = '8px';
      dragging.style.top = '8px';
    }
    dragging = null;
  }


  // populate starter items if provided
  starterItems.forEach(it => addItem(it));

  function show() {
    container.style.display = 'grid';
  }

  function hide() {
    container.style.display = 'none';
  }

  function toggle() {
    if (container.style.display === 'none') show();
    else hide();
  }

  return {
    element: container,
    show,
    hide,
    toggle,
    addItem,
    removeItem,
    destroy() {
      container.remove();
    }
  };
}
