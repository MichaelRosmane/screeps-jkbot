import { Constants } from "../../core/Constants";
import { Process } from "../../core/Process";

// TODO
export class InitProcess extends Process {
  public metaData: any;

  public type = "init";

  public run() {
    let process = this;

    // -------------------------------------------------------------------------------------- Bootstrap other processes
    this.kernel.addProcess(
      "memoryManager",
      "memoryManager",
      Constants.PRIORITY_FIRST,
      {}
    );

    // --------------------------------------------------------------------------- Add supervisor process for each room
    _.forEach(Game.rooms, function(room: Room) {
      let processName = "roomSupervisor-" + room.name;

      if (!room.controller || !room.controller.my) {
        return;
      }

      if (!process.kernel.hasProcess(processName)) {
        process.kernel.addProcess(
          "roomSupervisor",
          processName,
          Constants.PRIORITY_HIGHEST,
          {
            roomName: room.name
          }
        );
      }
    });
  }
}
