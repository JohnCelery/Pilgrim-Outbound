import { PROVISIONS, WATER, GEAR, FORTUNE } from '../components.js';

// Placeholder icons for stats not yet backed by real assets
const healthIcon = '❤';
const staminaIcon = '⚡';

const foodUrl =
  'https://cdn.glitch.global/813b10b4-5e9c-4e7c-9356-9c7f504e5ff1/grain_sack_1x1.png';
const waterUrl =
  'https://cdn.glitch.global/813b10b4-5e9c-4e7c-9356-9c7f504e5ff1/water_drop.png';

let foodImg;
let waterImg;

export function createHud(world, playerId) {
  if (!foodImg) {
    foodImg = new Image();
    foodImg.src = foodUrl;
  }
  if (!waterImg) {
    waterImg = new Image();
    waterImg.src = waterUrl;
  }

  function getComp(type) {
    const res = world.query(type).find(r => r.id === playerId);
    return res ? res.comps[0] : null;
  }

  return {
    draw(ctx) {
      const prov = getComp(PROVISIONS) || { amount: 0 };
      const wat = getComp(WATER) || { amount: 0 };
      const gear = getComp(GEAR) || { amount: 0 };
      const fortune = getComp(FORTUNE) || { amount: 0 };
      const hp = getComp('health') || { amount: 100 };
      const sta = getComp('stamina') || { amount: 100 };

      const iconSize = 32;
      ctx.imageSmoothingEnabled = false;

      // Provisions
      ctx.drawImage(foodImg, 10, 10, iconSize, iconSize);
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.fillText(String(prov.amount), 10 + iconSize + 8, 10 + 24);

      // Water
      ctx.drawImage(waterImg, 10, 50, iconSize, iconSize);
      ctx.fillText(String(wat.amount), 10 + iconSize + 8, 50 + 24);

      // Gear
      ctx.fillText('G:', 10, 90);
      ctx.fillText(String(gear.amount), 26, 90);

      // Fortune
      ctx.fillText('F:', 10, 110);
      ctx.fillText(String(fortune.amount), 26, 110);

      // Health
      ctx.font = '24px sans-serif';
      ctx.fillText(healthIcon, 10, 90 + 24);
      ctx.font = '16px sans-serif';
      ctx.fillText(String(hp.amount), 10 + iconSize + 8, 90 + 24);

      // Stamina
      ctx.font = '24px sans-serif';
      ctx.fillText(staminaIcon, 10, 130 + 24);
      ctx.font = '16px sans-serif';
      ctx.fillText(String(sta.amount), 10 + iconSize + 8, 130 + 24);
    }
  };
}
