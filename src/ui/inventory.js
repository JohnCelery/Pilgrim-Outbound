export function createInventory(starterItems = []) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.right = '10px';
  container.style.bottom = '10px';
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
    container.appendChild(cell);
    cells.push(cell);
  }

  let dragging = null;
  let offsetX = 0;
  let offsetY = 0;

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
  starterItems.forEach((item, idx) => {
    const cell = cells[idx];
    if (!cell) return;
    const img = new Image();
    img.src = 'PASTE_URL_HERE';
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.position = 'absolute';
    img.style.left = '8px';
    img.style.top = '8px';
    img.addEventListener('mousedown', ev => {
      dragging = img;
      offsetX = ev.offsetX + 8;
      offsetY = ev.offsetY + 8;
      img.style.pointerEvents = 'none';
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onDrop);
    });
    cell.appendChild(img);
  });

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
    destroy() {
      container.remove();
    }
  };
}
