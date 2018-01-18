import {Kernel} from "./os/core/Kernel";
import {ErrorMapper} from "./utils/ErrorMapper";

export const loop = ErrorMapper.wrapLoop(function() {
    console.log("------------------------------------------------------------------------------------------- New tick");
    let kernel = new Kernel();

    while (kernel.stillUnderCpuLimit() && kernel.AnyProcessesLeftToRun()) {
        kernel.runNextProcess();
    }

    kernel.shutdown();
});
