export function createWorld() {
  let nextId = 1;
  const components = new Map(); // Map of component type -> Map<entity, data>
  const entities = new Set(); // Track created entity ids

  function createEntity() {
    const id = nextId++;
    entities.add(id);
    return id;
  }

  function addComponent(id, type, data) {
    if (!components.has(type)) components.set(type, new Map());
    components.get(type).set(id, data);
  }

  function removeComponent(id, type) {
    components.get(type)?.delete(id);
  }

  function eachEntity(callback) {
    for (const id of entities) {
      callback(id);
    }
  }

  function query(...types) {
    if (types.length === 0) return [];
    const maps = types.map(t => components.get(t));
    if (maps.some(m => !m)) return [];
    const [first, ...rest] = maps;
    const results = [];
    for (const [id, comp] of first) {
      const row = [comp];
      let match = true;
      for (const m of rest) {
        const c = m.get(id);
        if (!c) { match = false; break; }
        row.push(c);
      }
      if (match) results.push({ id, comps: row });
    }
    return results;
  }

  return { createEntity, addComponent, removeComponent, query, eachEntity };
}
