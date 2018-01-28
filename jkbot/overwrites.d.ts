interface CreepMemory {
    intendedToMove: boolean;
    previousPosition: Point;
    nextAction: string;
}

interface RoomMemory extends RoomMemory {
    sources: RoomDataSources;
    spawns?: SpawnObjectInfo[];
    builders?: number;
    baseStartPoint?: Point;
    baseEndPoint?: Point;
}
