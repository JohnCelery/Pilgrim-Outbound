export const POSITION = 'position';
export const PROVISIONS = 'provisions';
export const WATER = 'water';
export const HEALTH = 'health';
export const STAMINA = 'stamina';
export const GEAR = 'gear';
export const IRON = 'iron';
export const SILVER = 'silver';
export const WOOD = 'wood';
export const FORTUNE = 'fortune';
export const FLAGS = 'flags';

export function addPosition(world, id, x = 0, y = 0) {
  world.addComponent(id, POSITION, { x, y });
}

export function addProvisions(world, id, amount = 0) {
  world.addComponent(id, PROVISIONS, { amount });
}

export function addWater(world, id, amount = 0) {
  world.addComponent(id, WATER, { amount });
}

export function addHealth(world, id, amount = 0) {
  world.addComponent(id, HEALTH, { amount });
}

export function addStamina(world, id, amount = 0) {
  world.addComponent(id, STAMINA, { amount });
}

export function addGear(world, id, amount = 0) {
  world.addComponent(id, GEAR, { amount });
}

export function addIron(world, id, amount = 0) {
  world.addComponent(id, IRON, { amount });
}

export function addSilver(world, id, amount = 0) {
  world.addComponent(id, SILVER, { amount });
}

export function addWood(world, id, amount = 0) {
  world.addComponent(id, WOOD, { amount });
}

export function addFortune(world, id, amount = 0) {
  world.addComponent(id, FORTUNE, { amount });
}

export function addFlags(world, id) {
  world.addComponent(id, FLAGS, {});
}
