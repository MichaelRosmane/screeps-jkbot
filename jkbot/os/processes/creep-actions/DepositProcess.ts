import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {MetaData} from "typings";

export class DepositProcess extends CreepActionProcess {
    public type = "deposit";

    public metaData: MetaData["deposit"];

    public run(): void {

        let creep = Game.creeps[this.metaData.creepName];
        let dropOffInfo = this.metaData.dropOff;

        if (!creep) {
            this.markAsCompleted();
            return;
        }

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
