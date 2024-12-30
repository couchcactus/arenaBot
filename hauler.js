/*/
import { getObjectsByPrototype, findPath } from "game/utils";
import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from "game/constants";
import { StructureContainer, StructureSpawn, Creep, StructureWall } from "game/prototypes";

export function hauler(creep) {
  const spawn = getObjectsByPrototype(StructureSpawn).find(spawn => spawn.my);
  const allContainers = getObjectsByPrototype(StructureContainer);
  const walls = getObjectsByPrototype(StructureWall);
  const validContainers = allContainers.filter(container => {
    const path = findPath(creep, container, {
      maxOps: 1000,
      swampCost: 5,
      plainCost: 2,
      costMatrix: {
        get: (x, y) => {
          return walls.some(wall => wall.x === x && wall.y === y) ? 255 : 0;
        },
        set: () => {},
        clone: function() { return this; }
      }
    });
    return path && path.length > 0;
  });

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn, {
          costMatrix: {
            get: (x, y) => {
              return walls.some(wall => wall.x === x && wall.y === y) ? 255 : 0;
            },
            set: () => {},
            clone: function() { return this; }
          }
        });
      }
    }
    return;
  }

  const accessibleContainers = validContainers.filter(container => 
    container.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  );

  if (accessibleContainers.length > 0) {
    const closestContainer = accessibleContainers.reduce((closest, container) => {
      const path = findPath(creep, container, {
        maxOps: 1000,
        swampCost: 5,
        plainCost: 2,
        costMatrix: {
          get: (x, y) => {
            return walls.some(wall => wall.x === x && wall.y === y) ? 255 : 0;
          },
          set: () => {},
          clone: function() { return this; }
        }
      });
      const distance = path ? path.length : Infinity;
      return (!closest || distance < creep.getRangeTo(closest)) ? container : closest;
    });

    if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(closestContainer, {
        costMatrix: {
          get: (x, y) => {
            return walls.some(wall => wall.x === x && wall.y === y) ? 255 : 0;
          },
          set: () => {},
          clone: function() { return this; }
        }
      });
    }
  }
} /*/
  import { ERR_NOT_IN_RANGE, RESOURCE_ENERGY, TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT } from "game/constants";
  import { StructureContainer, StructureSpawn, Creep, StructureWall, StructureExtension } from "game/prototypes";
  import { getObjectsByPrototype, findInRange, getRange } from "game/utils";

  export function hauler(creep) {
    if (!creep || creep.exists === false) return;

    const my_spawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    if (!my_spawn) return;

    const side = my_spawn.x == 5 ? 'left' : 'right';
    const walls = getObjectsByPrototype(StructureWall);

    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
      if (my_spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        if (creep.transfer(my_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(my_spawn);
        }
      }
      return;
    }

    let cont_open_close, cont_closed_close, cont_open_far, cont_closed_far;
    
    if (side == 'left') {
      cont_open_close = getObjectsByPrototype(StructureContainer).find(s => s.id == '1')
      cont_closed_close = getObjectsByPrototype(StructureContainer).find(s => s.id == '3')
      cont_open_far = getObjectsByPrototype(StructureContainer).find(s => s.id == '15')
      cont_closed_far = getObjectsByPrototype(StructureContainer).find(s => s.id == '13')
    } else {
      cont_open_close = getObjectsByPrototype(StructureContainer).find(s => s.id == '30')
      cont_closed_close = getObjectsByPrototype(StructureContainer).find(s => s.id == '28')
      cont_open_far = getObjectsByPrototype(StructureContainer).find(s => s.id == '16')
      cont_closed_far = getObjectsByPrototype(StructureContainer).find(s => s.id == '18')
    }

    let target;
    if (cont_open_close.store.getUsedCapacity() > 0) { target = cont_open_close }
    else if (cont_closed_close.store.getUsedCapacity() > 0 &&
      findInRange(cont_closed_close, walls, 1).length <= 4) { target = cont_closed_close }
    else if (cont_open_far.store.getUsedCapacity() > 0) { target = cont_open_far }
    else if (cont_closed_far.store.getUsedCapacity() > 0 &&
      findInRange(cont_closed_far, walls, 1).length <= 4) { target = cont_closed_far }
    
    if (!target) {
      const allExtensions = getObjectsByPrototype(StructureExtension).filter(e => e.my && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
      const allContainers = getObjectsByPrototype(StructureContainer);
      const accessibleContainers = allContainers.filter(container => 
        container.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      );
      
      if (accessibleContainers.length > 0) {
        if (creep.store.getUsedCapacity() > 0 && allExtensions.length > 0) {
          const closestExtension = allExtensions.reduce((closest, extension) => {
            return getRange(creep, extension) < getRange(creep, closest) ? extension : closest;
          });
          if (creep.transfer(closestExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestExtension);
          }
        } else {
          const closestContainer = accessibleContainers.reduce((closest, container) => {
            return getRange(creep, container) < getRange(creep, closest) ? container : closest;
          });
          if (creep.withdraw(closestContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestContainer);
          }
        }
      }
    }    if (!target) { console.log("NO VALID CONTAINERS OR EXTENSIONS!"); return }
    if (side == 'left') {
      if (target.id == '1') {
        if (creep.x == 4 && creep.y == 44) { creep.transfer(my_spawn, RESOURCE_ENERGY); creep.move(LEFT); return }
        if (creep.x == 3 && creep.y == 44) { creep.move(LEFT); return }
        if (creep.x == 2 && creep.y == 44) { creep.withdraw(target, RESOURCE_ENERGY); creep.move(TOP_RIGHT); return }
        if (creep.x == 3 && creep.y == 43) { creep.move(BOTTOM_RIGHT); return }
        
        if (creep.store.getUsedCapacity() > 0) {
          if (getRange(creep, my_spawn) > 1) { creep.moveTo(my_spawn) }
          else { creep.transfer(my_spawn, RESOURCE_ENERGY) }
        }
        else { creep.moveTo({ x: 4, y: 44 }) }
      } else if (target.id == '3') {
        if (creep.x == 4 && creep.y == 45) { creep.transfer(my_spawn, RESOURCE_ENERGY); creep.move(BOTTOM_LEFT); return }
        if (creep.x == 3 && creep.y == 46) { creep.move(LEFT); return }
        if (creep.x == 2 && creep.y == 46) { creep.withdraw(target, RESOURCE_ENERGY); creep.move(TOP_RIGHT); return }
        if (creep.x == 3 && creep.y == 45) { creep.move(RIGHT); return }
        
        if (creep.store.getUsedCapacity() > 0) {
          if (getRange(creep, my_spawn) > 1) { creep.moveTo(my_spawn) }
          else { creep.transfer(my_spawn, RESOURCE_ENERGY) }
        }
        else { creep.moveTo({ x: 4, y: 45 }) }
      } else if (target.id == '15') {
        if (creep.x == 6 && creep.y == 46) { creep.transfer(my_spawn, RESOURCE_ENERGY); creep.move(RIGHT); return }
        if (creep.x == 7 && creep.y == 46) { creep.move(RIGHT); return }
        if (creep.x == 8 && creep.y == 46) { creep.move(RIGHT); return }
        if (creep.x == 9 && creep.y == 46) { creep.move(RIGHT); return }
        if (creep.x == 10 && creep.y == 46) { creep.move(RIGHT); return }
        if (creep.x == 11 && creep.y == 46) { creep.withdraw(target, RESOURCE_ENERGY); creep.move(BOTTOM_LEFT); return }
        if (creep.x == 10 && creep.y == 47) { creep.move(LEFT); return }
        if (creep.x == 9 && creep.y == 47) { creep.move(LEFT); return }
        if (creep.x == 8 && creep.y == 47) { creep.move(LEFT); return }
        if (creep.x == 7 && creep.y == 47) { creep.move(TOP_LEFT); return }
        
        if (creep.store.getUsedCapacity() > 0) {
          if (getRange(creep, my_spawn) > 1) { creep.moveTo(my_spawn) }
          else { creep.transfer(my_spawn, RESOURCE_ENERGY) }
        }
        else { creep.moveTo({ x: 6, y: 46 }) }
      } else {
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    } else {
      if (target.id == '30') {
        if (creep.x == 95 && creep.y == 55) { creep.transfer(my_spawn, RESOURCE_ENERGY); creep.move(RIGHT); return }
        if (creep.x == 96 && creep.y == 55) { creep.move(RIGHT); return }
        if (creep.x == 97 && creep.y == 55) { creep.withdraw(target, RESOURCE_ENERGY); creep.move(BOTTOM_LEFT); return }
        if (creep.x == 96 && creep.y == 56) { creep.move(TOP_LEFT); return }
        
        if (creep.store.getUsedCapacity() > 0) {
          if (getRange(creep, my_spawn) > 1) { creep.moveTo(my_spawn) }
          else { creep.transfer(my_spawn, RESOURCE_ENERGY) }
        }
        else { creep.moveTo({ x: 95, y: 55 }) }
      } else if (target.id == '28') {
        if (creep.x == 95 && creep.y == 54) { creep.transfer(my_spawn, RESOURCE_ENERGY); creep.move(TOP_RIGHT); return }
        if (creep.x == 96 && creep.y == 53) { creep.move(RIGHT); return }
        if (creep.x == 97 && creep.y == 53) { creep.withdraw(target, RESOURCE_ENERGY); creep.move(BOTTOM_LEFT); return }
        if (creep.x == 96 && creep.y == 54) { creep.move(LEFT); return }
        
        if (creep.store.getUsedCapacity() > 0) {
          if (getRange(creep, my_spawn) > 1) { creep.moveTo(my_spawn) }
          else { creep.transfer(my_spawn, RESOURCE_ENERGY) }
        }
        else { creep.moveTo({ x: 95, y: 54 }) }
      } else if (target.id == '16') {
        if (creep.x == 93 && creep.y == 53) { creep.transfer(my_spawn, RESOURCE_ENERGY); creep.move(LEFT); return }
        if (creep.x == 92 && creep.y == 53) { creep.move(LEFT); return }
        if (creep.x == 91 && creep.y == 53) { creep.move(LEFT); return }
        if (creep.x == 90 && creep.y == 53) { creep.move(LEFT); return }
        if (creep.x == 89 && creep.y == 53) { creep.move(LEFT); return }
        if (creep.x == 88 && creep.y == 53) { creep.withdraw(target, RESOURCE_ENERGY); creep.move(TOP_RIGHT); return }
        if (creep.x == 89 && creep.y == 52) { creep.move(RIGHT); return }
        if (creep.x == 90 && creep.y == 52) { creep.move(RIGHT); return }
        if (creep.x == 91 && creep.y == 52) { creep.move(RIGHT); return }
        if (creep.x == 92 && creep.y == 52) { creep.move(BOTTOM_RIGHT); return }
        
        if (creep.store.getUsedCapacity() > 0) {
          if (getRange(creep, my_spawn) > 1) { creep.moveTo(my_spawn) }
          else { creep.transfer(my_spawn, RESOURCE_ENERGY) }
        }
        else { creep.moveTo({ x: 93, y: 53 }) }
      } else {
        if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
        }
      }
    }
  }