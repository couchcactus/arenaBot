import { getObjectsByPrototype, findPath } from "game/utils";
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from "game/constants";
import { StructureContainer, StructureSpawn, Creep, StructureWall } from "game/prototypes";

export function canOpener(creep) {
    const my_spawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    let side = my_spawn.x == 5 ? 'left' : 'right';

    let wall_close = getObjectsByPrototype(StructureWall).find(s => 
        s.id == (side == 'left' ? '6' : '25')
    );

    if (wall_close) { 
        if (creep.attack(wall_close) == ERR_NOT_IN_RANGE) { 
            creep.moveTo(wall_close);
        }
        return;
    }

    let wall_far = getObjectsByPrototype(StructureWall).find(s => 
        s.id == (side == 'left' ? '10' : '21')
    );

    if (wall_far) { 
        if (creep.attack(wall_far) == ERR_NOT_IN_RANGE) { 
            creep.moveTo(wall_far);
        }
        return;
    }

    if (!creep.partner) {
        const availableDuo2 = global.creepsOfRole.duo2.find(d => !d.partner);
        if (availableDuo2) {
            creep.partner = availableDuo2;  
            availableDuo2.partner = creep;  
        }
    }

    if (creep.partner) {
        creep.becomeDuo(creep, creep.partner);
    }
}
