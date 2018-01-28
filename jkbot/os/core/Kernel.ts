import {
    MessageLogItem, ProcessTable, ProcessTypes, RoomDataTable, SerializedProcess,
    SerializedRoomData, SourceObjectInfo, SpawnObjectInfo
} from "../../typings";

import {BuildProcess} from "os/processes/creep-actions/BuildProcess";
import {DepositProcess} from "os/processes/creep-actions/DepositProcess";
import {HarvestProcess} from "os/processes/creep-actions/HarvestProcess";
import {MineProcess} from "os/processes/creep-actions/MineProcess";
import {MoveProcess} from "os/processes/creep-actions/MoveProcess";
import {PickupProcess} from "os/processes/creep-actions/PickupProcess";
import {UpgradeProcess} from "os/processes/creep-actions/UpgradeProcess";

import {BuilderLifeCycleProcess} from "os/processes/life-cycles/BuilderLifeCycleProcess";
import {HarvesterLifeCycleProcess} from "os/processes/life-cycles/HarvesterLifeCycleProcess";
import {HaulerLifeCycleProcess} from "os/processes/life-cycles/HaulerLifeCycleProcess";
import {MinerLifeCycleProcess} from "os/processes/life-cycles/MinerLifeCycleProcess";

import {ConstructionManagerProcess} from "os/processes/room/ConstructionManagerProcess";
import {EnergyManagementProcess} from "os/processes/room/EnergyManagerProcess";
import {RoomSupervisorProcess} from "os/processes/room/RoomSupervisorProcess";
import {SpawnManagerProcess} from "os/processes/room/SpawnManagerProcess";
import {StaticRoomDataProcess} from "os/processes/room/StaticRoomDataProcess";

import {InitProcess} from "os/processes/system/InitProcess";
import {MemoryManagerProcess} from "os/processes/system/MemoryManagerProcess";
import {SuspensionProcess} from "os/processes/system/SuspensionProcess";

import {RoomData} from "os/core/RoomData";
import {Constants} from "./Constants";
import {Process} from "./Process";

export const processTypes = {
    build: BuildProcess,
    builderLifeCycle: BuilderLifeCycleProcess,
    constructionManager: ConstructionManagerProcess,
    deposit: DepositProcess,
    energyManager: EnergyManagementProcess,
    harvest: HarvestProcess,
    harvesterLifeCycle: HarvesterLifeCycleProcess,
    haulerLifeCycle: HaulerLifeCycleProcess,
    init: InitProcess,
    memoryManager: MemoryManagerProcess,
    mine: MineProcess,
    minerLifeCycle: MinerLifeCycleProcess,
    move: MoveProcess,
    pickup: PickupProcess,
    roomSupervisor: RoomSupervisorProcess,
    spawnManager: SpawnManagerProcess,
    staticRoomData: StaticRoomDataProcess,
    suspension: SuspensionProcess,
    upgrade: UpgradeProcess
} as { [type: string]: any };

export class Kernel {

    private cpuLimit: number;

    public processTable: ProcessTable = {};

    public roomDataTable: RoomDataTable = {};

    private sortedProcesses: string[];

    private messageLog: MessageLogItem[] = [];

    /**
     * Initializes the memory if needed, sets the CPU limit and than loads the process table
     */
    constructor() {
        if (!Memory.jkbot) {
            Memory.jkbot = {};
        }

        this.log("init kernel", "running constructor");

        this.setCpuLimit();
        this.loadProcessTable();
        this.loadRoomDataTable();

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
     * Sets the CPU limit for the kernel
     */
    public setCpuLimit() {

        // Simulator has no limit
        if (Game.cpu.limit === undefined) {
            this.cpuLimit = 1000;
            return;
        }

        this.cpuLimit = Game.cpu.tickLimit * 0.95;
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
     * Loads the room data table from memory
     */
    public loadRoomDataTable() {
        let kernel = this;

        _.forEach(Memory.jkbot.roomDataTable, function(entry: SerializedRoomData) {
            kernel.roomDataTable[entry.name] = new RoomData(entry);
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
     * Checks if a given room already has data
     * @param name
     * @returns {boolean}
     */
    public hasRoomData(name: string) {
        return (!!this.getRoomDataByName(name));
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

    /**
     * Gets RoomData by room name
     *
     * @param {string} name
     * @returns {RoomData}
     */
    public getRoomDataByName(name: string): RoomData {
        return this.roomDataTable[name];
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
                this.log(processToRun.name, "ERROR: " + e, "error");
            }
        }

        processToRun.cleanUp();

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

        let roomDataList: SerializedRoomData[] = [];
        _.forEach(this.roomDataTable, function(entry: RoomData) {
            entry.progressSpawns();
            roomDataList.push(entry.serialize());
        });

        Memory.jkbot.roomDataTable = roomDataList;

        this.log("Final", "Processes count: " + processList.length, "info");
        this.log("Final", "Room data count: " + roomDataList.length, "info");
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
     * Adds a new RoomData entry to the table
     *
     * @param {string} name
     * @param {SourceObjectInfo[]} sources
     * @param {SpawnObjectInfo[]} spawns
     * @param {number} rcl
     */
    public addRoomData(name: string, sources: SourceObjectInfo[], spawns: SpawnObjectInfo[], rcl: number) {
        this.roomDataTable[name] = new RoomData({
            builders: 0,
            name,
            rcl,
            sources,
            spawns
        });
    }

    /**
     * Updates the given roomdata object
     *
     * @param {RoomData} data
     */
    public updateRoomData(data: RoomData) {
        this.roomDataTable[data.name] = data;
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

}
