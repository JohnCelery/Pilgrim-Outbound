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

const waypointUrl = 'PASTE_URL_HERE';
const currentUrl = 'PASTE_URL_HERE';
const visitedUrl = 'PASTE_URL_HERE';
const markerUrl = 'PASTE_URL_HERE';
const shadowUrl = 'PASTE_URL_HERE';
const worldMapUrl = 'PASTE_URL_HERE';

let waypointImg;
let currentImg;
let visitedImg;
let markerImg;
let shadowImg;
let worldMapImg;

export function drawMap(ctx, map, playerPos = null, tween = null) {
  if (!waypointImg) {
    waypointImg = new Image();
    waypointImg.src = waypointUrl;
  }
  if (!currentImg) {
    currentImg = new Image();
    currentImg.src = currentUrl;
  }
  if (!visitedImg) {
    visitedImg = new Image();
    visitedImg.src = visitedUrl;
  }
  if (!markerImg) {
    markerImg = new Image();
    markerImg.src = markerUrl;
  }
  if (!shadowImg) {
    shadowImg = new Image();
    shadowImg.src = shadowUrl;
  }
  if (!worldMapImg) {
    worldMapImg = new Image();
    worldMapImg.src = worldMapUrl;
  }
  if (!map) return;

  ctx.imageSmoothingEnabled = false;

  // Draw the full world map as a backdrop once the image is loaded
  if (worldMapImg.complete) {
    ctx.drawImage(worldMapImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  for (const wp of map.waypoints) {
    const [gx, gy] = wp.coords;
    const x = ctx.canvas.width / 2 + gx * 64 - 32;
    const y = ctx.canvas.height / 2 + gy * 64 - 32;

    let img = waypointImg;
    if (playerPos && gx === playerPos.x && gy === playerPos.y) {
      img = currentImg;
    } else if (wp.visited) {
      img = visitedImg;
    }

    ctx.drawImage(img, x, y, 64, 64);
  }

  if (playerPos) {
    let px = playerPos.x;
    let py = playerPos.y;
    if (tween) {
      px = tween.start.x + (tween.end.x - tween.start.x) * tween.progress;
      py = tween.start.y + (tween.end.y - tween.start.y) * tween.progress;
    }
    const baseX = ctx.canvas.width / 2 + px * 64 - 32;
    const baseY = ctx.canvas.height / 2 + py * 64 - 32;
    ctx.drawImage(shadowImg, baseX + 32 - 8, baseY + 48, 16, 16);
    ctx.drawImage(markerImg, baseX + 8, baseY + 8, 48, 48);
  }

  // subtle radial vignette
  const g = ctx.createRadialGradient(
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    0,
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    Math.max(ctx.canvas.width, ctx.canvas.height) / 2
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
