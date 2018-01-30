import {isCreepAlive} from "@open-screeps/is-creep-alive";
import {isMyRoom} from "@open-screeps/is-my-room";
import {LifeCycleProcess} from "os/processes/LifeCycleProcess";

export class MinerLifeCycleProcess extends LifeCycleProcess {
    public type = "minerLifeCycle";
    public metaData: MetaData["minerLifeCycle"];

    public run(): void {

        if (!isCreepAlive(this.metaData.creepName) || !isMyRoom(this.metaData.roomName)) {
            this.completed = true;
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;

        if (creep.pos.getRangeTo(target.x, target.y) > 1) {
            this.switchToMoveProcess(this.metaData.target);
            this.metaData.next = "harvest";
        } else {
            this.switchToMineProcess();
        }
    }
}
