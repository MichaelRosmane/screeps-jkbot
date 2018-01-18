import { Process } from "os/core/Process";
import { MetaData } from "typings";

export class BuildProcess extends Process {

  public type = "build";

  public metaData: MetaData["build"];

  public run(): void {
    let creep = Game.creeps[this.metaData.creepName];
    let room = Game.rooms[this.metaData.roomName];

    if (!creep || !room || !this.metaData.target) {
        this.completed = true;
        return;
    }

    if (_.sum(creep.carry) > 0) {
      let site: ConstructionSite | null = Game.getObjectById(this.metaData.target.id);

      if (site) {
        let result = creep.build(site);

        if (result !== OK) {
          this.completed = true;
        }
      } else {
        this.completed = true;
      }
    } else {
      this.completed = true;
    }
  }
}
