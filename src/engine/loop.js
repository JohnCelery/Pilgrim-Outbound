export function createLoop(step) {
  let last = 0;
  let running = false;

  function frame(t) {
    if (!running) return;
    const dt = (t - last) / 1000;
    last = t;
    step(dt);
    requestAnimationFrame(frame);
  }

  return {
    start() {
      if (!running) {
        running = true;
        requestAnimationFrame(t => { last = t; frame(t); });
      }
    },
    stop() { running = false; }
  };
}
