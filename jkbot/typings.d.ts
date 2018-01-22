import { Process } from './os/core/Process';
import { RoomData } from "./os/core/RoomData"

// -------------------------------------------------------------------------------------------------------------- Types
type ProcessTypes =
"init"
| "suspension"
| "memoryManager"
| "roomSupervisor"
| "energyManager"
| "spawnManager"
| "constructionManager"
| "staticRoomData"
| "dynamicRoomData"
| "constructionManager"
| "harvesterLifeCycle"
| "move"
| "harvest"
| "deposit"
| "upgrade"
| "builderLifeCycle"
| "build"
| "pickup";

type RoomMetaData = {
  roomName: string;
}

type CreepMetaData = {
  creepName: string;
}

type BasicObjectInfo = {
  x: number;
  y: number;
  roomName: string;
  id: string;
}

type SourceObjectInfo = BasicObjectInfo & {
  isMinedBy: {
    harvesters: number;
    miners: number;
  }
}

type SpawnObjectInfo = BasicObjectInfo & {
  spawning: boolean|number;
  spawnName: string;
}

type TargetMetaData = {
  target: BasicObjectInfo;
}

type DropOffMetaData = {
  dropOff: BasicObjectInfo | undefined;
}

type SpawnMetaData = {
  spawnQue: CreepToSpawn[];
}

type PickupMetaData = RoomMetaData & CreepMetaData & TargetMetaData & {
  resourceType: ResourceConstant;
}

type CreepBaseType = {
  base: BodyPartConstant[];
  baseCost: number;
  extension?: BodyPartConstant[];
  extensionCost?: number;
  maxExtensionCount?: number;
}

type CreepConfig = {
  parts: BodyPartConstant[]
  cost: number;
  spawnTime: number;
}

type MoveMetaData = RoomMetaData & TargetMetaData & CreepMetaData & {
  path: string;
  previousPositionX: number;
  previousPositionY: number;
  stuck: number;
  range: number | undefined;
}

type CreepToSpawn = {
  type: string;
  processToCreate: ProcessTypes;
  parentProcess?: string;
  priority: number;
  meta?: any;
}

type NextAction = {
  next: string;
}

// --------------------------------------------------------------------------------------------------------- Interfaces
interface Point {
  x: number;
  y: number;
}

interface WeightedPoint extends Point {
  score: number;
}

interface MessageLogItem {
    processName: string;
    message: string;
    type: string;
    cpu: number;
}

interface CreepTypes {
  [name: string]: CreepBaseType;
}

interface ProcessTable {
  [name: string]: Process;
}

interface MetaData {
  roomSupervisor: RoomMetaData;
  staticRoomData: RoomMetaData;
  dynamicRoomData: RoomMetaData;
  constructionManager: RoomMetaData;
  energyManager: RoomMetaData;
  spawnManager: RoomMetaData & SpawnMetaData;
  harvesterLifeCycle: RoomMetaData & TargetMetaData & CreepMetaData & DropOffMetaData & NextAction;
  builderLifeCycle: RoomMetaData & TargetMetaData & CreepMetaData & NextAction;
  move:  MoveMetaData;
  harvest: RoomMetaData & TargetMetaData & CreepMetaData;
  deposit: RoomMetaData & DropOffMetaData & CreepMetaData;
  upgrade: RoomMetaData & CreepMetaData;
  pickup: PickupMetaData;
  build: RoomMetaData & TargetMetaData & CreepMetaData;
}

interface RoomDataTable {
  [name: string]: RoomData;
}

interface SerializedProcess {
  name: string;
  priority: number;
  metaData: object;
  type: ProcessTypes;
  suspend: string | number | boolean;
  parent: string;
}

interface SerializedRoomData {
  name: string;
  sources: SourceObjectInfo[];
  spawns: SpawnObjectInfo[];
  rcl: number;
  builders: number;
}

interface RoomDataSources {
  [name: string]: SourceObjectInfo;
}

interface ConstructionList {
  container?: Point[];
  extension?: Point[];
  road?: Point[];
}
