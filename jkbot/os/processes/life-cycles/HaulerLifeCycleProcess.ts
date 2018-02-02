import {isCreepAlive} from "@open-screeps/is-creep-alive";
import {isMyRoom} from "@open-screeps/is-my-room";
import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";

export class HaulerLifeCycleProcess extends LifeCycleProcess {
    public type = "haulerLifeCycle";

    public metaData: MetaData["haulerLifeCycle"];

    public parent: EnergyManagementProcess;

    public run(): void {

        if (!isCreepAlive(this.metaData.creepName) || !isMyRoom(this.metaData.roomName)) {
            this.completed = true;
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;
        let room = Game.rooms[this.metaData.roomName];

        if (creep.spawning) {
            this.suspend = 1;
            return;
        }

        if (creep.ticksToLive < 100) {
            room.memory.sources[target.id].isMinedBy.haulers--;
            return;
        }

        switch (creep.memory.nextAction) {
            case "deposit":
                this.switchToDepositProcess();
                creep.memory.nextAction = "";
                return;
            case "pickup":
                this.switchToPickUpProcess(this.metaData.target, RESOURCE_ENERGY);
                creep.memory.nextAction = "";
                return;
        }

        if (_.sum(creep.carry) === 0) {

            let pickup = this.parent.getPickUpForHauler();

            if (typeof pickup === "boolean") {
                return;
            }

            this.metaData.dropOff = undefined;
            this.metaData.pickup = undefined;

            if (creep.pos.getRangeTo(pickup.x, pickup.y) > 1) {
                this.switchToMoveProcess(this.metaData.target);
                creep.memory.nextAction = "pickup";
            } else {
                this.switchToPickUpProcess(pickup, RESOURCE_ENERGY);
            }

        } else {

            if (!this.metaData.dropOff) {
                let energyManager: EnergyManagementProcess = this.parent;
                let newDropOff = energyManager.getDropOffPoint();

                if (newDropOff && newDropOff !== true) {
                    this.metaData.dropOff = newDropOff;

                    if (creep.pos.getRangeTo(this.metaData.dropOff.x, this.metaData.dropOff.y) > 1) {
                        this.switchToMoveProcess(this.metaData.dropOff);
                        creep.memory.nextAction = "deposit";
                    } else {
                        this.switchToDepositProcess();
                        this.metaData.dropOff = undefined;
                    }
                }
            } else {
                if (creep.pos.getRangeTo(this.metaData.dropOff.x, this.metaData.dropOff.y) > 1) {
                    this.switchToMoveProcess(this.metaData.dropOff);
                    creep.memory.nextAction = "deposit";
                } else {
                    this.switchToDepositProcess();
                    this.metaData.dropOff = undefined;
                }
            }
        }
    }
}
