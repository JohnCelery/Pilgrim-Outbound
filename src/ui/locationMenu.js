import { modalFrame } from '../assets.js';
import { PROVISIONS, WATER, GEAR, IRON, SILVER, WOOD, FORTUNE, FLAGS } from '../components.js';

export function createLocationMenu(world, playerId, diaryFn = null) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.left = '0';
  overlay.style.top = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.zIndex = '999';
  overlay.style.display = 'none';

  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.left = '50%';
  panel.style.top = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.backgroundImage = `url('${modalFrame}')`;
  panel.style.backgroundSize = 'contain';
  panel.style.backgroundRepeat = 'no-repeat';
  panel.style.width = '1280px';
  panel.style.height = '400px';
  panel.style.maxWidth = '90%';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.justifyContent = 'flex-end';
  panel.style.alignItems = 'center';
  panel.style.padding = '16px';
  panel.style.boxSizing = 'border-box';
  panel.style.color = '#fff';
  panel.style.fontFamily = 'serif';

  const heroImg = document.createElement('img');
  heroImg.style.width = '100%';
  heroImg.style.flex = '1';
  heroImg.style.objectFit = 'cover';
  heroImg.style.border = 'none';
  panel.appendChild(heroImg);

  const choiceContainer = document.createElement('div');
  choiceContainer.style.width = '100%';
  panel.appendChild(choiceContainer);

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  function hide() {
    overlay.style.display = 'none';
    panel.style.display = 'none';
    choiceContainer.innerHTML = '';
  }

  function modify(type, delta) {
    const res = world.query(type).find(r => r.id === playerId);
    if (res) {
      const comp = res.comps[0];
      comp.amount = Math.max(0, (comp.amount || 0) + delta);
    }
  }

  const RES = { food: PROVISIONS, water: WATER, gear: GEAR, iron: IRON, silver: SILVER, wood: WOOD, fortune: FORTUNE };

  function makeChoice(text, outcome, onComplete) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.display = 'block';
    btn.style.margin = '4px auto';
    btn.addEventListener('click', () => {
      for (const [k,v] of Object.entries(outcome.resources || {})) {
        const t = RES[k];
        if (t) modify(t, v);
      }
      const flagRes = world.query(FLAGS).find(r => r.id === playerId);
      const flags = flagRes ? flagRes.comps[0] : {};
      for (const f of outcome.setFlags || []) flags[f] = true;
      for (const f of outcome.clearFlags || []) delete flags[f];
      if (diaryFn && outcome.diary) diaryFn(outcome.diary);
      hide();
      if (onComplete) onComplete();
    });
    choiceContainer.appendChild(btn);
  }

  const DATA = {
    market: {
      hero: 'heroMarket',
      options: [
        { text: 'Visit Market Stalls', diary: 'The stalls bustle with trade.' },
        { text: 'Seek Specialist Services', diary: 'You find a skilled healer.' },
        { text: 'Haggle with a Merchant', diary: 'A tense negotiation ensues.' },
        { text: 'Pay the Tithe Cart', diary: 'You pay church dues.' },
        { text: 'Skirt the Bazaar', diary: 'You avoid the crowds.' }
      ]
    },
    monastery: {
      hero: 'heroMonastery',
      options: [
        { text: 'Request Gear Repairs', diary: 'The monks tend your gear.' },
        { text: 'Present the Leech-Book', diary: 'A healer treats your malaise.' },
        { text: 'Study in the Scriptorium', diary: 'You pore over Latin texts.' },
        { text: 'Join Vespers', diary: 'You rest among the chants.' },
        { text: 'Steal from the Reliquary', diary: 'You risk wrath for relics.' }
      ]
    },
    farmland: {
      hero: 'heroFarmland',
      options: [
        { text: 'Harvest the Fields', diary: 'You gather grain.' },
        { text: 'Trade with Peasants', diary: 'You barter for goods.' },
        { text: 'Help With Harvest', diary: 'Labor earns goodwill.' },
        { text: 'Stand Watch Against Bandits', diary: 'You guard the hamlet.' },
        { text: 'Move On', diary: 'You soon depart.' }
      ]
    },
    forest: {
      hero: 'heroForest',
      options: [
        { text: 'Gather Timber & Herbs', diary: 'You forage quietly.' },
        { text: 'Hunt Game', diary: 'You track wild beasts.' },
        { text: 'Search for Secret Path', diary: 'You seek hidden trails.' },
        { text: 'Track the Clockwork Stag', diary: 'A mechanical stag eludes you.' },
        { text: 'Break Camp Quietly', diary: 'You slip away unseen.' }
      ]
    },
    mountain: {
      hero: 'heroMountain',
      options: [
        { text: 'Mine the Scree', diary: 'You chip at the rocks.' },
        { text: 'Scavenge Roman Debris', diary: 'Rusty relics litter the pass.' },
        { text: 'Light a Signal Fire', diary: 'Smoke curls into the sky.' },
        { text: 'Shelter in a Crevice', diary: 'You wait out the cold night.' },
        { text: 'Descend Immediately', diary: 'You hurry on your way.' }
      ]
    },
    river: {
      hero: 'heroRiver',
      options: [
        { text: 'Refill Waterskins', diary: 'Cool water refreshes you.' },
        { text: 'Fish the Shallows', diary: 'You cast lines into the eddy.' },
        { text: 'Hire the Ferry', diary: 'A ferryman hastens your travel.' },
        { text: 'Inspect the Singing Chains', diary: 'Strange echoes ring out.' },
        { text: 'Cross Without Delay', diary: 'You ford the river quickly.' }
      ]
    },
    port: {
      hero: 'heroPort',
      options: [
        { text: 'Browse Exotic Traders', diary: 'Silks and spices tempt you.' },
        { text: 'Book Passage', diary: 'You secure a berth on a ship.' },
        { text: 'Gossip at the Dockside', diary: 'Sailors trade stories.' },
        { text: 'Barter With Longship Raiders', diary: 'Tense barter with raiders.' },
        { text: 'Leave the Pier', diary: 'You depart the port.' }
      ]
    },
    ruin: {
      hero: 'heroRuin',
      options: [
        { text: 'Explore the Aqueduct', diary: 'You pick through fallen stone.' },
        { text: 'Collect Mosaic Tesserae', diary: 'Colored shards fill your pack.' },
        { text: 'Meditate in the Hypocaust', diary: 'Whispers of the past stir.' },
        { text: 'Chisel Bronze Valve', diary: 'Old mechanisms resist.' },
        { text: 'Back Away Respectfully', diary: 'You keep your distance.' }
      ]
    },
    battlefield: {
      hero: 'heroBattlefield',
      options: [
        { text: 'Scavenge the Wreckage', diary: 'The dead yield grim bounty.' },
        { text: 'Tend the Wounded', diary: 'You aid the fallen.' },
        { text: 'Search the Siege Engine', diary: 'Siege debris hides loot.' },
        { text: 'Burn the Plague Piles', diary: 'Smoke clears the pestilence.' },
        { text: 'Ride Through Quickly', diary: 'You spur past the carnage.' }
      ]
    },
    hiddenPath: {
      hero: 'heroHiddenPath',
      options: [
        { text: 'Follow the Marked Shells', diary: 'A secret trail unfolds.' },
        { text: 'Hide the Path Entrance', diary: 'You conceal your track.' },
        { text: 'Trace the Runes', diary: 'Mystic runes glitter faintly.' },
        { text: 'Set Up Camp', diary: 'A quiet haven for the night.' },
        { text: 'Turn Back', diary: 'Doubts halt your progress.' }
      ]
    },
    encampment: {
      hero: 'heroEncampment',
      options: [
        { text: 'Rest by the Fire', diary: 'Warmth seeps into your bones.' },
        { text: 'Consult Rumour Board', diary: 'You hear many whispers.' },
        { text: 'Join a Dice Game', diary: 'Luck dances with the bones.' },
        { text: 'Visit Swordsmith Tent', diary: 'Blades gleam under the hammer.' },
        { text: 'Patrol for Ambushers', diary: 'You scout the perimeter.' }
      ]
    },
    cathedral: {
      hero: 'heroCathedral',
      options: [
        { text: 'Enter Grand Market', diary: 'Merchants shout their prices.' },
        { text: 'Use the Craft Halls', diary: 'Forge fires roar.' },
        { text: 'Audience with High Cleric', diary: 'You kneel before high ranks.' },
        { text: 'Commission a Manuscript', diary: 'Scribes set quills to parchment.' },
        { text: 'Pray beneath the Vault', diary: 'Echoing hymns calm your soul.' }
      ]
    }
  };

  function show(type, heroMap, onComplete) {
    const def = DATA[type];
    if (!def) return onComplete && onComplete();
    heroImg.src = heroMap[def.hero] || '';
    choiceContainer.innerHTML = '';
    def.options.forEach(opt => makeChoice(opt.text, opt, onComplete));
    overlay.style.display = 'block';
    panel.style.display = 'flex';
  }

  return { show, hide };
}

