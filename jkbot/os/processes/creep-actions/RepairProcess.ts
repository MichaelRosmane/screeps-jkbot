import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {Constants} from "../../core/Constants";

export class RepairProcess extends CreepActionProcess {

    public type = "repair";

    public metaData: MetaData["repair"];

    public run(): void {
        let creep = Game.creeps[this.metaData.creepName];
        let room = Game.rooms[this.metaData.roomName];

        if (!creep || !room || !creep.memory.target) {
            this.markAsCompleted();
            return;
        }

        creep.say(Constants.CREEP_SAY_REPAIRING);

        if (_.sum(creep.carry) > 0) {
            let structure: Structure | null = Game.getObjectById(creep.memory.target.id);

            if (structure && structure.id && structure.id !== "") {
                let result = creep.repair(structure);

                if (result !== OK) {
                    this.markAsCompleted();
                }
            } else {
                this.log("Invalid repair target received - terminating process", "error");
                this.markAsCompleted();
            }
        } else {
            this.markAsCompleted();
        }
    }
}
