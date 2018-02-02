import {CreepActionProcess} from "os/processes/CreepActionProcess";

export class MoveProcess extends CreepActionProcess {
    public type = "move";

    public metaData: MetaData["move"];

    private movements = [TOP_LEFT, TOP, TOP_RIGHT, BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT, LEFT, RIGHT];

    public run(): void {
        let nextStep: RoomPosition;
        let fullPath: PathStep[];
        let creep = Game.creeps[this.metaData.creepName];
        let removeFirst = false;
        let range: number;
        let room = Game.rooms[this.metaData.roomName];

        if (!creep || !room) {
            this.markAsCompleted();
            return;
        }

        creep.memory.intendedToMove = true;
        creep.memory.nextAction = "test";

        if (this.metaData.range) {
            range = this.metaData.range;
        } else {
            range = 1;
        }

        if (creep.pos.getRangeTo(this.metaData.target.x, this.metaData.target.y) <= range) {
            this.completed = true;
        }

        this.checkWithPreviousPosition(creep.pos.x, creep.pos.y);

        if (this.metaData.path === "" || typeof this.metaData.path === "undefined") {

            let targetPos = new RoomPosition(this.metaData.target.x, this.metaData.target.y, this.metaData.roomName);

            this.metaData.previousPositionX = NaN;
            this.metaData.previousPositionY = NaN;
            this.metaData.stuck = 0;

            fullPath = room.findPath(creep.pos, targetPos, {ignoreCreeps: true, range});
        } else {
            fullPath = Room.deserializePath(this.metaData.path);
        }

        if (creep.memory.stuck > 4) {
            this.log("Im really stuck", "error");

            this.metaData.path = "";
            creep.memory.stuck = 0;
            creep.moveTo(this.metaData.target.x, this.metaData.target.y);
        } else if (fullPath.length > 0) {

            if (creep.moveByPath(fullPath) === OK) {
                this.metaData.path = Room.serializePath(fullPath);
            }

        } else {
            this.markAsCompleted();
        }
    }

    /**
     * Tracks for how long a creep is standing in the same spot and triggers new pathing if needed
     * @param {number} currentX
     * @param {number} currentY
     */
    private checkWithPreviousPosition(currentX: number, currentY: number) {
        let creep = Game.creeps[this.metaData.creepName];

        if (creep.memory.previousPosition.x === currentX && creep.memory.previousPosition.y === currentY) {
            creep.memory.stuck++;
        } else {
            creep.memory.previousPosition = {x: currentX, y: currentY};
        }
    }
}
