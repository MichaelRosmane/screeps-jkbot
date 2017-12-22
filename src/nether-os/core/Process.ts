import {Kernel} from 'Kernel'

export class Process {
    completed: boolean = false;

    name: string;

    priority: number;

    kernel: Kernel;

    type: string;

    metaData: any;

    suspend: string | number | boolean = false

    parent: Process | boolean = false;


    // build new process from serializable processinfo
    constructor(entry: SerializedProcess, kernel: Kernel) {
        this.kernel = kernel;

        this.name = entry.name;
        this.priority = entry.priority;
        this.metaData = entry.metaData;

        if(entry.parent) {
            this.parent = this.kernel.processTable[entry.parent];
        }

    }

    run() {
        // TODO
    }

    serialize() {
        // TODO
    }

    resume() {
        // TODO
    }

    resumeParent() {
        // TODO
    }

    spawnChildProcess() {
        // TODO
    }

}