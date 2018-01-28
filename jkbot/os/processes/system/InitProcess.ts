import {Constants} from "../../core/Constants";
import {Process} from "../../core/Process";
import {MetaData} from "../../../typings";

// TODO
export class InitProcess extends Process {
    public metaData: any;

    public type = "init";

    public run() {
        let process = this;

        // ------------------------------------------------------------------------------------------- System processes
        this.kernel.addProcess(
            "memoryManager",
            "memoryManager",
            Constants.PRIORITY_FIRST,
            {}
        );

        this.kernel.addProcess(
            "suspension",
            "suspension",
            Constants.PRIORITY_LAST,
            {}
        );

        // ----------------------------------------------------------------------- Add supervisor process for each room
        _.forEach(Game.rooms, function(room: Room) {
            let processName = "roomSupervisor-" + room.name;

            if (!room.controller || !room.controller.my) {
                return;
            }

            process.kernel.addProcess(
                "roomSupervisor",
                processName,
                Constants.PRIORITY_HIGHEST,
                {
                    roomName: room.name
                } as MetaData["roomSupervisor"]
            );
        });
    }
}
