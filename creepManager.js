import { roles } from "./constants"
import { hauler } from "./hauler"
import { rangedAttacker } from "./rangedAttacker"
import { extractor } from "./extractor"
import { drainer} from  "./drainer"
import { caravanLeader } from "./caravanleader"
import { caravanHealer } from "./caravanHealer"
import { caravanRanger } from "./caravanRanger"
import { canOpener } from "./canOpener"
import { duo2 } from "./duo2" 

const roleHandlers = {
  hauler,
  rangedAttacker,
  extractor,
  drainer,
  caravanLeader,
  caravanHealer,
  caravanRanger,
  canOpener,
  duo2,
}

export function creepManager() {
  for (const role of roles) {
    const creeps = global.creepsOfRole[role]

    for (const creep of creeps) {
      roleHandlers[creep.role](creep)
    }
  }
}
