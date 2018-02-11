import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";

export class HarvesterLifeCycleProcess extends LifeCycleProcess {
    public type = "harvesterLifeCycle";

    public metaData: MetaData["harvesterLifeCycle"];

    public parent: EnergyManagementProcess;

    public run(): void {
        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;
        let room = Game.rooms[this.metaData.roomName];

        if (!creep) {
            this.completed = true;
            room.memory.sources[target.id].isMinedBy.harvesters--;
            return;
        } else if (creep.spawning) {
            this.suspend = 3;
            return;
        }

        if (creep.ticksToLive < 20) {
            room.memory.sources[target.id].isMinedBy.harvesters--;
            this.suspend = creep.ticksToLive;
            return;
        }

        switch (creep.memory.nextAction) {
            case "harvest":
                this.switchToHarvestProcess();
                creep.memory.nextAction = "";
                return;
            case "deposit":
                this.switchToDepositProcess();
                creep.memory.nextAction = "";
                return;
            case "upgrade":
                this.switchToUpgradeProcess();
                creep.memory.nextAction = "";
                return;
        }

        if (_.sum(creep.carry) === 0) {

            this.metaData.dropOff = undefined;
            if (creep.pos.getRangeTo(target.x, target.y) > 1) {
                this.switchToMoveProcess(this.metaData.target);
                creep.memory.nextAction = "harvest";
            } else {
                this.switchToHarvestProcess();
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

                } else if (room.controller) {
                    this.switchToMoveProcess({
                        id: room.controller.id,
                        roomName: room.name,
                        x: room.controller.pos.x,
                        y: room.controller.pos.y
                    }, 2);
                    creep.memory.nextAction = "upgrade";
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
