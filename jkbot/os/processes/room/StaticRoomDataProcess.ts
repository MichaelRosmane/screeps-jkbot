import {MetaData, SerializedRoomData} from "../../../typings";
import {Process} from "../../core/Process";
import {RoomData} from "../../core/RoomData";
import {MemoryManagerProcess} from "../system/MemoryManagerProcess";

export class StaticRoomDataProcess extends Process {

    public type = "staticRoomData";

    public metaData: MetaData["staticRoomData"];

    public run() {
        // ---------------------------------------------------------------------------------------------------------- Setup
        let data = {} as SerializedRoomData;
        let room = Game.rooms[this.metaData.roomName];
        let process = this;

        data.sources = [];
        data.spawns = [];
        data.rcl = 1;

        // ----------------------------------------------------------------------------------- Getting source info for room
        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, function(source: Source) {

            data.sources.push({
                id: source.id,
                isMinedBy: {
                    harvesters: 0,
                    haulers: 0,
                    miners: 0
                },
                roomName: process.metaData.roomName,
                x: source.pos.x,
                y: source.pos.y
            });
        });

        // ---------------------------------------------------------------------------------------- Getting spawns for room
        let spawns = Game.spawns;
        _.forEach(spawns, function(spawn: StructureSpawn) {

            if (spawn.room.name !== process.metaData.roomName) {
                return;
            }

            data.spawns.push({
                id: spawn.id,
                roomName: process.metaData.roomName,
                spawnName: spawn.name,
                spawning: false,
                x: spawn.pos.x,
                y: spawn.pos.y
            });
        });

        // TODO get available spots at source for planning purposes

        this.kernel.addRoomData(this.metaData.roomName, data.sources, data.spawns, data.rcl);
        this.completed = true;
    }
}
