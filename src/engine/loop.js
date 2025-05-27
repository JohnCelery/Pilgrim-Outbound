export function createLoop(step) {
  const STEP = 1000 / 60; // ms per update
  let last = 0;
  let acc = 0;
  let running = false;

  function frame(t) {
    if (!running) return;
    acc += t - last;
    last = t;
    while (acc >= STEP) {
      step(STEP);
      acc -= STEP;
    }
    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (!running) {
        running = true;
        requestAnimationFrame(time => { last = time; frame(time); });
      }
    },
    stop() { running = false; }
  };
}
