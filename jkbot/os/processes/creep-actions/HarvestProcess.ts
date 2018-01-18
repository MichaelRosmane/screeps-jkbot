import { Process } from "os/core/Process";
import { MetaData } from "typings";

export class HarvestProcess extends Process {

  public type = "harvest";

  public metaData: MetaData["harvest"];

  public run(): void {
    let creep = Game.creeps[this.metaData.creepName];
    let target = this.metaData.target;

    if (!creep) {
        this.completed = true;
        return;
    }

    let source: Source | Mineral<MineralConstant> | null = Game.getObjectById(target.id);

    if (!source) {
        // TODO what if invalid source ?
    } else {
        if (_.sum(creep.carry) < creep.carryCapacity) {
            creep.harvest(source);
        } else {
            this.completed = true;
        }
    }
  }

}
