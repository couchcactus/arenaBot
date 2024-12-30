import { getObjectsByPrototype } from "game"
import { Creep } from "game/prototypes"
import { roles } from "./constants"

export function creepOrganizer() {
  global.creepsOfRole = {}
  for (const role of roles) global.creepsOfRole[role] = []

  const allCreeps = getObjectsByPrototype(Creep)

  for (const creepName in allCreeps) {
    const creep = allCreeps[creepName]

    if (!creep.my) continue
    if (!creep.role) continue

    global.creepsOfRole[creep.role].push(creep)
  }
}