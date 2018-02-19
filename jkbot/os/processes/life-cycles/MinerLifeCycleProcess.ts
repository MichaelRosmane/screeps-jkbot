import {isCreepAlive} from "@open-screeps/is-creep-alive";
import {isMyRoom} from "@open-screeps/is-my-room";
import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {Constants} from "../../core/Constants";

export class MinerLifeCycleProcess extends LifeCycleProcess {
    public type = "minerLifeCycle";
    public metaData: MetaData["minerLifeCycle"];

    public run(): void {

        if (!isCreepAlive(this.metaData.creepName) || !isMyRoom(this.metaData.roomName)) {
            this.markAsCompleted();
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;

        creep.memory.target = target;

        if (creep.spawning) {
            this.suspend = 1;
            return;
        }

        if (creep.memory.nextAction === "mine") {
            this.switchToMineProcess();
        }

        if (creep.pos.getRangeTo(target.x, target.y) > 1) {
            this.switchToMoveProcess();
            creep.memory.nextAction = "mine";
        } else {
            this.switchToMineProcess();
        }

        creep.say(Constants.CREEP_SAY_SLEEPING);
    }

    protected markAsCompleted() {
        let room = Game.rooms[this.metaData.roomName];

        if (room) {
            room.memory.sources[this.metaData.target.id].isMinedBy.miners--;
        }

        super.markAsCompleted();
    }
}
