import "./creepFunctions"
import { RANGED_ATTACK } from "game/constants"

export function rangedAttacker(creep) {
  creep.advancedHeal()
  
    creep.attackEnemyAttackers()

  //if (creep.attackEnemySpawns()) return 
}
