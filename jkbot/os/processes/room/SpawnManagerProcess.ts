import {Constants} from "os/core/Constants";
import {SpawnHelper} from "os/helpers/SpawnHelper";
import {Process} from "../../core/Process";

export class SpawnManagerProcess extends Process {

    public type = "spawnManager";

    public metaData: MetaData["spawnManager"];

    /**
     * Triggers this processes main functions
     */
    public run() {
        // ------------------------------------------------------------------------------ check if there's a creep to spawn
        if (!this.metaData.spawnQue.length) {
            return;
        }

        // ---------------------------------------------------------------------------------------------------------- Setup
        if (!this.roomData) {
            this.roomData = this.getRoomData(this.metaData.roomName);
        }

        // -------------------------------------------------------------------------- Check if a spawn is available for use
        let availableSpawns = _.filter(this.roomData.spawns, function(spawn) {
            return (spawn.spawning === false);
        });

        this.log("available spawns: " + availableSpawns.length);

        // ------------------------------------- if a spawn is available, get highest prioriy creep and attempt to spawn it
        if (availableSpawns.length) {
            let spawnToUse = availableSpawns[0];
            let creepToSpawn = this.getHighestPriorityCreepToSpawn();
            if (!this.spawnCreep(spawnToUse, creepToSpawn)) {
                this.addCreepToSpawnQue(creepToSpawn);
            }
        }
    }

    /**
     * Adds a new creep to the que
     *
     * @param {CreepToSpawn} creep
     */
    public addCreepToSpawnQue(creep: CreepToSpawn) {
        this.metaData.spawnQue.push(creep);
    }

    /**
     * Gets the highest priority creep from the que
     *
     * @returns {CreepToSpawn}
     */
    private getHighestPriorityCreepToSpawn(): CreepToSpawn {
        let sorted = _.sortBy(this.metaData.spawnQue, "priority");

        this.metaData.spawnQue = sorted;

        return this.metaData.spawnQue.shift()!;
    }

    /**
     * Tries to spawn the creep in the given spawn
     *
     * @param {SpawnObjectInfo} spawn
     * @param {CreepToSpawn} creep
     *
     * @returns {boolean}
     */
    private spawnCreep(spawn: SpawnObjectInfo, creep: CreepToSpawn) {
        // ---------------------------------------------------------------------------------------------------------- Setup
        let room = Game.rooms[this.metaData.roomName];
        let name = creep.type + "-" + Game.time;

        if (!this.roomData) {
            this.roomData = this.getRoomData(this.metaData.roomName);
        }

        let creepConfig = SpawnHelper.generateCreepFromBaseType(creep.type, room.energyAvailable);

        // ------------------------------------------------------------------------ Trying to spawn creep & handling result
        let result = Game.spawns[spawn.spawnName].spawnCreep(creepConfig.parts, name);

        this.log("spawn attempt result: " + result);
        this.log("name: " + name);
        this.log("parts: " + creepConfig.parts);
        this.log("energy avaialble: " + room.energyAvailable);

        if (result === OK) {
            let index = _.findIndex(this.roomData.spawns, function(entry) {
                return entry.spawnName === spawn.spawnName;
            });
            this.roomData.spawns[index].spawning = creepConfig.spawnTime + 1;

            this.kernel.addProcess(
                creep.processToCreate,
                creep.processToCreate + "-" + name,
                Constants.PRIORITY_MEDIUM,
                {
                    creepName: name,
                    roomName: this.metaData.roomName,
                    target: creep.meta.target
                },
                creep.parentProcess
            );

            return true;

        } else if (result === ERR_NOT_ENOUGH_ENERGY) {
            this.suspend = 2;
        }

        return false;
    }
}
