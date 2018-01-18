export class PathingHelper {

  /**
   * Serializes an array of RoomPosition objects into a string
   *
   * @param {RoomPosition[]} path
   * @param {boolean} removeFirst
   * @returns {string}
   */
  public static serializePath(path: RoomPosition[], removeFirst: boolean): string {
    let pathForStorage = "";

    if (removeFirst) {
        path.shift();
    }

    _.forEach(path, function(pos: RoomPosition) {
        pathForStorage += pos.x + ";" + pos.y + ";" + pos.roomName + "|";
    });

    return pathForStorage;
  }

  /**
   * Deserializes a path string back into an array of RoomPosition objects
   *
   * @returns {RoomPosition[]}
   */
  public static deserializePath(serializedPath: string): RoomPosition[] {
      let parts = serializedPath.split("|");

      let path: RoomPosition[] = [];
      _.forEach(parts, function(part: string) {

          if (part === "") {
              return;
          }

          let subParts = part.split(";");
          path.push(new RoomPosition(Number(subParts[0]), Number(subParts[1]), subParts[2]));
      });

      return path;
  }
}
