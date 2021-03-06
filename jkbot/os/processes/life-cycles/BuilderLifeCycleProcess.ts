import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {ConstructionManagerProcess} from "os/processes/room/ConstructionManagerProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";
import {Constants} from "../../core/Constants";

export class BuilderLifeCycleProcess extends LifeCycleProcess {
    public type = "builderLifeCycle";
    public metaData: MetaData["builderLifeCycle"];

    public parent: ConstructionManagerProcess;

    public run(): void {

        let creep = Game.creeps[this.metaData.creepName];
        let room = Game.rooms[this.metaData.roomName];

        let energyManagerProcessName = "energyManager-" + this.metaData.roomName;
        let energyManager: EnergyManagementProcess = this.kernel.getProcessByName(energyManagerProcessName)!;

        if (!creep || !room) {
            this.markAsCompleted();
            return;
        } else if (creep.spawning) {
            this.suspend = 3;
            return;
        }

        if (_.sum(creep.carry) === 0) {
            let pickup = energyManager.getPickUpPoint();
            if (pickup) {
                creep.memory.target = pickup;

                if (creep.pos.getRangeTo(pickup.x, pickup.y) > 1) {
                    this.switchToMoveProcess();
                } else {
                    this.switchWithdrawProcess(RESOURCE_ENERGY);
                }
            }

        } else {
            if (!this.parent.hasConstructionSites()) {
                // TODO do something smart when no construction sites available
                return;
            } else {
                let target = this.parent.getConstructionSite();
                creep.memory.target = target;

                if (creep.pos.getRangeTo(target.x, target.y) < 3) {
                    this.switchToBuildProcess();
                } else {
                    this.switchToMoveProcess(3);
                }
            }
        }

        creep.say(Constants.CREEP_SAY_SLEEPING);
    }

    protected markAsCompleted() {
        let room = Game.rooms[this.metaData.roomName];

        if (room) {
            room.memory.builders--;
        }

        super.markAsCompleted();
    }

}
