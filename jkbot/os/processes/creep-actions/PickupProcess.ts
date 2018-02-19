import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {Constants} from "os/core/Constants";
import {isCreepAlive} from "@open-screeps/is-creep-alive";

export class PickupProcess extends CreepActionProcess {
    public type = "pickup";

    public metaData: MetaData["pickup"];

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

        creep.say(Constants.CREEP_SAY_PICKUP);

        let targetResource: Resource | null = Game.getObjectById(target.id);

        if (targetResource) {
            creep.pickup(targetResource);
        } else {
            this.markAsCompleted();
        }

        if (_.sum(creep.carry) === creep.carryCapacity) {
            this.markAsCompleted();
        }
    }

}
