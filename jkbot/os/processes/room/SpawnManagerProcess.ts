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
        let room = Game.rooms[this.metaData.roomName];

        // -------------------------------------------------------------------------- Check if a spawn is available for use
        let availableSpawns = _.filter(room.memory.spawns, function(spawn) {
            return (spawn.spawning === 0);
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
        this.metaData.spawnQue = _.sortBy(this.metaData.spawnQue, "priority");

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
        // ------------------------------------------------------------------------------------------------------ Setup
        let room = Game.rooms[this.metaData.roomName];
        let name = creep.type + "-" + Game.time;

        let baseMemory = {
            intendedToMove: false,
            nextAction: "",
            previousPosition: {x: 0, y: 0},
            stuck: 0
        } as CreepMemory;

        let creepConfig = SpawnHelper.generateCreepFromBaseType(creep.type, room.energyAvailable);

        // -------------------------------------------------------------------- Trying to spawn creep & handling result
        let result = Game.spawns[spawn.spawnName].spawnCreep(creepConfig.parts, name, {memory: baseMemory});

        if (result === OK) {
            let index = _.findIndex(room.memory.spawns, function(entry) {
                return entry.spawnName === spawn.spawnName;
            });
            room.memory.spawns[index].spawning = creepConfig.spawnTime + 1;

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
        }

        return false;
    }
}
