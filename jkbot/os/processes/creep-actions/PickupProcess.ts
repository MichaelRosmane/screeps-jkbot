import { Process } from "os/core/Process";
import { MetaData } from "typings";

export class PickupProcess extends Process {
  public type = "pickup";

  public metaData: MetaData["pickup"];

  public run(): void {

    let creep = Game.creeps[this.metaData.creepName];
    let target = this.metaData.target;

    if (!creep) {
        this.completed = true;
        return;
    }

    if (!target) {
      this.log("Invalid target point set", "error");
      this.completed = true;
    } else {
        let targetStructure: Structure | null = Game.getObjectById(target.id);

        if (targetStructure) {

          let result = creep.withdraw(targetStructure, RESOURCE_ENERGY);
          this.log("trying to withdraw: " + result, "error");
        }
    }

    this.completed = true;
  }

}
