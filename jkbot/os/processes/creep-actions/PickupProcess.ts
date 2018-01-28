import {CreepActionProcess} from "os/processes/CreepActionProcess";

export class PickupProcess extends CreepActionProcess {
    public type = "pickup";

    public metaData: MetaData["pickup"];

    public run(): void {

        let room = Game.rooms[this.metaData.roomName];
        let creep = Game.creeps[this.metaData.creepName];
        let target = this.metaData.target;

        if (!creep || !room) {
            this.markAsCompleted();
            return;
        }

        if (!target) {
            this.markAsCompleted();
            return;
        }

        let targetStructure: Structure | null = Game.getObjectById(target.id);

        if (targetStructure) {
            let result = creep.withdraw(targetStructure, RESOURCE_ENERGY);
        }

        if (_.sum(creep.carry) < creep.carryCapacity) {
            this.suspend = 2;
        } else {
            this.markAsCompleted();
        }
    }

}
