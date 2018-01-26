import { Process } from "os/core/Process";

export abstract class CreepActionProcess extends Process {

  /**
   * Marks the current process as completed and (optionally) resumes the parent
   *
   * @param {boolean} resumeParent
   */
  protected markAsCompleted(resumeParent: boolean = true) {
    this.completed = true;

    if (resumeParent) {
      this.resumeParent();
    }
  }
}
