export function createWorld() {
  const entities = new Set();
  return {
    add(e) { entities.add(e); },
    remove(e) { entities.delete(e); },
    forEach(fn) { entities.forEach(fn); }
  };
}
