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

const baseUrl =
  'https://cdn.glitch.global/813b10b4-5e9c-4e7c-9356-9c7f504e5ff1/';

const waypointUrl = `${baseUrl}node_default.png`;
const currentUrl = `${baseUrl}node_current.png`;
const visitedUrl = `${baseUrl}node_visited.png`;
const markerUrl = `${baseUrl}marker.png`;
const shadowUrl = `${baseUrl}marker_shadow.png`;
const worldMapUrl =
  'https://cdn.glitch.global/d2170d50-99c2-4bff-b832-8d66b4d6e1f9/D217F327-6759-4EAC-9371-783E96C6D07B.png?v=1748360813466';

let waypointImg;
let currentImg;
let visitedImg;
let markerImg;
let shadowImg;
let worldMapImg;

export function drawMap(ctx, map, playerPos = null) {
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
    const baseX = ctx.canvas.width / 2 + playerPos.x * 64 - 32;
    const baseY = ctx.canvas.height / 2 + playerPos.y * 64 - 32;
    ctx.drawImage(shadowImg, baseX + 32 - 8, baseY + 48, 16, 16);
    ctx.drawImage(markerImg, baseX + 8, baseY + 8, 48, 48);
  }
}
