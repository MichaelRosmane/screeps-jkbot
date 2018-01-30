import {Constants} from "os/core/Constants";
import {Process} from "os/core/Process";

export class RoomSupervisorProcess extends Process {
    public type = "roomSupervisor";

    public metaData: MetaData["roomSupervisor"];

    public run() {

        let room = Game.rooms[this.metaData.roomName];

        if (room && room.controller && room.controller.my) {

            // ------------------------------------------------------------------- Spawn child process - energy manager
            let energyManagerName = "energyManager-" + this.metaData.roomName;
            if (!this.kernel.hasProcess(energyManagerName)) {
                this.spawnChildProcess(
                    "energyManager",
                    energyManagerName,
                    Constants.PRIORITY_HIGH,
                    {roomName: this.metaData.roomName},
                    false
                );
            }

            // -------------------------------------------------------------------- Spawn child process - spawn manager
            let spawnManagerName = "spawnManager-" + this.metaData.roomName;
            if (!this.kernel.hasProcess(spawnManagerName)) {
                this.spawnChildProcess(
                    "spawnManager",
                    spawnManagerName,
                    Constants.PRIORITY_HIGH,
                    {roomName: this.metaData.roomName, spawnQue: []},
                    false
                );
            }

            // ------------------------------------------------------------- Spawn child process - construction manager
            let constructionManagerName = "constructionManager-" + this.metaData.roomName;
            if (!this.kernel.hasProcess(constructionManagerName)) {
                this.spawnChildProcess(
                    "constructionManager",
                    constructionManagerName,
                    Constants.PRIORITY_HIGH,
                    {roomName: this.metaData.roomName},
                    false
                );
            }

        }

        // ----------------------------------------------------------------------------- generating room data processes
        if (!this.metaData.roomDataSet) {
            this.spawnChildProcess(
                "staticRoomData",
                "staticRoomData-" + this.metaData.roomName,
                Constants.PRIORITY_HIGHEST,
                {roomName: this.metaData.roomName},
                false
            );

            this.metaData.roomDataSet = true;
        }

    }
}
