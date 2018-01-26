import { Constants } from "os/core/Constants";
import { SpawnManagerProcess } from "os/processes/room/SpawnManagerProcess";
import { BasicObjectInfo, MetaData } from "typings";
import { Process } from "../../core/Process";

export class EnergyManagementProcess extends Process {
  public type = "energyManager";

  public metaData: MetaData["energyManager"];

  public run() {
    let spawnManagerProcessName = "spawnManager-" + this.metaData.roomName;

    if (!this.roomData) {
      this.roomData = this.getRoomData(this.metaData.roomName);
    }

    if (!this.kernel.hasProcess(spawnManagerProcessName)) {
      this.suspend = 1;
    }

    let spawnManager: SpawnManagerProcess = this.kernel.getProcessByName(spawnManagerProcessName)!;

    let process = this;
    _.forEach(this.roomData.sources, function(source) {

      if (!process.roomData) {
        process.roomData = process.getRoomData(process.metaData.roomName);
      }

      // TODO check rcl => 1 only harvester, 2 => also miner, 3 => ...

      if (source.isMinedBy.harvesters < 2) {
        spawnManager.addCreepToSpawnQue({
          meta: {target: {x: source.x, y: source.y, id: source.id}},
          parentProcess: process.name,
          priority: Constants.PRIORITY_MEDIUM,
          processToCreate: "harvesterLifeCycle",
          type: "harvester"
        });

        process.roomData.sources[source.id].isMinedBy.harvesters++;

        return false;
      } else {
        return;
      }

    });
  }

  public getPickUpPoint(): BasicObjectInfo | boolean {

    let room = Game.rooms[this.metaData.roomName];

    if (!this.roomData) {
      this.roomData = this.getRoomData(this.metaData.roomName);
    }

    if (room.energyAvailable <= 250) {
      return false;
    }

    if (this.roomData.rcl === 1) {
      return this.roomData.spawns[0];
    }

    // TODO modify for other RCLs
    return this.roomData.spawns[0];
  }

  public getDropOffPoint(): BasicObjectInfo | boolean {
    // TODO if room has storage => direct to storage
    // TODO rcl 2 => place container near spawn and use it as poor man's storage if needed

    // are their spawns without energy?

    if (!this.roomData) {
      this.roomData = this.getRoomData(this.metaData.roomName);
    }

    let dropOff: BasicObjectInfo;

    if (this.roomData.rcl <= 3)  {

      dropOff = _.find(this.roomData.spawns, function(spawnInfo) {
        let spawn = Game.spawns[spawnInfo.spawnName];
        return (spawn && spawn.energy < spawn.energyCapacity);
      })!;

      if (dropOff) {
        return dropOff;
      }
    }

    return false;
  }
}
