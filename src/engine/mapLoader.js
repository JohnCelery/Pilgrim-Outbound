export async function loadMap(world, url = 'data/map.json') {
  const res = await fetch(url);
  const map = await res.json();
  for (const wp of map.waypoints) {
    const id = world.createEntity();
    world.addComponent(id, 'waypoint', wp);
  }
  return map;
}
