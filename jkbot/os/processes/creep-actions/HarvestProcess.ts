import {Constants} from "os/core/Constants";

import {isCreepAlive} from "@open-screeps/is-creep-alive";
import {CreepActionProcess} from "os/processes/CreepActionProcess";

export class HarvestProcess extends CreepActionProcess {

    public type = "harvest";

    public metaData: MetaData["harvest"];

    public run(): void {

        if (!isCreepAlive(this.metaData.creepName)) {
            this.markAsCompleted();
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];
        let target = creep.memory.target;

        if (!creep) {
            this.markAsCompleted();
            return;
        }

        creep.say(Constants.CREEP_SAY_MINING);

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
