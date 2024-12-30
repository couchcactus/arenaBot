import "./creepFunctions"

export function caravanRanger(creep) {
  creep.advancedHeal()

  if (creep.attackEnemyAttackers()) return

  // if (creep.attackEnemySpawns()) return 
}
