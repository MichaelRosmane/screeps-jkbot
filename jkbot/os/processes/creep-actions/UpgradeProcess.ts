import {CreepActionProcess} from "os/processes/CreepActionProcess";
import {Constants} from "../../core/Constants";

export class UpgradeProcess extends CreepActionProcess {

    public type = "upgrade";

    public metaData: MetaData["upgrade"];

    public run(): void {
        let creep = Game.creeps[this.metaData.creepName];
        let room = Game.rooms[this.metaData.roomName];

        if (!creep || !room || !room.controller) {
            this.markAsCompleted();
            return;
        }


        creep.say(Constants.CREEP_SAY_UPGRADING);

        if (_.sum(creep.carry) > 0) {
            creep.upgradeController(room.controller);
        } else {
            this.markAsCompleted();
        }
    }
}
