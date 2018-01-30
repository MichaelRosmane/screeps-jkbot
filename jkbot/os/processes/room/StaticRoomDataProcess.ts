import {Process} from "../../core/Process";

export class StaticRoomDataProcess extends Process {

    public type = "staticRoomData";

    public metaData: MetaData["staticRoomData"];

    public run() {
        // ------------------------------------------------------------------------------------------------------ Setup
        let room = Game.rooms[this.metaData.roomName];
        let process = this;

        // ------------------------------------------------------------------------------- Getting source info for room
        let sources = room.find(FIND_SOURCES);
        _.forEach(sources, function(source: Source) {

            // TODO get available spots at source for planning purposes

            room.memory.sources[source.id] = {
                id: source.id,
                isMinedBy: {
                    harvesters: 0,
                    haulers: 0,
                    miners: 0
                },
                roomName: process.metaData.roomName,
                x: source.pos.x,
                y: source.pos.y
            };
        });

        // ------------------------------------------------------------------------------------ Getting spawns for room
        let spawns = Game.spawns;
        _.forEach(spawns, function(spawn: StructureSpawn) {

            if (spawn.room.name !== process.metaData.roomName) {
                return;
            }

            room.memory.spawns.push({
                id: spawn.id,
                roomName: process.metaData.roomName,
                spawnName: spawn.name,
                spawning: 0,
                x: spawn.pos.x,
                y: spawn.pos.y
            });
        });

        room.memory.builders = 0;

        this.completed = true;
    }
}
