import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {ConstructionManagerProcess} from "os/processes/room/ConstructionManagerProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";
import {Constants} from "../../core/Constants";

export class UpgraderLifeCycleProcess extends LifeCycleProcess {
    public type = "upgraderLifeCycle";
    public metaData: MetaData["upgraderLifeCycle"];

    public parent: ConstructionManagerProcess;

    public run(): void {

        let creep = Game.creeps[this.metaData.creepName];
        let room = Game.rooms[this.metaData.roomName];

        let energyManagerProcessName = "energyManager-" + this.metaData.roomName;
        let energyManager: EnergyManagementProcess = this.kernel.getProcessByName(energyManagerProcessName)!;

        if (!creep || !room || !room.controller) {
            this.completed = true;
            room.memory.upgraders--;
            return;
        } else if (creep.spawning) {
            this.suspend = 3;
            return;
        }

        if (creep.ticksToLive < 20) {
            room.memory.builders--;
            this.suspend = creep.ticksToLive;
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
            if (creep.pos.getRangeTo(room.controller.pos.x, room.controller.pos.y) > 3) {
                this.switchToMoveProcess(3);
                creep.memory.nextAction = "upgrade";
                creep.memory.target = {
                    id: room.controller.id,
                    roomName: this.metaData.roomName,
                    x: room.controller.pos.x,
                    y: room.controller.pos.y
                };
            } else {
                this.switchToUpgradeProcess();
            }
        }

        creep.say(Constants.CREEP_SAY_SLEEPING);
    }

}
