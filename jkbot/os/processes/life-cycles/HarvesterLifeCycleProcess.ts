import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {ConstructionManagerProcess} from "os/processes/room/ConstructionManagerProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";

export class HarvesterLifeCycleProcess extends LifeCycleProcess {
    public type = "harvesterLifeCycle";

    public metaData: MetaData["harvesterLifeCycle"];

    public parent: EnergyManagementProcess;

    public run(): void {
        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;
        let room = Game.rooms[this.metaData.roomName];

        let constructionManagerName = "constructionManager-" + this.metaData.roomName;

        let constructionManager: ConstructionManagerProcess = this.kernel.getProcessByName(constructionManagerName)!;

        if (!this.roomData) {
            this.roomData = this.getRoomData(this.metaData.roomName);
        }

        if (!creep || !room) {
            this.completed = true;
            this.roomData.sources[target.id].isMinedBy.harvesters--;
            return;
        } else if (creep.spawning) {
            this.suspend = 3;
            return;
        }

        if (creep.ticksToLive < 20) {
            this.roomData.sources[target.id].isMinedBy.harvesters--;
            this.suspend = creep.ticksToLive;
            return;
        }

        switch (this.metaData.next) {
            case "harvest":
                this.switchToHarvestProcess();
                this.metaData.next = "";
                return;
            case "deposit":
                this.switchToDepositProcess();
                this.metaData.next = "";
                return;
            case "upgrade":
                this.switchToUpgradeProcess();
                this.metaData.next = "";
                return;
        }

        if (_.sum(creep.carry) === 0) {

            this.metaData.dropOff = undefined;
            if (creep.pos.getRangeTo(target.x, target.y) > 1) {
                this.switchToMoveProcess(this.metaData.target);
                this.metaData.next = "harvest";
            } else {
                this.switchToHarvestProcess();
            }

        } else {

            if (!this.metaData.dropOff) {
                this.log("no dropoff");
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

                } else if (room.controller) {
                    this.switchToMoveProcess({
                        x: room.controller.pos.x,
                        y: room.controller.pos.y,
                        roomName: room.name,
                        id: room.controller.id
                    }, 2);
                    this.metaData.next = "upgrade";
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
