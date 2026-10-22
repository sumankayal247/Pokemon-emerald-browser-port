import type { Direction, Position } from '../../engine/state/types';
import type { MapData, MapObject } from '../maps/types';
import { behavior, collision, elevation } from '../maps/types';
const vector:Record<Direction,[number,number]>={south:[0,1],north:[0,-1],west:[-1,0],east:[1,0]};
// Function names describe the blocked edge: moving south enters through a tile's north edge.
const destinationBlocked:Record<Direction,Set<number>>={
 south:new Set([0x32,0x34,0x35]), north:new Set([0x33,0x36,0x37]),
 west:new Set([0x30,0x34,0x36]), east:new Set([0x31,0x35,0x37])
};
const opposite:Record<Direction,Direction>={south:'north',north:'south',west:'east',east:'west'};
/** Reference: event_object_movement.c GetCollisionAtCoords and IsMetatileDirectionallyImpassable. */
export function destination(pos:Position,direction:Direction){const [x,y]=vector[direction];return{x:pos.x+x,y:pos.y+y};}
export function canMove(map:MapData,pos:Position,direction:Direction,objects:MapObject[]):boolean {
 const next=destination(pos,direction); if(next.x<0||next.y<0||next.x>=map.width||next.y>=map.height)return false;
 const from=map.blocks[pos.y*map.width+pos.x], to=map.blocks[next.y*map.width+next.x];
 if(collision(to)!==0)return false;
 if(destinationBlocked[direction].has(behavior(map,to))||destinationBlocked[opposite[direction]].has(behavior(map,from)))return false;
 const e=elevation(to); if(pos.elevation!==0&&e!==0&&e!==15&&e!==pos.elevation)return false;
 return !objects.some(o=>o.x===next.x&&o.y===next.y&&(o.elevation===0||pos.elevation===0||o.elevation===pos.elevation));
}
