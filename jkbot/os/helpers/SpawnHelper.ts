import { CreepConfig, CreepTypes } from "typings";

export class SpawnHelper {

  private static maxParts = 50;

  private static types: CreepTypes = {
    builder: {
      base: [WORK, CARRY, MOVE, MOVE],
      baseCost: 250,
      extension: [WORK, WORK, CARRY, MOVE, MOVE, MOVE],
      extensionCost: 400
    },
    harvester: {
      base: [WORK, CARRY, MOVE],
      baseCost: 200,
      extension: [CARRY, MOVE],
      extensionCost: 100
    }
  };

  public static generateCreepFromBaseType(typeToUse: string, energyAvailable: number) {
    let type = this.types[typeToUse];

    let parts = type.base;
    let cost = type.baseCost;

    if (cost < energyAvailable && type.extension && type.extensionCost && type.maxExtensionCount) {

      let extensionCount = 0;

      while (cost + type.extensionCost && parts.length <= this.maxParts && extensionCount <= type.maxExtensionCount) {
        parts.push(...type.extension);
        cost += type.extensionCost;
        extensionCount++;
      }
    }

    let spawnTime = parts.length * 3;

    return {parts, cost, spawnTime} as CreepConfig;
  }
}
