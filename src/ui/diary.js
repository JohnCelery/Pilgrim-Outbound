export function createDiary() {
  const log = document.createElement('div');
  log.id = 'diary';
  log.style.position = 'absolute';
  log.style.left = '0';
  log.style.bottom = '0';
  log.style.width = '100%';
  log.style.maxHeight = '150px';
  log.style.overflowY = 'auto';
  log.style.background = 'rgba(244,241,233,0.85)';
  log.style.font = '14px sans-serif';
  log.style.padding = '4px';
  document.body.appendChild(log);

  return {
    add(line) {
      const p = document.createElement('div');
      p.textContent = line;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
    },
    element: log,
    destroy() { log.remove(); }
  };
}
