import { CreepActionProcess } from "os/processes/CreepActionProcess";
import { MetaData } from "typings";

export class BuildProcess extends CreepActionProcess {

  public type = "build";

  public metaData: MetaData["build"];

  public run(): void {
    let creep = Game.creeps[this.metaData.creepName];
    let room = Game.rooms[this.metaData.roomName];

    if (!creep || !room || !this.metaData.target) {
        this.markAsCompleted();
        return;
    }

    if (_.sum(creep.carry) > 0) {
      let site: ConstructionSite | null = Game.getObjectById(this.metaData.target.id);

      if (site && site.id && site.id !== "") {
        let result = creep.build(site);

        if (result !== OK) {
          this.markAsCompleted();
        }
      } else {
        this.log("Invalid construction site received - terminating process", "error");
        this.markAsCompleted();
      }
    } else {
      this.markAsCompleted();
    }
  }
}
