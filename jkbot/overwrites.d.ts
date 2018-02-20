interface CreepMemory {
    intendedToMove: boolean;
    previousPosition: Point;
    nextAction: string;
    stuck: number;
    target: BasicObjectInfo;
}

interface RoomMemory {
    sources: {[sourceId: string]: SourceObjectInfo};
    spawns: SpawnObjectInfo[];
    builders: number;
    upgraders: number;
    baseStartPoint?: Point;
    baseEndPoint?: Point;
    rcl?: number;
}
