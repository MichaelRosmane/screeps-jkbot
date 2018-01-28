import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";

export class MinerLifeCycleProcess extends LifeCycleProcess {
    public type = "minerLifeCycle";
    public metaData: MetaData["minerLifeCycle"];

    public parent: EnergyManagementProcess;

    public run(): void {

        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;
        let room = Game.rooms[this.metaData.roomName];

        if (creep.pos.getRangeTo(target.x, target.y) > 1) {
            this.switchToMoveProcess(this.metaData.target);
            this.metaData.next = "harvest";
        } else {
            this.switchToMineProcess();
        }
    }
}
