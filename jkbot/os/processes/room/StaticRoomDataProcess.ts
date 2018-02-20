import {isMyRoom} from "@open-screeps/is-my-room";
import {Process} from "../../core/Process";

export class StaticRoomDataProcess extends Process {

    public type = "staticRoomData";

    public metaData: MetaData["staticRoomData"];

    public run() {
        if (!isMyRoom(this.metaData.roomName)) {
            this.markAsCompleted();
            return;
        }

        // ------------------------------------------------------------------------------------------------------ Setup
        let room = Game.rooms[this.metaData.roomName];
        room.memory.sources = {};
        room.memory.spawns = [];
        let process = this;
        let origin = new RoomPosition(25, 25, this.metaData.roomName);

        // ------------------------------------------------------------------------------------ Getting spawns for room
        let spawns = Game.spawns;
        _.forEach(spawns, function(spawn: StructureSpawn) {

            if (spawn.room.name !== process.metaData.roomName) {
                return;
            }

            origin = spawn.pos;

            room.memory.spawns.push({
                id: spawn.id,
                roomName: process.metaData.roomName,
                spawnName: spawn.name,
                spawning: 0,
                x: spawn.pos.x,
                y: spawn.pos.y
            });
        });

        // ------------------------------------------------------------------------------- Getting source info for room
        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, function(source: Source) {

            let availableSpots = 0;
            let sourceArea = room.lookAtArea(source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);

            _.forEach(sourceArea, function(spot) {
                if (spot.type === "terrain" && spot.terrain !== "wall") {
                    availableSpots++;
                }
            });

            let optimalMiningSpot = PathFinder.search(origin, {pos: source.pos, range: 1}).path.pop();

            if (!optimalMiningSpot) {

                optimalMiningSpot = new RoomPosition(source.pos.x, source.pos.y, process.metaData.roomName);
            }

            room.memory.sources[source.id] = {
                availableSpots,
                id: source.id,
                isMinedBy: {
                    bootstrappers: 0,
                    haulers: 0,
                    miners: 0
                },
                optimalSpot: {x: optimalMiningSpot.x, y: optimalMiningSpot.y},
                roomName: process.metaData.roomName,
                x: source.pos.x,
                y: source.pos.y
            };
        });

        room.memory.builders = 0;
        room.memory.upgraders = 0

        this.markAsCompleted();
    }
}
