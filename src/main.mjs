import { createRng } from './engine/rng.js';
import { createWorld } from './engine/ecs.js';
import { createLoop } from './engine/loop.js';

function boot() {
  const rng = createRng();
  const world = createWorld();
  const loop = createLoop(step);

  let elapsed = 0;
  let logTimer = 0;

  function step(dt) {
    elapsed += dt;
    logTimer += dt;
    if (logTimer >= 1000) {
      logTimer -= 1000;
      console.log(`${Math.round(elapsed)}ms`, rng.nextInt());
    }
  }

  loop.start();
}

window.addEventListener('DOMContentLoaded', boot);
