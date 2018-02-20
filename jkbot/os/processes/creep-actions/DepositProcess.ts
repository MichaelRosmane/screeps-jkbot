import {isCreepAlive} from "@open-screeps/is-creep-alive";
import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {Constants} from "../../core/Constants";

export class DepositProcess extends CreepActionProcess {
    public type = "deposit";

    public metaData: MetaData["deposit"];

    public run(): void {

        if (!isCreepAlive(this.metaData.creepName)) {
            this.markAsCompleted();
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];

        creep.say(Constants.CREEP_SAY_DEPOSITING);

        let dropOffInfo = creep.memory.target;

        if (!dropOffInfo) {
            this.log("Invalid drop off point set", "error");
            this.markAsCompleted();
        } else {
            let dropOff: Structure | null = Game.getObjectById(dropOffInfo.id);

            if (dropOff) {
                creep.transfer(dropOff, RESOURCE_ENERGY);
            }
        }

        this.markAsCompleted();
    }
}
