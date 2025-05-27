import { createRng } from './rng.js';
import { createLoop } from './loop.js';
import { createRenderer } from './renderer.js';
import { createWorld } from './ecs.js';

export function initEngine(canvas) {
  const rng = createRng(Date.now());
  const renderer = createRenderer(canvas);
  const world = createWorld();
  const loop = createLoop(step);

  function step(dt) {
    renderer.clear();
    world.forEach(e => {
      // TODO: update and render each entity
    });
  }

  loop.start();
}
