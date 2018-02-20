import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {Constants} from "../../core/Constants";

export class BuildProcess extends CreepActionProcess {

    public type = "build";

    public metaData: MetaData["build"];

    public run(): void {
        let creep = Game.creeps[this.metaData.creepName];
        let room = Game.rooms[this.metaData.roomName];

        if (!creep || !room || !creep.memory.target) {
            this.markAsCompleted();
            return;
        }

        creep.say(Constants.CREEP_SAY_BUILDING);

        if (_.sum(creep.carry) > 0) {
            let site: ConstructionSite | null = Game.getObjectById(creep.memory.target.id);

            if (site && site.id && site.id !== "") {
                let result = creep.build(site);

                this.log("build attempt result: "+result);

                if(result === -14) {
                    creep.memory.nextAction = "upgrade";
                    this.markAsCompleted();
                } else if (result !== OK) {
                    this.markAsCompleted();
                }
            } else {
                this.log("Invalid construction site received - terminating process", "error");
                this.markAsCompleted();
            }
        } else {
            this.markAsCompleted();
        }
    }
}
