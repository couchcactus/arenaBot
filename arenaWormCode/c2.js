import { getObjectsByPrototype, findPath } from "game/utils";
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from "game/constants";
import { StructureContainer, StructureSpawn, Creep, StructureWall } from "game/prototypes";

export function c2(creep) {
  const c1 = global.creepsOfRole.canOpener[0];
  const c2 = global.creepsOfRole.c2[0];
  const c3 = global.creepsOfRole.c3[0];
  const c4 = global.creepsOfRole.c4[0];
  const c5 = global.creepsOfRole.c5[0];
  const c6 = global.creepsOfRole.c6[0];

  creep.becomeCaravan(c1, c2, c3, c4, c5, c6);
}

export function c3(creep) {
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
    const c1 = global.creepsOfRole.canOpener[0];
    const c2 = global.creepsOfRole.c2[0];
    const c3 = global.creepsOfRole.c3[0];
    const c4 = global.creepsOfRole.c4[0];
    const c5 = global.creepsOfRole.c5[0];
    const c6 = global.creepsOfRole.c6[0];
    creep.becomeCaravan(c1, c2, c3, c4, c5, c6);
  }



export function c4(creep) {
  const c1 = global.creepsOfRole.canOpener[0];
  const c2 = global.creepsOfRole.c2[0];
  const c3 = global.creepsOfRole.c3[0];
  const c4 = global.creepsOfRole.c4[0];
  const c5 = global.creepsOfRole.c5[0];
  const c6 = global.creepsOfRole.c6[0];

  creep.becomeCaravan(c1, c2, c3, c4, c5, c6);
}

export function c5(creep) {
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
    const c1 = global.creepsOfRole.canOpener[0];
    const c2 = global.creepsOfRole.c2[0];
    const c3 = global.creepsOfRole.c3[0];
    const c4 = global.creepsOfRole.c4[0];
    const c5 = global.creepsOfRole.c5[0];
    const c6 = global.creepsOfRole.c6[0];
    creep.becomeCaravan(c1, c2, c3, c4, c5, c6);
}

export function c6(creep) {
  const c1 = global.creepsOfRole.canOpener[0];
  const c2 = global.creepsOfRole.c2[0];
  const c3 = global.creepsOfRole.c3[0];
  const c4 = global.creepsOfRole.c4[0];
  const c5 = global.creepsOfRole.c5[0];
  const c6 = global.creepsOfRole.c6[0];

  creep.becomeCaravan(c1, c2, c3, c4, c5, c6);
}
