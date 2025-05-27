export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  return {
    ctx,
    clear() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
}

const waypointUrl =
  'https://cdn.glitch.global/813b10b4-5e9c-4e7c-9356-9c7f504e5ff1/node_default.png';
let waypointImg;

export function drawMap(ctx, map, current) {
  if (!waypointImg) {
    waypointImg = new Image();
    waypointImg.src = waypointUrl;
  }
  if (!map) return;
  for (const wp of map.waypoints) {
    const [gx, gy] = wp.coords;
    const x = ctx.canvas.width / 2 + gx * 64 - 32;
    const y = ctx.canvas.height / 2 + gy * 64 - 32;
    ctx.drawImage(waypointImg, x, y, 64, 64);
    if (current && current.x === gx && current.y === gy) {
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 4, y - 4, 72, 72);
    }
  }
}
