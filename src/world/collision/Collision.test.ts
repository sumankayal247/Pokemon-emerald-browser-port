import { describe,expect,it } from 'vitest';
import { canMove, elevationAfterStep } from './Collision';
import type { MapData } from '../maps/types';
const make=(blocks:number[],attrs:number[]=[]):MapData=>({source:'fixture',width:2,height:1,blocks,attributes:attrs,objects:[],backgroundEvents:[],warps:[]});
describe('field collision',()=>{
 it('uses packed map collision bits',()=>expect(canMove(make([0,1<<10]),{x:0,y:0,elevation:0},'east',[])).toBe(false));
 it('accepts open same-elevation tiles',()=>expect(canMove(make([3<<12,3<<12]),{x:0,y:0,elevation:3},'east',[])).toBe(true));
 it('rejects incompatible elevations but permits transition elevation 0',()=>{expect(canMove(make([3<<12,4<<12]),{x:0,y:0,elevation:3},'east',[])).toBe(false);expect(canMove(make([3<<12,0]),{x:0,y:0,elevation:3},'east',[])).toBe(true);});
 it('honors the entered directional edge',()=>{const attrs=[0,0x31];expect(canMove(make([0,1],attrs),{x:0,y:0,elevation:0},'east',[])).toBe(false);});
 it('preserves object elevation on multi-level tiles',()=>{expect(elevationAfterStep(3,15)).toBe(3);expect(elevationAfterStep(3,0)).toBe(0);});
 it('rejects compatible object occupancy',()=>expect(canMove(make([0,0]),{x:0,y:0,elevation:3},'east',[{graphics_id:'x',x:1,y:0,elevation:3,script:'0',flag:'0',movement_type:'x'}])).toBe(false));
});
