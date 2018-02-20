import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {Constants} from "../../core/Constants";
import {isCreepAlive} from "@open-screeps/is-creep-alive";

export class WithdrawProcess extends CreepActionProcess {
    public type = "withdraw";

    public metaData: MetaData["withdraw"];

    public run(): void {


        if (!isCreepAlive(this.metaData.creepName)) {
            this.markAsCompleted();
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];

        let target = creep.memory.target;

        if (!target) {
            this.markAsCompleted();
            return;
        }

        creep.say(Constants.CREEP_SAY_WITHDRAWING);

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
