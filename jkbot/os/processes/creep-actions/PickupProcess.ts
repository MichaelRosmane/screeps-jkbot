import { CreepActionProcess } from "os/processes/CreepActionProcess";
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
      this.markAsCompleted();
      return;
    }

    let targetStructure: Structure | null = Game.getObjectById(target.id);

    if (targetStructure) {
      let result = creep.withdraw(targetStructure, RESOURCE_ENERGY);
    }

    if (_.sum(creep.carry) < creep.carryCapacity) {
      this.suspend = 2;
    } else {
      this.markAsCompleted();
    }
  }

}
