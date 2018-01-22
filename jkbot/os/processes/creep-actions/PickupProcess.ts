import { CreepActionProcess } from "os/core/CreepActionProcess";
import { MetaData } from "typings";

export class PickupProcess extends CreepActionProcess {
  public type = "pickup";

  public metaData: MetaData["pickup"];

  public run(): void {

    let creep = Game.creeps[this.metaData.creepName];
    let target = this.metaData.target;

    if (!creep) {
        this.markAsCompleted();
        return;
    }

    if (!target) {
      this.log("Invalid target point set", "error");
      this.markAsCompleted();
    } else {
        let targetStructure: Structure | null = Game.getObjectById(target.id);

        if (targetStructure) {

          let result = creep.withdraw(targetStructure, RESOURCE_ENERGY);
          this.log("trying to withdraw: " + result, "error");
        }
    }

    this.markAsCompleted();
  }

}
