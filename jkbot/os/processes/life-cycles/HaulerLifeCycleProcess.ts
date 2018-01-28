import {Process} from "os/core/Process";
import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {ConstructionManagerProcess} from "os/processes/room/ConstructionManagerProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";
import {BasicObjectInfo, MetaData} from "typings";
import {Constants} from "../../core/Constants";

export class HaulerLifeCycleProcess extends LifeCycleProcess {
    public type = "haulerLifeCycle";

    public metaData: MetaData["haulerLifeCycle"];

    public parent: EnergyManagementProcess;

    public run(): void {
        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;
        let room = Game.rooms[this.metaData.roomName];

        if (!this.roomData) {
            this.roomData = this.getRoomData(this.metaData.roomName);
        }

        if (!creep || !room) {
            this.completed = true;
            this.roomData.sources[target.id].isMinedBy.haulers--;
            return;
        } else if (creep.spawning) {
            this.suspend = 1;
            return;
        }

        if (creep.ticksToLive < 20) {
            this.roomData.sources[target.id].isMinedBy.haulers--;
            this.suspend = creep.ticksToLive;
            return;
        }

        switch (this.metaData.next) {
            case "deposit":
                this.switchToDepositProcess();
                this.metaData.next = "";
                return;
            case "pickup":
                this.switchToPickUpProcess(this.metaData.target, RESOURCE_ENERGY);
                this.metaData.next = "";
                return;
        }

        if (_.sum(creep.carry) === 0) {

            this.metaData.dropOff = undefined;
            if (creep.pos.getRangeTo(target.x, target.y) > 1) {
                this.switchToMoveProcess(this.metaData.target);
                this.metaData.next = "pickup";
            } else {
                this.switchToPickUpProcess(this.metaData.target, RESOURCE_ENERGY);
            }

        } else {

            if (!this.metaData.dropOff) {
                let energyManager: EnergyManagementProcess = this.parent;
                let newDropOff = energyManager.getDropOffPoint();

                if (newDropOff && newDropOff !== true) {
                    this.metaData.dropOff = newDropOff;

                    if (creep.pos.getRangeTo(this.metaData.dropOff.x, this.metaData.dropOff.y) > 1) {
                        this.switchToMoveProcess(this.metaData.dropOff);
                        this.metaData.next = "deposit";
                    } else {
                        this.switchToDepositProcess();
                        this.metaData.dropOff = undefined;
                    }
                }
            } else {
                if (creep.pos.getRangeTo(this.metaData.dropOff.x, this.metaData.dropOff.y) > 1) {
                    this.switchToMoveProcess(this.metaData.dropOff);
                    this.metaData.next = "deposit";
                } else {
                    this.switchToDepositProcess();
                    this.metaData.dropOff = undefined;
                }
            }
        }
    }
}
