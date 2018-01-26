import { LifeCycleProcess } from "os/processes/LifeCycleProcess";
import { ConstructionManagerProcess } from "os/processes/room/ConstructionManagerProcess";
import { EnergyManagementProcess } from "os/processes/room/EnergyManagerProcess";
import { BasicObjectInfo, MetaData } from "typings";

export class BuilderLifeCycleProcess extends LifeCycleProcess {
  public type = "builderLifeCycle";
  public metaData: MetaData["builderLifeCycle"];

  public parent: ConstructionManagerProcess;

  public run(): void {

    if (!this.roomData) {
      this.roomData = this.getRoomData(this.metaData.roomName);
    }

    let creep = Game.creeps[this.metaData.creepName];
    let room = Game.rooms[this.metaData.roomName];

    let energyManagerProcessName = "energyManager-" + this.metaData.roomName;
    let energyManager: EnergyManagementProcess = this.kernel.getProcessByName(energyManagerProcessName)!;

    if (!creep || !room) {
      this.completed = true;
      this.roomData.builders--;
      return;
    } else if (creep.spawning) {
        this.suspend = 3;
        return;
    }

    if (creep.ticksToLive < 20) {
      this.roomData.builders--;
      this.suspend = creep.ticksToLive;
      return;
    }

    if (_.sum(creep.carry) === 0) {
      let pickup = energyManager.getPickUpPoint();

      if (creep.pos.getRangeTo(pickup.x, pickup.y) > 1) {
        this.switchToMoveProcess(pickup);
      } else {
        this.switchToPickUpProcess(pickup, RESOURCE_ENERGY);
      }

    } else {
      if (!this.parent.hasConstructionSites()) {
        // TODO make builder do something usefull - upgrading perhaps?
        return;
      } else {
        let target = this.parent.getConstructionSite();

        if (creep.pos.getRangeTo(target.x, target.y) <= 2) {
          this.switchToBuildProcess(target);
        } else {
          this.switchToMoveProcess(target, 2);
        }
      }
    }
  }

}
