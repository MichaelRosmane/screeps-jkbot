interface CreepMemory {
    intendedToMove: boolean;
    previousPosition: Point;
    nextAction: string;
}

interface RoomMemory {
    sources: {[sourceId: string]: SourceObjectInfo};
    spawns: SpawnObjectInfo[];
    builders: number;
    baseStartPoint?: Point;
    baseEndPoint?: Point;
}