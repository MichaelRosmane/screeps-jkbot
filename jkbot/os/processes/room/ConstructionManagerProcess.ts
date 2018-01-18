import { Constants } from "os/core/Constants";
import { Rcl2Constructions } from "os/helpers/construction/Rcl2Constructions";
import { BasicObjectInfo, MetaData, Point, WeightedPoint, ConstructionList } from "../../../typings";
import { Process } from "../../core/Process";
import { SpawnManagerProcess } from "./SpawnManagerProcess";

export class ConstructionManagerProcess extends Process {
  public metaData: MetaData["constructionManager"];

  public type = "constructionManager";

  private roomMap: string[][] = [];

  private layoutDimensions = 13;

  private displayOverlay = true;

  private room: Room;

  private sites: ConstructionSite[];

  private buildingPriorities = ["container", "extension", "road"];

  public run() {
    this.room = Game.rooms[this.metaData.roomName];
    this.sites = this.room.find(FIND_CONSTRUCTION_SITES);

    this.queBuilderIfNeeded();
    this.checkControllerWallSites();
    this.placeConstructionSitesForBase();

    // this.roomMap = this.generateMap();
    // this.lookForSuitableSpot();
  }

  public getConstructionSite(): BasicObjectInfo {
    let site = this.sites.shift();
    if (site) {

      this.log("construction site id:" + site.id, "error");
      return {
        id:  site.id,
        roomName: this.metaData.roomName,
        x: site.pos.x,
        y: site.pos.y
      };
    } else {
      return {x: 0, y: 0, id: "", roomName: ""};
    }
  }

  public hasConstructionSites(): boolean {
    return (this.sites.length > 0);
  }

  private queBuilderIfNeeded() {
    let sites = this.sites;
    let spawnManagerProcessName = "spawnManager-" + this.metaData.roomName;
    let spawnManager: SpawnManagerProcess = this.kernel.getProcessByName(spawnManagerProcessName)!;

    if (!this.roomData) {
      this.roomData = this.getRoomData(this.metaData.roomName);
    }

    if (!sites.length) {
      return;
    }

    if (!this.roomData.builders) {
      spawnManager.addCreepToSpawnQue({
        meta: {},
        parentProcess: this.name,
        priority: Constants.PRIORITY_LOW,
        processToCreate: "builderLifeCycle",
        type: "builder"
      });
      this.roomData.builders++;
    }
  }

  private checkControllerWallSites() {
    if ((Game.time % 200 !== 0) || !this.room.controller || !this.room.controller.my || (this.room.controller.level === 1) ) {
      return;
    }

    let pos = this.room.controller.pos;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        let result = this.room.createConstructionSite(pos.x + x, pos.y + y, STRUCTURE_WALL);
      }
    }
  }

  public lookForSuitableSpot() {
    let room = this.room;
    let sources = room.find(FIND_SOURCES);

    let xMin = 2;
    let xMax = 49 - this.layoutDimensions;
    let yMin = 2;
    let yMax = 49 - this.layoutDimensions;

    let currentX = xMin;
    let currentY = yMin;

    let visual = new RoomVisual(this.metaData.roomName);
    let process = this;

    let validStartingPoints: Point[] = [];
    let centerPoints: Point[] = [];
    let sourcePoints: Point[] = [];
    let sortedCenters: WeightedPoint[] = [];

    for (currentX = xMin; currentX < xMax; currentX++) {
      for (currentY = yMin; currentY < yMax; currentY++) {
        if (this.isValidSpot(currentX, currentY)) {
          validStartingPoints.push({x: currentX, y: currentY});
          centerPoints.push({x: currentX + 6, y: currentY + 6});
        }
      }
    }

    _.forEach(sources, function(source: Source) {
      sourcePoints.push({x: source.pos.x, y: source.pos.y});
    });

    _.forEach(centerPoints, function(point) {
        let distances = 0;
        let position = new RoomPosition(point.x, point.y, process.metaData.roomName);
        let divideBy = 0;

        if (room.controller) {
          let rangeToController = position.getRangeTo(room.controller.pos.x, room.controller.pos.y );

          if (rangeToController <= 10) {
            distances += 10000;
          }

          divideBy++;
          distances += rangeToController;
        }

        let rangeToCenter = position.getRangeTo(25, 25);
        distances += rangeToCenter;
        divideBy++;

        _.forEach(sourcePoints, function(source) {
          distances += position.getRangeTo(source.x, source.y);
          divideBy++;
        });

        distances = distances / divideBy;
        sortedCenters.push({x: point.x, y: point.y, score: distances});
    });

    sortedCenters = _.slice( _.sortByOrder(sortedCenters, "score", "asc"), 0, 5);

    if (Memory.jkbot.debug) {
      _.forEach(validStartingPoints, function(point) {
        visual.rect(point.x, point.y, process.layoutDimensions, process.layoutDimensions, {fill: "transparent", stroke: "#f00"});
      });

      let count = 0;
      _.forEach(sortedCenters, function(point) {
        count++;
        visual.text(count.toString(), new RoomPosition(point.x, point.y, process.metaData.roomName));
      });
    }
  }

  public isValidSpot(x: number, y: number) {
    for (let xCount = 0; xCount <= this.layoutDimensions; xCount++) {
      for (let yCount = 0; yCount <= this.layoutDimensions; yCount++) {
        if (this.roomMap[x + xCount][y + yCount] === "w") {
          return false;
        }
      }
    }

    return true;
  }

  public generateMap() {
    let roomName = this.metaData.roomName;
    let roomMap: string[][] = [];

    for (let x = 0; x < 50; x++) {
      roomMap[x] = [];
      for (let y = 0; y < 50; y++) {
        let terrain = Game.map.getTerrainAt(x, y, roomName);
        roomMap[x][y] = terrain.charAt(0);
      }
    }

    return roomMap;
  }

  public displayMap() {

    let visual = new RoomVisual(this.metaData.roomName);

    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        visual.text(this.roomMap[x][y], new RoomPosition(x, y, this.metaData.roomName));
      }
    }
  }

  private placeConstructionSitesForBase() {
    if (!this.roomData) {
      this.roomData = this.getRoomData(this.metaData.roomName);
    }

    let buildings: ConstructionList | boolean = false;
    switch(this.roomData.rcl) {
      case 2:
        buildings = Rcl2Constructions;
        break;
    }
  }

}
