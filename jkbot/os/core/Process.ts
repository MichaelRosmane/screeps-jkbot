import { MetaData, ProcessTypes, SerializedProcess } from "../../typings";

import { Constants } from "./Constants";
import { Kernel } from "./Kernel";
import { RoomData } from "os/core/RoomData";
import { debug } from "util";

export abstract class Process {
    public completed: boolean = false;

    public name: string;

    public priority: number;

    public kernel: Kernel;

    public abstract type: string;

    public abstract metaData: any;

    public suspend: string | number | boolean = false;

    public parent: Process | undefined;

    public hasAlreadyRun: boolean;

    protected roomData: RoomData | false;

    /**
     * Sets up a new Process object
     *
     * @param {SerializedProcess} entry
     * @param {Kernel} kernel
     */
    constructor(entry: SerializedProcess, kernel: Kernel) {
        this.kernel = kernel;

        this.name = entry.name;
        this.priority = entry.priority;
        this.metaData = entry.metaData;
        this.suspend = entry.suspend;
        this.hasAlreadyRun = false;

        if (entry.parent !== "") {
            this.parent = this.kernel.getProcessByName(entry.parent);
        }

        if (this.metaData.roomName) {
          this.roomData = this.getRoomData(this.metaData.roomName);
        } else {
          this.roomData = false;
        }

    }

    /**
     * Empty 'run' function that has to be defined in the child classes
     */
    public abstract run(): void;

    /**
     * Serializes the process for storage
     *
     * @returns {SerializedProcess}
     */
    public serialize() {
        let parentProcess = "";

        if (this.parent) {
            parentProcess = this.parent.name;
        }

        return {
            metaData: this.metaData,
            name: this.name,
            parent: parentProcess,
            priority: this.priority,
            suspend: this.suspend,
            type: this.type
        } as SerializedProcess;
    }

    /**
     * Resumes the process
     */
    public resume() {
        this.suspend = false;
    }

    /**
     * Resumes the parent process
     */
    public resumeParent() {
        if (this.parent) {
            this.parent.resume();
        }
    }

    /**
     * Spawns a child process for the current process, possibly suspending the current process
     *
     * @param {T} processType
     * @param {string} name
     * @param {number} priority
     * @param meta
     * @param {boolean} suspendParent
     */
    public spawnChildProcess<T extends ProcessTypes>(processType: T, name: string, priority: number, meta: any, suspendParent: boolean = false) {
        this.kernel.addProcess(processType, name, priority, meta, this.name);

        if (suspendParent) {
            this.suspend = name;
        }
    }

    /**
     * Sends a message to the kernel's log
     *
     * @param {string} message
     * @param {string} type
     */
    public log(message: string, type = "debug") {
        this.kernel.log(this.name, message, type);
    }

    /**
     * Grabs RoomData from the kernel
     *
     * @param {string} name
     * @returns {RoomData}
     */
    public getRoomData(name: string): RoomData {
      return this.kernel.getRoomDataByName(name);
    }

    public ensureRoomDataExists() {
      if (!this.roomData) {
        this.roomData = this.getRoomData(this.metaData.roomName);
      }

      return this.roomData;
    }

    public cleanUp(): void {
      if (this.roomData) {
        this.kernel.updateRoomData(this.roomData);
      }
    }
}
