import { findClosestByRange, getDirection, getObjectsByPrototype, getRange, getTerrainAt } from "game"
import { ATTACK, ATTACK_POWER, HEAL, HEAL_POWER, MOVE, OK, RANGED_ATTACK, RANGED_ATTACK_POWER, TERRAIN_WALL, RESOURCE_ENERGY } from "game/constants"
import { CostMatrix, searchPath } from "game/path-finder"
import { Creep, OwnedStructure, StructureContainer, Structure } from "game/prototypes"
import { Visual } from "game/visual"
import { colours } from "./constants"
import { findEnemyAttackers, findEnemySpawns, findPositionsInsideRect, findSquadCenter } from "./generalFuncs"
import { findPath } from "game/utils"

Creep.prototype.getActiveParts = function(type) {
  const creep = this
  for (const part of creep.body) {
    if (part.hits > 0 && part.type == type) return true
  }
  return false
}

Creep.prototype.findPartsAmount = function(type) {
  const creep = this
  let partsAmount = 0
  for (const part of creep.body) {
    if (part.hits > 0 && part.type == type) partsAmount++
  }
  return partsAmount
}

Creep.prototype.attackEnemyAttackers = function() {
  const creep = this
  const visual = new Visual()

  const enemyAttackers = findEnemyAttackers().concat(findEnemySpawns())

  if (!enemyAttackers.length) {
    visual.text("Idle", creep, { font: 0.5, opacity: 0.7 })
    return false
  }

  const enemyAttacker = findClosestByRange(creep, enemyAttackers)

  if (creep.hits <= creep.hitsMax * 0.8) {
    visual.text("Retreating", creep, { font: 0.5, opacity: 0.7 })
    creep.travel({
      goal: { pos: enemyAttacker, range: 2 },
      rangedAttacker: true,
      swampCost: 0,
      flee: true
    })
    return true
  }

  creep.travel({
    goal: { pos: enemyAttacker, range: 2 },
    rangedAttacker: true,
    swampCost: 0
  })

  if (getRange(creep, enemyAttacker) == 1) {
    visual.text("Mass Attacking", creep, { font: 0.5, opacity: 0.7 })
    creep.rangedMassAttack()
    return true
  }

  if (getRange(creep, enemyAttacker) > 3) {
    visual.text("Mass Attacking", creep, { font: 0.5, opacity: 0.7 })
    creep.rangedMassAttack()
    return true
  }

  visual.text("Attacking", creep, { font: 0.5, opacity: 0.7 })
  creep.rangedAttack(enemyAttacker)
  return true
}
Creep.prototype.becomeCaravan = function(c1, c2, c3, c4, c5, c6) {
  if(!c1 || !c2 || !c3 || !c4 || !c5 || !c6) {
    return;
  }
   // Check for fatigue first
   if (c1.fatigue > 0 || c2.fatigue > 0 || c3.fatigue > 0 || c4.fatigue > 0 || c5.fatigue > 0 || c6.fatigue > 0) {
    c2.heal(c1);
    c4.heal(c3);
    c6.heal(c5);
    return;
  }

  
  // First ensure proper linear formation
  const formationGap = 1; // Distance between each creep
  
  // Check and fix formation from back to front to prevent overlapping
  if (getRange(c5, c6) > formationGap) {
    c6.moveTo(c5);
    return;
  }
  if (getRange(c4, c5) > formationGap) {
    c5.moveTo(c4);
    return;
  }
  if (getRange(c3, c4) > formationGap) {
    c4.moveTo(c3);
    return;
  }
  if (getRange(c2, c3) > formationGap) {
    c3.moveTo(c2);
    return;
  }
  if (getRange(c1, c2) > formationGap) {
    c2.moveTo(c1);
    return;
  }

  // Once formation is set, proceed with original caravan logic
  const enemyAttackers = findEnemyAttackers();
  const enemySpawns = findEnemySpawns();
  const allEnemies = enemyAttackers.concat(enemySpawns);
  
  if (!allEnemies.length) return;

  const closestEnemy = findClosestByRange(c1, allEnemies);
  
  if (c1.hits <= c1.hitsMax * 0.8 || c3.hits <= c3.hitsMax * 0.8 || c5.hits <= c5.hitsMax * 0.8) {
    c1.travel({ goal: { pos: closestEnemy, range: 3 }, flee: true });
    c1.pull(c2);
    c2.pull(c3);
    c3.pull(c4);
    c4.pull(c5);
    c5.pull(c6);
    c2.moveTo(c1);
    c3.moveTo(c2);
    c4.moveTo(c3);
    c5.moveTo(c4);
    c6.moveTo(c5);
  } else {
    if (findEnemySpawns().includes(closestEnemy)) {
      c1.travel({ goal: { pos: closestEnemy, range: 1 } });
      c1.pull(c2);
      c2.pull(c3);
      c3.pull(c4);
      c4.pull(c5);
      c5.pull(c6);
      c2.moveTo(c1);
      c3.moveTo(c2);
      c4.moveTo(c3);
      c5.moveTo(c4);
      c6.moveTo(c5);
    } else {
      c1.travel({ goal: { pos: closestEnemy, range: 1 } });
      c1.pull(c2);
      c2.pull(c3);
      c3.pull(c4);
      c4.pull(c5);
      c5.pull(c6);
      c2.moveTo(c1);
      c3.moveTo(c2);
      c4.moveTo(c3);
      c5.moveTo(c4);
      c6.moveTo(c5);
    }
  }


  // Combat actions
  if (getRange(c1, closestEnemy) <= 3) {
    c1.rangedMassAttack();
    c3.rangedMassAttack();
    c5.rangedAttack(closestEnemy);
  }

  // Healing
  c2.heal(c1);
  c4.heal(c3);
  c6.heal(c5);
}
Creep.prototype.attackEnemySpawns = function() {
  const creep = this
  const visual = new Visual()

  const enemySpawn = findClosestByRange(creep, findEnemySpawns())
  if (!enemySpawn) {
    visual.text("Idle", creep, { font: 0.5, opacity: 0.7 })
    return false
  }

  if (creep.hits <= creep.hitsMax * 0.8) {
    visual.text("Retreating", creep, { font: 0.5, opacity: 0.7 })
    creep.travel({
      goal: { pos: enemySpawn, range: 1 },
      rangedAttacker: true,
      swampCost: 0,
      flee: true
    })
    return true
  }

  if (getRange(creep, enemySpawn) == 1) {
    visual.text("Mass Attacking Spawn", creep, { font: 0.5, opacity: 0.7 })
    creep.rangedMassAttack()
    return true
  }

  creep.travel({
    goal: { pos: enemySpawn, range: 1 },
    rangedAttacker: true,
    swampCost: 0
  })

  if (getRange(creep, enemySpawn) > 3) {
    visual.text("Mass Attacking Spawn", creep, { font: 0.5, opacity: 0.7 })
    creep.rangedMassAttack()
    return true
  }

  visual.text("Attacking Spawn", creep, { font: 0.5, opacity: 0.7 })
  creep.rangedAttack(enemySpawn)
  return true
}

Creep.prototype.advancedHeal = function() {
  const creep = this
  const visual = new Visual()

  if (creep.hits < creep.hitsMax) {
    visual.text("Self Healing", creep, { font: 0.5, opacity: 0.7 })
    creep.heal(creep)
    return
  }

  const nearbyMyCreeps = global.creepsOfRole.rangedAttacker.filter(
    nearbyCreep => nearbyCreep.my && getRange(creep, nearbyCreep) <= 3
  )

  for (const nearbyCreep of nearbyMyCreeps) {
    if (nearbyCreep.hits == nearbyCreep.hitsMax) continue

    if (getRange(creep, nearbyCreep) <= 1) {
      visual.text("Healing Ally", creep, { font: 0.5, opacity: 0.7 })
      creep.heal(nearbyCreep)
      return
    }
    visual.text("Healing Ally", nearbyCreep, { font: 0.5, opacity: 0.7, y: -0.5 })
    
    creep.rangedHeal(nearbyCreep)
    creep.moveTo(nearbyCreep)
    return
  }

  creep.heal(creep)
}

Creep.prototype.travel = function(opts) {
  const creep = this
  const visual = new Visual()
  const costMatrix = new CostMatrix()

  // Mark all structures as impassable
  for (const structure of getObjectsByPrototype(Structure)) {
    costMatrix.set(structure.x, structure.y, 255)
  }
  if(opts.duo) {
    const creeps = getObjectsByPrototype(Creep)
    for (const otherCreep of creeps) {
      if (otherCreep === creep) continue
      costMatrix.set(otherCreep.x, otherCreep.y, 255)
    }
    for (const structure of getObjectsByPrototype(Structure)) {
      costMatrix.set(structure.x, structure.y, 255)
    }
  }

  if (opts.rangedAttacker) {
    const attackEnemyCreeps = getObjectsByPrototype(Creep).filter(
      creep => !creep.my && creep.getActiveParts(ATTACK)
    )

    let range = 1,
      highestRange = 1

    for (const enemyCreep of attackEnemyCreeps) {
      range = 1

      const rangeBetween = getRange(creep, enemyCreep)

      if (rangeBetween <= 3) {
        if (!enemyCreep.getActiveParts(MOVE)) range = 1
        else range = 2
      }

      if (range > highestRange) highestRange = range + 1

      const positions = findPositionsInsideRect(
        enemyCreep.x - range,
        enemyCreep.y - range,
        enemyCreep.x + range,
        enemyCreep.y + range
      )

      for (const pos of positions) {
        if (getTerrainAt(pos) == TERRAIN_WALL) continue
        costMatrix.set(pos.x, pos.y, 254)
      }
    }

    const rangedAttackEnemyCreeps = getObjectsByPrototype(Creep).filter(
      creep => !creep.my && creep.getActiveParts(RANGED_ATTACK)
    )

    for (const enemyCreep of rangedAttackEnemyCreeps) {
      if (
        creep.findPartsAmount(ATTACK) * ATTACK_POWER +
        creep.findPartsAmount(RANGED_ATTACK) * RANGED_ATTACK_POWER +
          creep.findPartsAmount(HEAL) * HEAL_POWER >
        enemyCreep.findPartsAmount(RANGED_ATTACK) * RANGED_ATTACK_POWER +
          enemyCreep.findPartsAmount(HEAL) * HEAL_POWER
      )
        continue

      range = 2

      if (getRange(creep, enemyCreep) <= 3 && range > highestRange)
        highestRange = range + 1

      const positions = findPositionsInsideRect(
        enemyCreep.x - range,
        enemyCreep.y - range,
        enemyCreep.x + range,
        enemyCreep.y + range
      )

      for (const pos of positions) {
        if (getTerrainAt(pos) == TERRAIN_WALL) continue
        costMatrix.set(pos.x, pos.y, 254)
      }
    }

    const allCreeps = getObjectsByPrototype(Creep).filter(
      anyCreep => anyCreep.id != creep.id
    )
    for (const creepAlt of allCreeps)
      costMatrix.set(creepAlt.x, creepAlt.y, 255)

    const squadCenter = findSquadCenter()
    const distanceFromSquad = getRange(creep, squadCenter)

    if (distanceFromSquad > 3 && !opts.flee) {
      opts.goal.range = Math.min(opts.goal.range, distanceFromSquad - 3)
    }

    opts.goal.range = highestRange

    const squadLeadersInRange = global.creepsOfRole.rangedAttacker.filter(
        rangedAttacker => getRange(creep, rangedAttacker) <= 4
      ).length,
      enemyAttackersInRange =
        attackEnemyCreeps.filter(
          enemyAttacker => getRange(creep, enemyAttacker) <= 2
        ).length +
        rangedAttackEnemyCreeps.filter(
          enemyAttacker => getRange(creep, enemyAttacker) <= 4
        ).length

    opts.flee =
      opts.flee ||
      costMatrix.get(creep.x, creep.y) >= 254 ||
      enemyAttackersInRange > squadLeadersInRange ||
      creep.hits <= creep.hitsMax * 0.8
    if (opts.flee) opts.goal.range = 4
  }

  visual.line(creep, opts.goal.pos, {
    opacity: 0.2,
    color: colours.lightBlue
  })

  const path = searchPath(creep, opts.goal, {
    costMatrix,
    flee: opts.flee,
    plainCost: opts.plainCost,
    swampCost: opts.swampCost
  }).path

  visual.poly(path, { opacity: 0.2, stroke: colours.black })

  if (!path.length) return

  creep.move(getDirection(path[0].x - creep.x, path[0].y - creep.y))
}
Creep.prototype.drainEnemyContainers = function() {
  const creep = this
  const visual = new Visual()
  
  const enemySpawn = findClosestByRange(creep, findEnemySpawns())
  if (!enemySpawn) return false

  // Create cost matrix that marks walls as completely impassable
  const costMatrix = new CostMatrix()
  for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
      if (getTerrainAt({x, y}) === TERRAIN_WALL) {
        costMatrix.set(x, y, 255)
      }
    }
  }

  const allContainers = getObjectsByPrototype(StructureContainer)
  const validContainers = allContainers.filter(container => {
    // Check if container is near enemy spawn
    if (getRange(container, enemySpawn) > 5) return false
    
    // Check if container has energy
    if (container.store.energy <= 0) return false
    
    // Check if container is on a wall
    if (getTerrainAt(container) === TERRAIN_WALL) return false
    
    // Verify path exists using costMatrix
    const path = searchPath(creep, {pos: container, range: 1}, {
      costMatrix: costMatrix,
      maxOps: 1000,
      swampCost: 5
    })
    
    return path.path.length > 0
  })

  if (!validContainers.length) {
    visual.text("No valid containers - Suiciding", creep, { font: 0.5, opacity: 0.7 })
    //creep.suicide()
    return true
  }

  const targetContainer = findClosestByRange(creep, validContainers)

  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    visual.text("Withdrawing", creep, { font: 0.5, opacity: 0.7 })
    if (getRange(creep, targetContainer) > 1) {
      creep.travel({
        goal: { pos: targetContainer, range: 1 },
        swampCost: 5,
        plainCost: 2,
        costMatrix: costMatrix
      })
    } else {
      creep.withdraw(targetContainer, RESOURCE_ENERGY)
      }
    }
  }

/*/
import {
  findClosestByRange,
  getDirection,
  getObjectsByPrototype,
  getRange,
  getTerrainAt
} from "game"
import {
  ATTACK,
  HEAL,
  HEAL_POWER,
  MOVE,
  OK,
  RANGED_ATTACK,
  RANGED_ATTACK_POWER,
  TERRAIN_WALL
} from "game/constants"
import { CostMatrix, searchPath } from "game/path-finder"
import { Creep, OwnedStructure } from "game/prototypes"
import { Visual } from "game/visual"
import { colours } from "./constants"
import {
  findEnemyAttackers,
  findEnemySpawns,
  findPositionsInsideRect
} from "./generalFuncs"

Creep.prototype.getActiveParts = function(type) {
  const creep = this

  for (const part of creep.body) {
    if (part.hits > 0 && part.type == type) return true
  }

  return false
}

Creep.prototype.findPartsAmount = function(type) {
  const creep = this

  let partsAmount = 0

  for (const part of creep.body) {
    if (part.hits > 0 && part.type == type) partsAmount++
  }

  return partsAmount
}

Creep.prototype.attackEnemyAttackers = function() {
  const creep = this
  const visual = new Visual()

  const enemyAttackers = findEnemyAttackers().concat(findEnemySpawns())

  if (!enemyAttackers.length) {
    visual.text("Idle", creep, { font: 0.5, opacity: 0.7,  })
    return false
  }

  const enemyAttacker = findClosestByRange(creep, enemyAttackers)

  if (creep.hits <= creep.hitsMax * 0.8) {
    visual.text("Retreating", creep, { font: 0.5, opacity: 0.7,  })
    creep.travel({
      goal: { pos: enemyAttacker, range: 2 },
      rangedAttacker: true,
      swampCost: 0,
      flee: true
    })
    return true
  }

  creep.travel({
    goal: { pos: enemyAttacker, range: 2 },
    rangedAttacker: true,
    swampCost: 0
  })

  if (getRange(creep, enemyAttacker) == 1) {
    visual.text("Mass Attacking", creep, { font: 0.5, opacity: 0.7,  })
    creep.rangedMassAttack()
    return true
  }

  if (getRange(creep, enemyAttacker) > 3) {
    visual.text("Mass Attacking", creep, { font: 0.5, opacity: 0.7,  })
    creep.rangedMassAttack()
    return true
  }

  visual.text("Attacking", creep, { font: 0.5, opacity: 0.7,  })
  creep.rangedAttack(enemyAttacker)
  return true
}

Creep.prototype.attackEnemySpawns = function() {
  const creep = this
  const visual = new Visual()

  const enemySpawn = findClosestByRange(creep, findEnemySpawns())
  if (!enemySpawn) {
    visual.text("Idle", creep, { font: 0.5, opacity: 0.7,  })
    return false
  }

  if (creep.hits <= creep.hitsMax * 0.8) {
    visual.text("Retreating", creep, { font: 0.5, opacity: 0.7,  })
    creep.travel({
      goal: { pos: enemySpawn, range: 1 },
      rangedAttacker: true,
      swampCost: 0,
      flee: true
    })
    return true
  }

  if (getRange(creep, enemySpawn) == 1) {
    visual.text("Mass Attacking Spawn", creep, { font: 0.5, opacity: 0.7,  })
    creep.rangedMassAttack()
    return true
  }

  creep.travel({
    goal: { pos: enemySpawn, range: 1 },
    rangedAttacker: true,
    swampCost: 0
  })

  if (getRange(creep, enemySpawn) > 3) {
    visual.text("Mass Attacking Spawn", creep, { font: 0.5, opacity: 0.7,  })
    creep.rangedMassAttack()
    return true
  }

  visual.text("Attacking Spawn", creep, { font: 0.5, opacity: 0.7,  })
  creep.rangedAttack(enemySpawn)
  return true
}

Creep.prototype.advancedHeal = function() {
  const creep = this
  const visual = new Visual()

  if (creep.hits < creep.hitsMax) {
    visual.text("Self Healing", creep, { font: 0.5, opacity: 0.7,  })
    creep.heal(creep)
    return
  }

  const nearbyMyCreeps = global.creepsOfRole.rangedAttacker.filter(
    nearbyCreep => nearbyCreep.my && getRange(creep, nearbyCreep) <= 3
  )

  for (const nearbyCreep of nearbyMyCreeps) {
    if (nearbyCreep.hits == nearbyCreep.hitsMax) continue

    if (getRange(creep, nearbyCreep) <= 1) {
      visual.text("Healing Ally", creep, { font: 0.5, opacity: 0.7,  })
      creep.heal(nearbyCreep)
      return
    }
    visual.text("Healing Ally", nearbyCreep, { font: 0.5, opacity: 0.7, y: -0.5 })
    
    creep.rangedHeal(nearbyCreep)
    creep.moveTo(nearbyCreep)
    return
  }


  creep.heal(creep)
}


Creep.prototype.travel = function(opts) {
  const creep = this
  const visual = new Visual()
  const costMatrix = new CostMatrix()

  if (opts.rangedAttacker) {
    for (const structure of getObjectsByPrototype(OwnedStructure)) {
      costMatrix.set(structure.x, structure.y, 255)
    }

    const attackEnemyCreeps = getObjectsByPrototype(Creep).filter(
      creep => !creep.my && creep.getActiveParts(ATTACK)
    )

    let range = 1,
      highestRange = 1

    for (const enemyCreep of attackEnemyCreeps) {
      range = 1

      const rangeBetween = getRange(creep, enemyCreep)

      if (rangeBetween <= 3) {
        if (!enemyCreep.getActiveParts(MOVE)) range = 1
        else range = 2
      }

      if (range > highestRange) highestRange = range + 1

      const positions = findPositionsInsideRect(
        enemyCreep.x - range,
        enemyCreep.y - range,
        enemyCreep.x + range,
        enemyCreep.y + range
      )

      for (const pos of positions) {
        if (getTerrainAt(pos) == TERRAIN_WALL) continue

        costMatrix.set(pos.x, pos.y, 254)
      }
    }

    const rangedAttackEnemyCreeps = getObjectsByPrototype(Creep).filter(
      creep => !creep.my && creep.getActiveParts(RANGED_ATTACK)
    )

    for (const enemyCreep of rangedAttackEnemyCreeps) {
      if (
        creep.findPartsAmount(RANGED_ATTACK) * RANGED_ATTACK_POWER +
          creep.findPartsAmount(HEAL) * HEAL_POWER >
        enemyCreep.findPartsAmount(RANGED_ATTACK) * RANGED_ATTACK_POWER +
          enemyCreep.findPartsAmount(HEAL) * HEAL_POWER
      )
        continue

      range = 2

      if (getRange(creep, enemyCreep) <= 3 && range > highestRange)
        highestRange = range + 1

      const positions = findPositionsInsideRect(
        enemyCreep.x - range,
        enemyCreep.y - range,
        enemyCreep.x + range,
        enemyCreep.y + range
      )

      for (const pos of positions) {
        if (getTerrainAt(pos) == TERRAIN_WALL) continue

        costMatrix.set(pos.x, pos.y, 254)
      }
    }

    const allCreeps = getObjectsByPrototype(Creep).filter(
      anyCreep => anyCreep.id != creep.id
    )
    for (const creepAlt of allCreeps)
      costMatrix.set(creepAlt.x, creepAlt.y, 255)

    opts.goal.range = highestRange

    const squadLeadersInRange = global.creepsOfRole.rangedAttacker.filter(
        rangedAttacker => getRange(creep, rangedAttacker) <= 4
      ).length,
      enemyAttackersInRange =
        attackEnemyCreeps.filter(
          enemyAttacker => getRange(creep, enemyAttacker) <= 2
        ).length +
        rangedAttackEnemyCreeps.filter(
          enemyAttacker => getRange(creep, enemyAttacker) <= 4
        ).length

    opts.flee =
      opts.flee ||
      costMatrix.get(creep.x, creep.y) >= 254 ||
      enemyAttackersInRange > squadLeadersInRange ||
      creep.hits <= creep.hitsMax * 0.8
    if (opts.flee) opts.goal.range = 4
  }

  visual.line(creep, opts.goal.pos, {
    opacity: 0.2,
    color: colours.lightBlue
  })

  const path = searchPath(creep, opts.goal, {
    costMatrix,
    flee: opts.flee,
    plainCost: opts.plainCost,
    swampCost: opts.swampCost
  }).path

  if (opts.flee) {
  } else {
  }
  visual.poly(path, { opacity: 0.2, stroke: colours.black })

  if (!path.length) return

  creep.move(getDirection(path[0].x - creep.x, path[0].y - creep.y))
}
Creep.prototype.drainEnemyContainers = function() {
  const creep = this
  const visual = new Visual()
  
  const enemySpawn = findClosestByRange(creep, findEnemySpawns())
  if (!enemySpawn) return false

  // Find 3 closest containers to enemy spawn
  const containers = getObjectsByPrototype(StructureContainer)
    .sort((a, b) => getRange(a, enemySpawn) - getRange(b, enemySpawn))
    .slice(0, 3)
    .filter(container => container.store.energy > 0)

  if (!containers.length) {
    visual.text("No containers - Suiciding", creep, { font: 0.5, opacity: 0.7,  })
    creep.suicide()
    return true
  }

  const targetContainer = findClosestByRange(creep, containers)

  if (creep.store.getFreeCapacity() > 0) {
    visual.text("Withdrawing", creep, { font: 0.5, opacity: 0.7,  })
    if (getRange(creep, targetContainer) > 1) {
      creep.travel({
        goal: { pos: targetContainer, range: 1 },
        swampCost: 5
      })
    } else {
      creep.withdraw(targetContainer, RESOURCE_ENERGY)
    }
  } else {
    visual.text("Dropping", creep, { font: 0.5, opacity: 0.7,  })
    creep.drop(RESOURCE_ENERGY)
  }
  
  return true
}

/*/