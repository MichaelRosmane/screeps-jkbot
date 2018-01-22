import { MetaData } from "typings";
import { Constants } from "../../core/Constants";
import { Process } from "../../core/Process";
import { MemoryManagerProcess } from "../system/MemoryManagerProcess";

export class RoomSupervisorProcess extends Process {
  public type = "roomSupervisor";

  public metaData: MetaData["roomSupervisor"];

  public run() {

    let room = Game.rooms[this.metaData.roomName];
    let roomData = this.getRoomData(this.metaData.roomName);

    if (room && roomData && room.controller) {
      roomData.rcl = room.controller.level;
    }

    // --------------------------------------------------------------------------------- generating room data processes
    if (!this.kernel.hasRoomData(this.metaData.roomName)) {
      this.spawnChildProcess(
        "staticRoomData",
        "staticRoomData-" + this.metaData.roomName,
        Constants.PRIORITY_HIGHEST,
        {roomName: this.metaData.roomName},
        false
      );
    }

    // --------------------------------------------------------------------------- Spawn child process - energy manager
    let energyManagerName = "energyManager-" + this.metaData.roomName;
    if (!this.kernel.hasProcess(energyManagerName)) {
      this.spawnChildProcess(
        "energyManager",
        energyManagerName,
        Constants.PRIORITY_HIGH,
        {roomName: this.metaData.roomName},
        false
      );
    }

    // ---------------------------------------------------------------------------- Spawn child process - spawn manager
    let spawnManagerName = "spawnManager-" + this.metaData.roomName;
    if (!this.kernel.hasProcess(spawnManagerName)) {
      this.spawnChildProcess(
        "spawnManager",
        spawnManagerName,
        Constants.PRIORITY_HIGH,
        {roomName: this.metaData.roomName, spawnQue: []},
        false
      );
    }

    // --------------------------------------------------------------------- Spawn child process - construction manager
    let constructionManagerName = "constructionManager-" + this.metaData.roomName;
    if (!this.kernel.hasProcess(constructionManagerName)) {
      this.spawnChildProcess(
        "constructionManager",
        constructionManagerName,
        Constants.PRIORITY_HIGH,
        {roomName: this.metaData.roomName},
        false
      );
    }

  }
}
