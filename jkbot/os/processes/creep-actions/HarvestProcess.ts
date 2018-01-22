import { CreepActionProcess } from "os/core/CreepActionProcess";
import { MetaData } from "typings";

export class HarvestProcess extends CreepActionProcess {

  public type = "harvest";

  public metaData: MetaData["harvest"];

  public run(): void {
    let creep = Game.creeps[this.metaData.creepName];
    let target = this.metaData.target;

    if (!creep) {
        this.markAsCompleted();
        return;
    }

    let source: Source | Mineral<MineralConstant> | null = Game.getObjectById(target.id);

    if (!source) {
      this.log("Invalid source point set", "error");
      this.markAsCompleted();
    } else {
        if (_.sum(creep.carry) < creep.carryCapacity) {
            creep.harvest(source);
        } else {
            this.markAsCompleted();
        }
    }
  }

}
