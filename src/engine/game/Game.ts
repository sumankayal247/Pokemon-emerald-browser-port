import type { GameState, Direction } from '../state/types';
import type { MapData, MapObject } from '../../world/maps/types';
import { elevation } from '../../world/maps/types';
import { canMove, destination, elevationAfterStep } from '../../world/collision/Collision';
import { dialogueFor } from '../scripts/LittlerootScripts';
import type { Input } from '../input/Input';
const visibleGraphics=new Set(['OBJ_EVENT_GFX_TWIN','OBJ_EVENT_GFX_BOY_2','OBJ_EVENT_GFX_FAT_MAN']);
export class Game {
 readonly state:GameState;
 constructor(readonly map:MapData) {
  const start={x:10,y:11};
  this.state={frame:0,mapId:'LittlerootTown',player:{...start,elevation:elevation(map.blocks[start.y*map.width+start.x]),facing:'south',previousFacing:'south'},flags:new Set(),variables:new Map([['VAR_LITTLEROOT_TOWN_STATE',0],['VAR_LITTLEROOT_INTRO_STATE',7]]),dialogue:null,dialoguePage:0};
 }
 objects():MapObject[]{return this.map.objects.filter(o=>visibleGraphics.has(o.graphics_id)&&(!o.flag||o.flag==='0'||!this.state.flags.has(o.flag))).map(o=>o.graphics_id==='OBJ_EVENT_GFX_TWIN'&&this.state.variables.get('VAR_LITTLEROOT_TOWN_STATE')===0?{...o,x:7,y:2,movement_type:'MOVEMENT_TYPE_FACE_DOWN'}:o);}
 update(input:Input){const s=this.state,p=s.player;s.frame++;
  if(s.dialogue){if(input.take('a')||input.take('b')){if(s.dialoguePage<s.dialogue.length-1)s.dialoguePage++;else{s.dialogue=null;s.dialoguePage=0;}}input.endFrame();return;}
  if(p.move){p.move.frame++;if(p.move.frame>=p.move.frames){p.x=p.move.toX;p.y=p.move.toY;p.elevation=elevationAfterStep(p.elevation,elevation(this.map.blocks[p.y*this.map.width+p.x]));p.move=undefined;}input.endFrame();return;}
  if(input.take('a'))this.interact();
  const direction=input.direction();if(direction){if(direction!==p.facing){p.previousFacing=p.facing;p.facing=direction;}else if(canMove(this.map,p,direction,this.objects())){const to=destination(p,direction);p.move={fromX:p.x,fromY:p.y,toX:to.x,toY:to.y,frame:0,frames:16};}}
  input.endFrame();
 }
 private interact(){const p=this.state.player,to=destination(p,p.facing);const object=this.objects().find(o=>o.x===to.x&&o.y===to.y);const background=this.map.backgroundEvents.find(e=>e.x===to.x&&e.y===to.y);const pages=dialogueFor(object?.script??background?.script??'');if(pages){this.state.dialogue=pages;this.state.dialoguePage=0;}}
}
