import { Process } from "os/core/Process";
import { MetaData } from "typings";

export class UpgradeProcess extends Process {

  public type = "upgrade";

  public metaData: MetaData["upgrade"];

  public run(): void {
    let creep = Game.creeps[this.metaData.creepName];
    let room = Game.rooms[this.metaData.roomName];

    if (!creep || !room || !room.controller) {
        this.completed = true;
        return;
    }

    if (_.sum(creep.carry) > 0) {
      creep.upgradeController(room.controller);
    } else {
      this.completed = true;
    }
  }
}
