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
    | "pickup"
    | "mine"
    | "minerLifeCycle"
    | "haulerLifeCycle";

// --------------------------------------------------------------------------------------------------------- Interfaces

interface RoomMetaData {
    roomName: string;
}

interface CreepMetaData {
    creepName: string;
}

interface BasicObjectInfo {
    x: number;
    y: number;
    roomName: string;
    id: string;
}

interface SourceObjectInfo extends BasicObjectInfo {
    isMinedBy: {
        harvesters: number;
        miners: number;
        haulers: number;
    };
}

interface SpawnObjectInfo extends BasicObjectInfo {
    spawning: number;
    spawnName: string;
}

interface TargetMetaData {
    target: BasicObjectInfo;
}

interface DropOffMetaData {
    dropOff: BasicObjectInfo | undefined;
}

interface SpawnMetaData {
    spawnQue: CreepToSpawn[];
}

type PickupMetaData = RoomMetaData & CreepMetaData & TargetMetaData & {
    resourceType: ResourceConstant;
};

interface CreepBaseType {
    base: BodyPartConstant[];
    baseCost: number;
    extension?: BodyPartConstant[];
    extensionCost?: number;
    maxExtensionCount?: number;
}

interface CreepConfig {
    parts: BodyPartConstant[];
    cost: number;
    spawnTime: number;
}

interface MoveMetaData  extends RoomMetaData,  TargetMetaData, CreepMetaData {
    path: string;
    previousPositionX: number;
    previousPositionY: number;
    stuck: number;
    range: number | undefined;
}

interface CreepToSpawn {
    type: string;
    processToCreate: ProcessTypes;
    parentProcess?: string;
    priority: number;
    meta?: any;
}

interface NextAction {
    next: string;
}

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

interface RoomSupervisor extends RoomMetaData {
    roomDataSet: boolean;
}

interface MetaData {
    roomSupervisor: RoomSupervisor;
    staticRoomData: RoomMetaData;
    dynamicRoomData: RoomMetaData;
    constructionManager: RoomMetaData;
    energyManager: RoomMetaData;
    spawnManager: RoomMetaData & SpawnMetaData;

    haulerLifeCycle: RoomMetaData & TargetMetaData & CreepMetaData & DropOffMetaData & NextAction;
    harvesterLifeCycle: RoomMetaData & TargetMetaData & CreepMetaData & DropOffMetaData & NextAction;
    builderLifeCycle: RoomMetaData & TargetMetaData & CreepMetaData & NextAction;
    minerLifeCycle: RoomMetaData & TargetMetaData & CreepMetaData & NextAction;

    move: MoveMetaData;
    mine: RoomMetaData & TargetMetaData & CreepMetaData;
    harvest: RoomMetaData & TargetMetaData & CreepMetaData;
    deposit: RoomMetaData & DropOffMetaData & CreepMetaData;
    upgrade: RoomMetaData & CreepMetaData;
    pickup: PickupMetaData;
    build: RoomMetaData & TargetMetaData & CreepMetaData;
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

interface ConstructionList {
    container?: Point[];
    extension?: Point[];
    road?: Point[];
}
