import {isMyRoom} from "@open-screeps/is-my-room";
import {Constants} from "os/core/Constants";
import {SpawnManagerProcess} from "os/processes/room/SpawnManagerProcess";
import {error} from "util";
import {Process} from "../../core/Process";

export class EnergyManagementProcess extends Process {
    public type = "energyManager";

    public metaData: MetaData["energyManager"];

    public run() {
        let spawnManagerProcessName = "spawnManager-" + this.metaData.roomName;

        if (!this.kernel.hasProcess(spawnManagerProcessName)) {
            this.suspend = 1;
        }

        if (!isMyRoom(this.metaData.roomName)) {
            this.completed = true;
            return;
        }

        let spawnManager: SpawnManagerProcess = this.kernel.getProcessByName(spawnManagerProcessName)!;
        let room = Game.rooms[this.metaData.roomName];

        if (!room || !room.controller) {
            return;
        }

        let process = this;
        _.forEach(room.memory.sources, function(source) {

            if (!room || !room.controller) {
                return;
            }

            if (room.controller.level <= 2 && source.isMinedBy.bootstrappers <= Constants.MAX_BOOTSTRAPPERS && source.isMinedBy.bootstrappers <= source.availableSpots) {

                spawnManager.addCreepToSpawnQue({
                    meta: {target: {x: source.x, y: source.y, id: source.id}},
                    parentProcess: process.name,
                    priority: Constants.PRIORITY_MEDIUM,
                    processToCreate: "bootstrapperLifeCycle",
                    type: "bootstrapper"
                });

                room.memory.sources[source.id].isMinedBy.bootstrappers++;

            } else if (room.controller.level > 1 && source.isMinedBy.miners < 1) {

                spawnManager.addCreepToSpawnQue({
                    meta: {target: {x: source.x, y: source.y, id: source.id}},
                    parentProcess: process.name,
                    priority: Constants.PRIORITY_MEDIUM,
                    processToCreate: "minerLifeCycle",
                    type: "miner"
                });

                room.memory.sources[source.id].isMinedBy.miners++;

                // TODO implement miner / hauler combo
            }
        });

        this.queUpgraderIfNeeded(room);
    }

    public getPickUpForHauler(): BasicObjectInfo | boolean {

        let room = Game.rooms[this.metaData.roomName];

        if (!room || !room.controller) {
            return false;
        }

        if (room.controller.level === 1) {
            let targets = room.find(FIND_DROPPED_RESOURCES);
            if (targets.length) {
                return {x: targets[0].pos.x, y: targets[0].pos.y, id: targets[0].id, roomName: room.name};
            } else {
                return false;
            }
        } else {
            return false;
        }

    }

    public getPickUpPoint(): BasicObjectInfo | false {

        let room = Game.rooms[this.metaData.roomName];

        if (!room || !room.controller) {
            return false;
        }

        if (room.energyAvailable <= 250) {
            return false;
        }

        if (room.controller.level === 1) {
            return room.memory.spawns[0];
        }

        // TODO modify for other RCLs
        return room.memory.spawns[0];
    }

    public getDropOffPoint(): BasicObjectInfo | false {
        // TODO if room has storage => direct to storage
        // TODO rcl 2 => place container near spawn and use it as poor man's storage if needed

        let room = Game.rooms[this.metaData.roomName];

        if (!room || !room.controller) {
            return false;
        }

        let dropOff: BasicObjectInfo;

        if (room.controller.level <= 2) {

            let extensions = room.find(FIND_STRUCTURES, {
                filter(s: Structure) {
                    return (s.structureType === STRUCTURE_EXTENSION);
                }
            }) as StructureExtension[];

            let emptyExtensions = _.filter(extensions, function(ext: StructureExtension) {
                return (ext.energy < ext.energyCapacity);
            });

            if (emptyExtensions.length) {
                return {
                    id: emptyExtensions[0].id,
                    roomName: this.metaData.roomName,
                    x: emptyExtensions[0].pos.x,
                    y: emptyExtensions[0].pos.y
                } as BasicObjectInfo;
            }

            dropOff = _.find(room.memory.spawns, function(spawnInfo) {
                let spawn = Game.spawns[spawnInfo.spawnName];
                return (spawn && spawn.energy < spawn.energyCapacity);
            })!;

            if (dropOff) {
                return dropOff;
            }

            return false;
        }

        return false;
    }

    private queUpgraderIfNeeded(room: Room) {
        if (room.controller && room.controller.level > 1 && room.memory.upgraders < 1) {
            let spawnManager = this.kernel.getSpawnManagerForRoom(this.metaData.roomName);

            if (spawnManager) {
                spawnManager.addCreepToSpawnQue({
                    meta: {},
                    parentProcess: this.name,
                    priority: Constants.PRIORITY_HIGH,
                    processToCreate: "upgraderLifeCycle",
                    type: "upgrader"
                });

                room.memory.upgraders++;
            }
        }
    }
}
