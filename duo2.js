export function duo2(creep) {
  if (!creep.partner) {
      const availableCanOpener = global.creepsOfRole.canOpener.find(c => !c.partner);
      if (availableCanOpener) {
          creep.partner = availableCanOpener;
          availableCanOpener.partner = creep;
      }
  }

  if (creep.partner) {
      creep.becomeDuo(creep.partner, creep);
  }
}
