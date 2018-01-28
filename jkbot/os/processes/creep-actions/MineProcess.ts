import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {MetaData} from "typings";

export class MineProcess extends CreepActionProcess {

    public type = "mine";

    public metaData: MetaData["mine"];

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
            creep.harvest(source);
        }
    }

}
