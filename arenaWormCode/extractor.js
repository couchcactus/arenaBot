import { getObjectsByPrototype, createConstructionSite, getRange, findInRange, getObjects, getTerrainAt } from 'game/utils';
import * as C from 'game/constants';
import { Creep, StructureSpawn, StructureContainer, StructureRoad, StructureExtension, StructureRampart, ConstructionSite, StructureTower } from 'game/prototypes';
import { CARRY, MOVE, RANGED_ATTACK, HEAL, WORK, ATTACK } from "game/constants";
import * as U from 'game/utils'
import * as P from 'game/prototypes'
import * as F from 'game/path-finder'

export function extractor(creep){
    const spawn = U.getObjectsByPrototype(P.StructureSpawn).find(spawn => spawn.my)
    const enemy_spawn = U.getObjectsByPrototype(P.StructureSpawn).find(spawn => !spawn.my)
    const creeps = U.getObjectsByPrototype(P.Creep)
    let full_containers = U.getObjectsByPrototype(P.StructureContainer).filter(c => (c.store['energy'] > 0))
    let available_containers = full_containers.filter(c => U.getRange(spawn, c) > 10 && U.getRange(enemy_spawn, c) > 20)
    let good_containers = available_containers.filter(c => !creeps.some(crep => U.getRange(creep, crep) != 0 && U.getRange(crep, c) < 2))

    const ramparts = U.getObjectsByPrototype(P.StructureRampart)
    const container = creep.findClosestByPath(good_containers)
    const constructions = U.getObjectsByPrototype(P.ConstructionSite)
    if (ramparts.some(r => U.getRange(creep, r) == 0)) {
        if (container && container.store.getUsedCapacity() > 0 && U.getRange(creep, container) <= 1) {
            if (creep.store.getUsedCapacity() > 0) { creep.drop(C.RESOURCE_ENERGY) }
            else { creep.withdraw(container, C.RESOURCE_ENERGY) }
            return
        } else {
            const pile = U.findInRange(creep, U.getObjectsByPrototype(P.Resource), 1)[0]
            if (pile) { if (creep.store.getUsedCapacity() == 0) { creep.pickup(pile); return } }
            else { creep.moveTo(container); return }
        }
    } else {
        if (!container) { return }

        if (U.getRange(creep, container) > 1) { creep.moveTo(container); return }

        if (!ramparts.some(r => U.getRange(creep, r) == 0)) {
            if (!constructions.some(c => U.getRange(creep, c) == 0)) {
                U.createConstructionSite(creep, P.StructureRampart)
            }

            const target_construction = constructions.find(c => U.getRange(creep, c) == 0)
            if (creep.store[C.RESOURCE_ENERGY] > 0) { creep.build(target_construction) }
            else { creep.withdraw(container, C.RESOURCE_ENERGY) }

            return
        }
    }
    const empty_extensions = U.getObjectsByPrototype(P.StructureExtension).filter(e => e.store['energy'] < C.EXTENSION_ENERGY_CAPACITY)
    const extensions_in_range = U.findInRange(creep, empty_extensions, 1)
    if (extensions_in_range.length > 0) {
        if (creep.store[C.RESOURCE_ENERGY] > 0) {
            creep.transfer(extensions_in_range[0], C.RESOURCE_ENERGY)
        } else {
            creep.withdraw(container, C.RESOURCE_ENERGY)
        }
    } else {
        let count = 0
        if (!constructions.some(c => U.getRange(creep, c) == 1)) {
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (U.findInRange({ x: creep.x + x, y: creep.y + y }, U.getObjects(), 0).length == 0 && U.getTerrainAt({ x: creep.x + x, y: creep.y + y }) != C.TERRAIN_WALL) {
                        U.createConstructionSite({ x: creep.x + x, y: creep.y + y }, P.StructureExtension)
                        return
                    } else {
                        count += 1
                    }
                }
            }
            if (count >= 9) { return }
        }

        const target_construction = constructions.find(c => U.getRange(creep, c) == 1)
        if (creep.store[C.RESOURCE_ENERGY] > 0) {
            creep.build(target_construction)
        } else {
            creep.withdraw(container, C.RESOURCE_ENERGY)
        }
    }
}