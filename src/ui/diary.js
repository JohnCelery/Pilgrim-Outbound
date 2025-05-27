import { diaryPanel } from '../assets.js';

export function createDiary(state = null) {
  const panel = document.createElement('div');
  panel.id = 'diary';
  panel.style.position = 'absolute';
  panel.style.right = '0';
  panel.style.top = '0';
  panel.style.width = '250px';
  panel.style.height = '100%';
  panel.style.backgroundImage = `url('${diaryPanel}')`;
  panel.style.backgroundSize = 'cover';
  panel.style.transform = 'translateX(100%)';
  panel.style.transition = 'transform 0.3s ease-out';
  panel.style.overflow = 'hidden';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';

  const log = document.createElement('div');
  log.style.flex = '1';
  log.style.overflowY = 'auto';
  log.style.padding = '8px';
  log.style.font = '14px sans-serif';
  panel.appendChild(log);

  document.body.appendChild(panel);

  function slideIn() {
    panel.style.transform = 'translateX(0)';
    setTimeout(() => {
      panel.style.transform = 'translateX(100%)';
    }, 2000);
  }

  return {
    add(line) {
      const p = document.createElement('div');
      p.textContent = line;
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
      slideIn();
      if (state && Array.isArray(state.diary)) {
        state.diary.push(line);
      }
    },
    element: panel,
    destroy() { panel.remove(); }
  };
}
