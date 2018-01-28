import {Process} from "../../core/Process";

export class SuspensionProcess extends Process {
    public metaData: any;

    public type = "suspension";

    public run() {
        let kernel = this.kernel;

        let processes = _.filter(kernel.processTable, function(process: Process) {
            return (!process.suspend === false) && (!process.completed);
        });

        _.forEach(processes, function(process: Process) {
            process.hasAlreadyRun = true;

            if (typeof process.suspend === "number") {
                process.suspend--;
                if (process.suspend === 0) {
                    process.resume();
                }
            } else if (typeof process.suspend === "string") {
                if (!kernel.hasProcess(process.suspend)) {
                    process.resume();
                }
            }
        });
    }

}
