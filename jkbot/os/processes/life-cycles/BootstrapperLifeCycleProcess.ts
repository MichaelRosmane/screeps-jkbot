import {LifeCycleProcess} from "os/processes/LifeCycleProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";
import {ConstructionManagerProcess} from "../room/ConstructionManagerProcess";

import {isCreepAlive} from "@open-screeps/is-creep-alive";
import {isMyRoom} from "@open-screeps/is-my-room";

export class BootstrapperLifeCycleProcess extends LifeCycleProcess {

    public type = "bootstrapperLifeCycle";

    public metaData: BootstrapperLifeCycleMetaData;

    public run(): void {

        if (!isCreepAlive(this.metaData.creepName) || !isMyRoom(this.metaData.roomName)) {
            this.markAsCompleted();
            return;
        }

        let creep = Game.creeps[this.metaData.creepName];
        let room = Game.rooms[this.metaData.roomName];

        let energyManager = this.kernel.getProcessByRoomAndType(this.metaData.roomName, "energyManager") as EnergyManagementProcess;
        let constructionManager = this.kernel.getProcessByRoomAndType(this.metaData.roomName, "constructionManager") as ConstructionManagerProcess;

        this.log("next action: " + creep.memory.nextAction);

        if (creep.memory.nextAction === "") {

            if (_.sum(creep.carry) === 0) {

                let process = this;
                let droppedEnergy = room.find(FIND_DROPPED_ENERGY, {
                    filter(e) {
                        return e.pos.getRangeTo(process.metaData.target.x, process.metaData.target.y) < 2;
                    }
                });

                if (droppedEnergy.length) {
                    creep.memory.target = {
                        id: droppedEnergy[0].id,
                        roomName: this.metaData.roomName,
                        x: droppedEnergy[0].pos.x,
                        y: droppedEnergy[0].pos.y
                    };

                    if (creep.pos.getRangeTo(creep.memory.target.x, creep.memory.target.y) > 1) {
                        this.switchToMoveProcess();
                        creep.memory.nextAction = "pickup";
                    } else {
                        this.switchToPickUpProcess();
                    }

                } else {
                    creep.memory.target = this.metaData.target;
                    if (creep.pos.getRangeTo(this.metaData.target.x, this.metaData.target.y) > 1) {
                        this.switchToMoveProcess();
                        creep.memory.nextAction = "harvest";
                    } else {
                        this.switchToHarvestProcess();
                    }
                }



            } else {

                if (energyManager && energyManager.getDropOffPoint()) {

                    let dropOff = energyManager.getDropOffPoint();

                    if (dropOff && creep.pos.getRangeTo(dropOff.x, dropOff.y) > 1) {
                        this.switchToMoveProcess();
                        creep.memory.nextAction = "deposit";
                        creep.memory.target = dropOff;
                    } else if (dropOff) {
                        this.switchToDepositProcess();
                    }

                } else if (constructionManager && constructionManager.hasBuildingToRepair()) {

                    let repairSite = constructionManager.getBuildingToRepair();
                    creep.memory.target = repairSite;

                    if (creep.pos.getRangeTo(repairSite.x, repairSite.y) > 3) {
                        this.switchToMoveProcess(3);
                        creep.memory.nextAction = "repair";
                    } else {
                        this.switchToRepairProcess();
                    }

                } else if (constructionManager && constructionManager.hasConstructionSites()) {

                    let site = constructionManager.getConstructionSite();
                    creep.memory.target = site;

                    if (creep.pos.getRangeTo(site.x, site.y) > 3) {
                        this.switchToMoveProcess(3);
                        creep.memory.nextAction = "build";
                    } else {
                        this.switchToBuildProcess();
                    }

                } else if (room.controller) {

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
                        creep.memory.nextAction = "upgrade";
                    }

                }

            }
        } else {

            switch (creep.memory.nextAction) {
                case "deposit":
                    this.switchToBuildProcess();
                    break;
                case "harvest":
                    this.switchToHarvestProcess();
                    break;
                case "build":
                    this.switchToDepositProcess();
                    break;
                case "upgrade":
                    this.switchToUpgradeProcess();
                    break;
                case "repair":
                    this.switchToRepairProcess();
                    break;
                case "pickup":
                    this.switchToPickUpProcess();
                    break;
            }

            creep.memory.nextAction = "";
        }
    }

    protected markAsCompleted() {
        let room = Game.rooms[this.metaData.roomName];

        if (room) {
            room.memory.sources[this.metaData.target.id].isMinedBy.bootstrappers--;
        }

        super.markAsCompleted();
    }
}
