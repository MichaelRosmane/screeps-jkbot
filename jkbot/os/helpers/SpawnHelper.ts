export class SpawnHelper {

    private static maxParts = 50;

    private static types: CreepTypes = {
        bootstrap: {
            base: [WORK, CARRY, MOVE, MOVE],
            baseCost: 250
        },
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
            extensionCost: 100,
            maxExtensionCount: 2
        },
        hauler: {
            base: [CARRY, MOVE],
            baseCost: 100,
            extension: [CARRY, MOVE],
            extensionCost: 100,
            maxExtensionCount: 19
        },
        miner: {
            base: [WORK, CARRY, MOVE],
            baseCost: 200,
            extension: [MOVE, WORK],
            extensionCost: 150,
            maxExtensionCount: 5
        }
    };

    public static generateCreepFromBaseType(typeToUse: string, energyAvailable: number) {
        let type = this.types[typeToUse];

        let parts = type.base;
        let cost = type.baseCost;
        let extensionCount = 0;

        if (cost < energyAvailable && type.extension && type.extensionCost && type.maxExtensionCount) {

            while ((cost + type.extensionCost <= energyAvailable) && (parts.length <= this.maxParts) && (extensionCount <= type.maxExtensionCount)) {
                parts.push(...type.extension);
                cost += type.extensionCost;
                extensionCount++;
            }
        }

        let spawnTime = parts.length * 3;

        return {parts, cost, spawnTime} as CreepConfig;
    }
}
