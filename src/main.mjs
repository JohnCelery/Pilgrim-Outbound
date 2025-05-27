import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';
import { createRenderer, drawMap } from './engine/renderer.js';
import { loadMap } from './engine/mapLoader.js';

function boot() {
  const canvas = document.getElementById('game');
  canvas.width = 800;
  canvas.height = 600;

  const rng = createRng();
  const world = createWorld();
  const renderer = createRenderer(canvas);
  const loop = createLoop(step);

  let mapData = null;

  loadMap(world).then(map => { mapData = map; });

  function step(_dt) {
    renderer.clear();
    drawMap(renderer.ctx, mapData);
  }

  loop.start();
}

window.addEventListener('DOMContentLoaded', boot);
