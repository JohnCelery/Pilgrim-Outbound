export const POSITION = 'position';
export const PROVISIONS = 'provisions';
export const WATER = 'water';

export function addPosition(world, id, x = 0, y = 0) {
  world.addComponent(id, POSITION, { x, y });
}

export function addProvisions(world, id, amount = 0) {
  world.addComponent(id, PROVISIONS, { amount });
}

export function addWater(world, id, amount = 0) {
  world.addComponent(id, WATER, { amount });
}
