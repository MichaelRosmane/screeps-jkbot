import {BuildProcess} from "os/processes/creep-actions/BuildProcess";
import {DepositProcess} from "os/processes/creep-actions/DepositProcess";
import {HarvestProcess} from "os/processes/creep-actions/HarvestProcess";
import {MineProcess} from "os/processes/creep-actions/MineProcess";
import {MoveProcess} from "os/processes/creep-actions/MoveProcess";
import {PickupProcess} from "os/processes/creep-actions/PickupProcess";
import {UpgradeProcess} from "os/processes/creep-actions/UpgradeProcess";
import {RepairProcess} from "os/processes/creep-actions/RepairProcess";
import {WithdrawProcess} from "os/processes/creep-actions/WithdrawProcess";

import {BootstrapperLifeCycleProcess} from "os/processes/life-cycles/BootstrapperLifeCycleProcess";
import {BuilderLifeCycleProcess} from "os/processes/life-cycles/BuilderLifeCycleProcess";
import {MinerLifeCycleProcess} from "os/processes/life-cycles/MinerLifeCycleProcess";
import {UpgraderLifeCycleProcess} from "os/processes/life-cycles/UpgraderLifeCycleProcess";

import {ConstructionManagerProcess} from "os/processes/room/ConstructionManagerProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";
import {RoomSupervisorProcess} from "os/processes/room/RoomSupervisorProcess";
import {SpawnManagerProcess} from "os/processes/room/SpawnManagerProcess";
import {StaticRoomDataProcess} from "os/processes/room/StaticRoomDataProcess";

import {InitProcess} from "os/processes/system/InitProcess";
import {MemoryManagerProcess} from "os/processes/system/MemoryManagerProcess";
import {SuspensionProcess} from "os/processes/system/SuspensionProcess";
import {Constants} from "./Constants";
import {Process} from "./Process";

export const processTypes = {
    bootstrapperLifeCycle: BootstrapperLifeCycleProcess,
    build: BuildProcess,
    builderLifeCycle: BuilderLifeCycleProcess,
    constructionManager: ConstructionManagerProcess,
    deposit: DepositProcess,
    energyManager: EnergyManagementProcess,
    harvest: HarvestProcess,
    init: InitProcess,
    memoryManager: MemoryManagerProcess,
    mine: MineProcess,
    minerLifeCycle: MinerLifeCycleProcess,
    move: MoveProcess,
    pickup: PickupProcess,
    repair: RepairProcess,
    roomSupervisor: RoomSupervisorProcess,
    spawnManager: SpawnManagerProcess,
    staticRoomData: StaticRoomDataProcess,
    suspension: SuspensionProcess,
    upgrade: UpgradeProcess,
    upgraderLifeCycle: UpgraderLifeCycleProcess,
    withdraw: WithdrawProcess
} as { [type: string]: any };

interface ProcessTable {
    [name: string]: Process;
}

export class Kernel {

    private cpuLimit: number;

    public processTable: ProcessTable = {};

    private sortedProcesses: string[] = [];

    private messageLog: MessageLogItem[] = [];

    /**
     * Initializes the memory if needed, sets the CPU limit and than loads the process table
     */
    constructor() {
        if (!Memory.jkbot) {
            Memory.jkbot = {};
        }

        this.log("init kernel", "running constructor");

        this.cpuLimit = this.defineCpuLimit();
        this.loadProcessTable();

        this.addProcess("init", "init", Constants.PRIORITY_FIRST, {});
    }

    /**
     * Adds a new process to the process table
     *
     * @param {T} processType
     * @param {string} name
     * @param {number} priority
     * @param meta
     * @param {string} parent
     */
    public addProcess<T extends ProcessTypes>(processType: T, name: string, priority: number, meta: any, parent?: string) {
        this.processTable[name] = new processTypes[processType]({
            metaData: meta,
            name,
            parent,
            priority,
            suspend: false
        }, this);

        this.sortedProcesses = [];
    }

    /**
     * Defines the CPU limit for the kernel
     */
    public defineCpuLimit() {

        // Simulator has no limit
        if (Game.cpu.limit === undefined) {
            return 1000;
        }

        return Game.cpu.tickLimit * 0.95;
    }

    /**
     * Indicates wether the current tick is within the CPU limit or not
     *
     * @returns {boolean}
     */
    public stillUnderCpuLimit() {
        return (Game.cpu.getUsed() < this.cpuLimit);
    }

    /**
     * Loads the process table from memory
     */
    public loadProcessTable() {
        let kernel = this;

        _.forEach(Memory.jkbot.processTable, function(entry: any) {
            if (processTypes[entry.type]) {
                kernel.processTable[entry.name] = new processTypes[entry.type](entry, kernel);
            } else {
                kernel.log("Load process table", "Tried loading process without type: " + entry.name, "error");
            }
        });

    }

    /**
     * Checks if a process with a given name exists in the process table
     *
     * @param {string} name
     * @returns {boolean}
     */
    public hasProcess(name: string) {
        return (!!this.getProcessByName(name));
    }

    /**
     * Gets a process by name
     *
     * @param {string} name
     * @returns {Process}
     */
    public getProcessByName(name: string): any {
        return this.processTable[name];
    }

    public getProcessByRoomAndType(room: string, type: string): Process | null {
        let processName = type + "-" + room;

        if (this.hasProcess(processName)) {
            return this.processTable[processName];
        } else {
            return null;
        }
    }

    /**
     * Returns the process with the highest priority
     *
     * @returns {Process}
     */
    public getHighestPriorityProcess() {
        if (!this.sortedProcesses.length) {
            let toRunProcesses = _.filter(this.processTable, function(entry: Process) {
                return (!entry.hasAlreadyRun && entry.suspend === false );
            });

            let sorted = _.sortBy(toRunProcesses, "priority").reverse();
            this.sortedProcesses = _.map(sorted, "name");
        }

        let name = this.sortedProcesses.shift()!;

        return this.processTable[name!];
    }

    /**
     * Runs the next process in the que
     */
    public runNextProcess() {
        let processToRun = this.getHighestPriorityProcess();

        if (processToRun.suspend === false) {
            try {
                processToRun.run();
            } catch (e) {
                this.log(processToRun.name, "ERROR: " + e.message, "error");
                this.log(processToRun.name, "STACK: " + e.stack, "error");
            }
        }

        this.log("Next process", "Finished process => " + processToRun.name, "debug");

        processToRun.hasAlreadyRun = true;
    }

    /**
     * Saves the current process table to memory so it can be restored on the next tick
     */
    public shutdown() {
        let processList: SerializedProcess[] = [];
        _.forEach(this.processTable, function(entry: Process) {
            if (!entry.completed) {
                processList.push(entry.serialize());
            }
        });

        Memory.jkbot.processTable = processList;

        for (let name in Game.rooms) {

            let room = Game.rooms[name];

            if (room && room.memory.spawns && room.memory.spawns.length) {
                for (let spawnCount = 0; spawnCount < room.memory.spawns.length; spawnCount++) {
                    if (room.memory.spawns[spawnCount].spawning > 0) {
                        room.memory.spawns[spawnCount].spawning--;
                    }
                }
            }

        }

        this.log("Final", "Processes count: " + processList.length, "info");
        this.log("Final", "total CPU used: " + Game.cpu.getUsed(), "info");

        console.log(this.buildMessageLogTable());
    }

    /**
     * Adds a new message to the log
     *
     * @param {string} process
     * @param {string} message
     * @param {string} type
     */
    public log(process: string, message: string, type: string = "debug") {
        this.messageLog.push({processName: process, message, type, cpu: Game.cpu.getUsed()});
    }

    /**
     * Returns whether there's still processes to run or not
     *
     * @returns {boolean}
     */
    public AnyProcessesLeftToRun() {
        return _.filter(this.processTable, function(process: Process) {
            return (!process.hasAlreadyRun && process.suspend === false);
        }).length > 0;
    }

    /**
     * Generates a table overview of all the current log messages and clears them out
     *
     * @returns {string}
     */
    private buildMessageLogTable(): string {
        let output: string = "";

        output += "<table cellpadding='4'>";

        output +=
            "<tr>" +
            "   <th>Tick</th>" +
            "   <th>Process</th>" +
            "   <th>Message</th>" +
            "   <th>CPU</th>" +
            "</tr>";

        _.forEach(this.messageLog, function(entry: MessageLogItem) {

            if (!Memory.jkbot.debug && entry.type === "debug") {
                return;
            }

            let color = "";
            switch (entry.type) {
                case "debug":
                    color = "#e4e4e4";
                    break;
                case "error":
                    color = "#FF4500";
                    break;
                case "info":
                    color = "green";
                    break;
                default:
                    color = "#ffffff";
                    break;
            }

            output +=
                "<tr style='color: " + color + ";'>" +
                "   <td> " + Game.time + " </td>" +
                "   <td> " + entry.processName + " </td>" +
                "   <td> " + entry.message + " </td>" +
                "   <td> " + entry.cpu + " </td>" +
                "</tr>";
        });

        output += "</table>";

        this.messageLog = [];

        return output;
    }

    /**
     * Returns the spawn maanger process for a given room
     *
     * @param {string} roomName
     * @returns {SpawnManagerProcess | any}
     */
    public getSpawnManagerForRoom(roomName: string): SpawnManagerProcess | false {
        let processName = "spawnManager-" + roomName;

        if (this.hasProcess(processName)) {
            return this.processTable[processName] as SpawnManagerProcess;
        } else {
            return false;
        }
    }

}
