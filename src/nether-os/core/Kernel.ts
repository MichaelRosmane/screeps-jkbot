export class Kernel {

    cpuLimit: number;

    processTable: ProcessTable = {};

    constructor() {
        if(!Memory.netheros) {
            Memory.netheros = {};
        }

        this.setCpuLimit();
        this.loadProcessTable();

        // TODO add init process
    }

    addProcess() {
        // TODO
    }

    setCpuLimit(){
        this.cpuLimit = Game.cpu.limit * 0.9;
    }

    stillUnderCpuLimit() {
        // TODO
    }

    loadProcessTable() {
        // TODO
    }

    hasProcess(name: string) {
        // TODO
    }

    getProcessByName() {
        // TODO
    }

    getHighestPriorityProcess() {
        // TODO
    }

    runNextProcess() {
        // TODO
    }

}