# Nether OS - Screeps

## Process Table

- Init
  - StaticRoomData
  - RoomSupervisor
    - EnergyManagement
      - Spawn
      - HarvesterLifeCycle
        - Move
        - Harvest
        - Deposit
      - MinerLifeCycle
        - Move
        - Harvest
        - Build (container)
      - UpgraderLifeCycle
        - Move
        - Withdraw
        - Upgrade



## Things from slack to implement / keep in mind


Define an interface in a .d.ts file called CreepMemory. If you are using typed screeps this will automatically get merged with the existing interface (of the same name in typed screeps) and anything you add will be available to use across all creeps by default.

If you want specific memory structures for specific creep roles you would need to do something more funky.

====================================================

I just use 1:1 MOVE:CARRY for general-purpose haulers
1:2 for specialized road ones
Divide energy by 150
That gives number of move parts. Double that to get carry parts.
Also cap it at 16 MOVE, 32 CARRY.  In theory 17 MOVE 33 CARRY would work, but I don't bother.

====================================================


thats not the way fatigue works, A creep cant move unless its fatigue is 0, MOVE parts reduce 2 fatigue per part per tick to a minimum of 0. So if you have a creep with 4/7 M/C, it would get rid of 8 fatigue per tick and gain 7 on roads and 14 on plains.
So it will take 2 ticks to cross a plain and 1 tick to cross a road. Exactly the same as 4/8.

====================================================

builders have logic to get off-road while they're building => what about when your builders are in the middle of the base and there is no offroad tiles to go to?

====================================================

a creep should always heal when it has nothing better to do in combat
the order of combat resolution is:
1. apply damage
2. apply healing
3. check to see who is dead.

====================================================

Game.map.describeExits(roomName)

====================================================

make rcl1 & 2 harvesters upgrade as well

====================================================

I simply have it based on time (real time, not ticks). A shard sends a message and if it sees its own message for 15 seconds it will mark it clear and the next shard can jump in. No other shard talks when a shard has a message pending unless 60 seconds have passed since the last time the waiting shard sent something. This ensures communication can take place between all 3 shards every 45 seconds in good conditions or every 3 minutes worst case
So far all 3 shards check in within 60 seconds reliably except when the tick times went above 10 seconds

====================================================

        if(dist <= TOWER_OPTIMAL_RANGE) {
           return TOWER_POWER_ATTACK
        }
        if(dist >= TOWER_FALLOFF_RANGE) {
            return TOWER_POWER_ATTACK  * (1 - TOWER_FALLOFF);
        }
        var towerFalloffPerTile = TOWER_FALLOFF / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
        return TOWER_POWER_ATTACK * (1 - (dist - TOWER_OPTIMAL_RANGE) * towerFalloffPerTile)
        

================

New energy-mover patter 
Filler pattern Restrictions
    Max distance from flag: ALWAYS 4
    puLoc: always movable to using .move(getDirection(theCreep, puLoc))


Flag memory
    dFill: [TOP_LEFT, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT] // Indicates which directions need filling
    puLoc: "id"
    fill: ["id", "id"]

Creep memory
    cI: 0              // Currently moving towards Index, related to dFill
    fN: "flag_name"    // Name of the flag. if distance > 4 travel towards flag.
    aC: ["f","r","g"]  // Current action, "f - fill"  "r - return to flag" "g - grab energy"

Creep action

====================================================
if distance from flag > 4
    moveToFlag
    RETURN

if rangeToFlag == 0
    creep.memory.aC = determineActionRoutine()

if creep.memory.aC == undefined
    RETURN

if creep.memory.aC == g
    if creepEnergy > 0
        if rangeToFlag == 0
            dropEnergyIn flag.memory.fill
        else
            moveToFlag
    else if rangeToPuLoc > 1
        moveTo puLoc
    else
        pickup puLoc
    RETURN

if creepEnergy > 0
    doFillCurrentLocation
    if creepHasFilled
        RETURN
    if rangeToFlag == 4
        creep.memory.aC = "r"
else
    creep.memory.aC = "r"


direction = creep.memory.cM
if creep.memory.aC == "r"
    direction = inverse(creep.memory.cM)
moveTo direction


====================================================


Thinking about have some fun creating a maze at my entrances, with ramparts for myself for quick access... Hoping to confuse enemy pathing as there is a path, just a long one, trough it, so depending on their targeting, it could be real fun

D3matt At the very least you might cost them a lot of CPU :stuck_out_tongue:

D3matt Even better, use automatically swapping public ramparts to force them to go back and forth and recalculate their path constantly.

D3matt (I may or may not have played a lot of tower defense games as a child...)

Joykill Haha me too, that's where I got the idea

They don't even have to be 'strong' ones, just enough so they're not instantly destroyed on an attack

D3matt Oh I disagree. If they're not all maxed out, they're no good. Make them work for it!

It actually has a practical use. If they start to get overwhelmed by damage they have no way to quickly retreat. Your melee creeps can cut them off by going through the ramparts,  and your ranged creeps can keep shooting them as they weave through the maze. I know you meant it as a joke but it might actually be viable.

Joykill it was partially a joke indeed, but the more I think about it, the more i think it might just work, with some tailormade attack  code, it can be circumvented, unless, as you said the walls are actually maxxed out... I'm planning to use a bunker type design, I might just make the maze around the bunker instead off at the exits, that way my towers , wich will be in the bunker, can shoot for longer, woooop woop I'm gonna turn my bases into tower defense games

====================================================






// General energy-per-tick (EPT) goal to aim for
global.SOURCE_GOAL_OWNED = SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / ENERGY_REGEN_TIME;
global.SOURCE_GOAL_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME;
// Optimal number of parts per source (but 1 to 3 more can lower cpu at a minor increase in creep cost)
global.SOURCE_HARVEST_PARTS = SOURCE_ENERGY_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_NEUTRAL = SOURCE_ENERGY_NEUTRAL_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;
global.SOURCE_HARVEST_PARTS_KEEPER = SOURCE_ENERGY_KEEPER_CAPACITY / HARVEST_POWER / ENERGY_REGEN_TIME;

// Number of carry parts needed per lane for fixed pick up and drop off point
global.CARRY_PARTS = (capacity, steps) => Math.ceil(capacity / ENERGY_REGEN_TIME * 2 * steps / CARRY_CAPACITY);
