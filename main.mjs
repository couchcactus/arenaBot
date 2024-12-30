import { getCpuTime } from "game"
import { Creep } from "game/prototypes"
import { creepManager } from "./creepManager"
import { creepOrganizer } from "./creepOrganizer"
import { spawnManager } from "./spawnManager"

global.supporterOffers = []

export function loop() {
  global.creepsOfRole = {}
  delete global.attackerCM
  delete global.enemyAttackers
  delete global.enemySpawns
  delete global.squadCenter

  creepOrganizer()

  creepManager()

  spawnManager()

  console.log("CPU: " + (getCpuTime() / 1000000).toFixed(2) + " / " + 50)
}
