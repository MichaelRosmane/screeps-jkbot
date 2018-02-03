interface CreepMemory {
    intendedToMove: boolean;
    previousPosition: Point;
    nextAction: string;
    stuck: number;
}

interface RoomMemory {
    sources: {[sourceId: string]: SourceObjectInfo};
    spawns: SpawnObjectInfo[];
    builders: number;
    baseStartPoint?: Point;
    baseEndPoint?: Point;
    rcl?: number;
}
