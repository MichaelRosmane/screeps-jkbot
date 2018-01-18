import { Process } from "os/core/Process";
import { MetaData } from "typings";

export class DepositProcess extends Process {
  public type = "deposit";

  public metaData: MetaData["deposit"];

  public run(): void {

    let creep = Game.creeps[this.metaData.creepName];
    let dropOffInfo = this.metaData.dropOff;

    if (!creep) {
        this.completed = true;
        return;
    }

    if (!dropOffInfo) {
      this.log("Invalid drop off point set", "error");
      this.completed = true;
    } else {
        let dropOff: Structure | null = Game.getObjectById(dropOffInfo.id);

        if (dropOff) {
          creep.transfer(dropOff, RESOURCE_ENERGY);
        }
    }

    this.completed = true;
  }

}
