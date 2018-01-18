import { Constants } from "os/core/Constants";
import { Process } from "os/core/Process";
import { BasicObjectInfo } from "typings";

export abstract class LifeCycleProcess extends Process {

  /**
   * Spawns a move process and suspends the current one
   *
   * @param {BasicObjectInfo} target
   */
  public switchToMoveProcess(target: BasicObjectInfo, range = 1) {
    this.spawnChildProcess(
      "move",
      "move-" + this.metaData.creepName,
      Constants.PRIORITY_MEDIUM,
      {
        creepName: this.metaData.creepName,
        range,
        roomName: this.metaData.roomName,
        target
      },
      true
    );
  }

  /**
   * Spawns a harvest process and suspends the current one
   */
  public switchToHarvestProcess() {
    this.spawnChildProcess(
      "harvest",
      "harvest-" + this.metaData.creepName,
      Constants.PRIORITY_MEDIUM,
      {
        creepName: this.metaData.creepName,
        roomName: this.metaData.roomName,
        target: this.metaData.target
      },
      true
    );
  }

  /**
   * Spawns a deposit process and suspends the current one
   */
  public switchToDepositProcess() {
    this.spawnChildProcess(
      "deposit",
      "deposit-" + this.metaData.creepName,
      Constants.PRIORITY_MEDIUM,
      {
        creepName: this.metaData.creepName,
        dropOff: this.metaData.dropOff,
        roomName: this.metaData.roomName
      },
      true
    );
  }

  /**
   * Spawns an upgrade process and suspends the current one
   */
  public switchToUpgradeProcess() {
    this.spawnChildProcess(
      "upgrade",
      "upgrade-" + this.metaData.creepName,
      Constants.PRIORITY_MEDIUM,
      {
        creepName: this.metaData.creepName,
        roomName: this.metaData.roomName
      },
      true
    );
  }

  /**
   * Spawns a build process and suspends the current one
   */
  public switchToBuildProcess(target: BasicObjectInfo) {
    this.spawnChildProcess(
      "build",
      "build-" + this.metaData.creepName,
      Constants.PRIORITY_MEDIUM,
      {
        creepName: this.metaData.creepName,
        roomName: this.metaData.roomName,
        target
      },
      true
    );
  }

  /**
   * Spawns a pickup process and suspends the current one
   */
  public switchToPickUpProcess(target: BasicObjectInfo, resourceType: ResourceConstant) {
    this.spawnChildProcess(
      "pickup",
      "pickup-" + this.metaData.creepName,
      Constants.PRIORITY_MEDIUM,
      {
        creepName: this.metaData.creepName,
        resource: resourceType,
        roomName: this.metaData.roomName,
        target
      },
      true
    );
  }
}
