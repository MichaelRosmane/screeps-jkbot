import { Constants } from "../../core/Constants";
import { Process } from "../../core/Process";

export class MemoryManagerProcess extends Process {
  public metaData: any;

  public type = "memoryManager";

  public run() {

    // -------------------------------------------------------------------------------------- Initializing memory parts
    if (!Memory.jkbot.version) {
      Memory.jkbot.version = Constants.SCRIPT_VERSION;
    } else if (Memory.jkbot.version !== Constants.SCRIPT_VERSION) {
      // TODO redo static room data
    }

    if (typeof Memory.jkbot.debug === "undefined" ) {
      Memory.jkbot.debug = false;
    }

    // ------------------------------------------------------------------------------------------ Creep memory clean up
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
          delete Memory.creeps[name];
      }
    }

    // -------------------------------------------------------------------------------------------- Run every 100 ticks
    this.suspend = 100;
  }
}
