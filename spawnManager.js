import { getObjectsByPrototype, Visual } from "game";
import { CARRY, HEAL, MOVE, RANGED_ATTACK, WORK, ATTACK } from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { getTicks } from 'game';

export function spawnManager() {
  if (!global.creepsOfRole) {
    global.creepsOfRole = {
      hauler: [],
      rangedAttacker: [],
      extractor: [],
      drainer: [],
      caravanLeader: [],
      caravanHealer: [],
      caravanRanger: [],
      canOpener: [],
      duo2: []
    };
  }

  const allSpawns = getObjectsByPrototype(StructureSpawn);
  const currentTicks = getTicks();

  for (const spawn of allSpawns) {
    if (!spawn.my) continue;

    const rangedAttackerCount = global.creepsOfRole.rangedAttacker.length;

    if (rangedAttackerCount > 0 && rangedAttackerCount % 2 === 0) {
      const spawnResult = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "rangedAttacker";
        continue; 
      }
    }

    if (global.creepsOfRole.hauler.length < 4) {
      const spawnResult = spawn.spawnCreep([CARRY, MOVE, CARRY, MOVE]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "hauler";
        continue;
      }
    }


    if (global.creepsOfRole.canOpener.length < 3) {
      const spawnResult = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "canOpener";
        continue;
      }
    }

    if (global.creepsOfRole.drainer.length < 1) {
      const spawnResult = spawn.spawnCreep([MOVE, CARRY]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "drainer";
        continue;
      }
    }
    
    if (global.creepsOfRole.extractor.length < 3) {
      const spawnResult = spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "extractor";
        continue;
      }
    }
    
    if (global.creepsOfRole.duo2.length < 3) {
      const spawnResult = spawn.spawnCreep([HEAL, HEAL, HEAL, MOVE, MOVE, MOVE]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "duo2";
        continue;
      }
    }

    if (global.creepsOfRole.rangedAttacker.length < Infinity) {
      const spawnResult = spawn.spawnCreep([
        RANGED_ATTACK,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        HEAL,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
        MOVE,
      ]);
      if (!spawnResult.error) {
        const creep = spawnResult.object;
        creep.role = "rangedAttacker";
        continue;
      }
    }
  }
}