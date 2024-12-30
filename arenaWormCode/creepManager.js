import { roles } from "./constants"
import { hauler } from "./hauler"
import { rangedAttacker } from "./rangedAttacker"
import { extractor } from "./extractor"
import { drainer} from  "./drainer"

import { canOpener } from "./canOpener"
import { c2 } from "./c2" 
import { c3 } from "./c2" 
import { c4 } from "./c2" 
import { c5 } from "./c2" 
import { c6 } from "./c2" 

const roleHandlers = {
  hauler,
  rangedAttacker,
  extractor,
  drainer,
  canOpener,
  c2,
  c3,
  c4,
  c5,
  c6,
}

export function creepManager() {
  for (const role of roles) {
    const creeps = global.creepsOfRole[role]

    for (const creep of creeps) {
      roleHandlers[creep.role](creep)
    }
  }
}
