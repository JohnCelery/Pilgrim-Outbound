export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  return {
    clear() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
}
