import { RoomDataSources, SerializedRoomData, SourceObjectInfo, SpawnObjectInfo } from "../../typings";
import { loadavg } from "os";

export class RoomData {
  public sources: RoomDataSources = {};
  public spawns: SpawnObjectInfo[];
  public rcl: number;
  public name: string;
  public builders: number = 0;

  constructor(entry: SerializedRoomData) {
    let roomData = this;
    this.rcl = entry.rcl;

    _.forEach(entry.sources, function(source){
      roomData.sources[source.id] = source;
    });

    this.spawns = entry.spawns;
    this.name = entry.name;
    this.builders = entry.builders;
  }

  public serialize(): SerializedRoomData {

    let allSources: SourceObjectInfo[] = [];

    _.forEach(this.sources, function(source) {
      allSources.push(source);
    });

    return {
      builders: this.builders,
      name: this.name,
      rcl: this.rcl,
      sources: allSources,
      spawns: this.spawns
    };
  }

  public progressSpawns() {
    _.forEach(this.spawns, function(spawn) {
        if (typeof spawn.spawning === "number") {
          spawn.spawning--;
        }

        if (spawn.spawning === 0) {
          spawn.spawning = false;
        }
    });
  }
}
