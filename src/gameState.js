export function createGameState(seed) {
  return {
    seed,
    day: 1,
    meters: { food: 140, water: 140, gear: 100 },
    fortune: 0,
    flags: {},
    lexicon: new Set(),
    recipes: new Set(),
    inventory: Array(24).fill(null),
    diary: []
  };
}

