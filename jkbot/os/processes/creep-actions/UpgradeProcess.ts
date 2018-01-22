import { CreepActionProcess } from "os/core/CreepActionProcess";
import { MetaData } from "typings";

export class UpgradeProcess extends CreepActionProcess {

  public type = "upgrade";

  public metaData: MetaData["upgrade"];

  public run(): void {
    let creep = Game.creeps[this.metaData.creepName];
    let room = Game.rooms[this.metaData.roomName];

    if (!creep || !room || !room.controller) {
        this.markAsCompleted();
        return;
    }

    if (_.sum(creep.carry) > 0) {
      creep.upgradeController(room.controller);
    } else {
      this.markAsCompleted();
    }
  }
}
