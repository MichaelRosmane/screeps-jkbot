import { Process } from "os/core/Process";
import { PathingHelper } from "os/helpers/PathingHelper";
import { MetaData } from "typings";

export class MoveProcess extends Process {
  public type = "move";

  public metaData: MetaData["move"];

  public run(): void {
    let nextStep: RoomPosition;
    let fullPath: RoomPosition[];
    let creep = Game.creeps[this.metaData.creepName];
    let removeFirst = false;
    let range: number;

    if (!creep) {
      this.completed = true;
      return;
    }

    if (this.metaData.range) {
      range = this.metaData.range;
    } else {
      range = 1;
    }

    this.checkWithPreviousPosition(creep.pos.x, creep.pos.y);

    if (this.metaData.path === "" || typeof this.metaData.path === "undefined") {

        let targetPos = new RoomPosition(this.metaData.target.x, this.metaData.target.y, this.metaData.roomName);

        this.metaData.previousPositionX = NaN;
        this.metaData.previousPositionY = NaN;
        this.metaData.stuck = 0;

        fullPath = PathFinder.search(creep.pos, {pos: targetPos, range}).path;
    } else {
        fullPath = PathingHelper.deserializePath(this.metaData.path);
    }

    if (fullPath.length > 0) {
        nextStep = fullPath[0];

        if (creep.move(creep.pos.getDirectionTo(nextStep)) === OK) {
            removeFirst = true;
            this.metaData.path = PathingHelper.serializePath(fullPath, removeFirst);
        }
    } else {
        this.completed = true;
    }
  }

  /**
   * Tracks for how long a creep is standing in the same spot and triggers new pathing if needed
   * @param {number} currentX
   * @param {number} currentY
   */
  private checkWithPreviousPosition(currentX: number, currentY: number) {
    if (this.metaData.previousPositionX === currentX && this.metaData.previousPositionY === currentY) {
        this.log("Im stuck");
        this.metaData.stuck ++;
    } else {
        this.metaData.previousPositionX = currentX;
        this.metaData.previousPositionY = currentY;
    }

    if (this.metaData.stuck > 4) {
        this.metaData.path = "";
        this.metaData.stuck = 0;
    }
  }
}
