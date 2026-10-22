import type { GameState, Direction } from '../engine/state/types';
import type { MapData, MapObject } from '../world/maps/types';
import { layer, metatileId } from '../world/maps/types';
const A='/assets/littleroot/';
export class CanvasRenderer {
 private ctx:CanvasRenderingContext2D; private lower=new Image();private upper=new Image();private player=new Image();private twin=new Image();private boy=new Image();private fatMan=new Image();
 constructor(private canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;for(const [i,n] of [[this.lower,'lower.png'],[this.upper,'upper.png'],[this.player,'brendan.png'],[this.twin,'twin.png'],[this.boy,'boy.png'],[this.fatMan,'fat-man.png']] as [HTMLImageElement,string][])i.src=A+n; this.resize();addEventListener('resize',()=>this.resize());}
 private resize(){const scale=Math.max(1,Math.floor(Math.min(innerWidth/240,innerHeight/160)));this.canvas.width=240;this.canvas.height=160;this.canvas.style.width=240*scale+'px';this.canvas.style.height=160*scale+'px';}
 render(state:GameState,map:MapData,objects:MapObject[]){const c=this.ctx;c.imageSmoothingEnabled=false;c.fillStyle='#000';c.fillRect(0,0,240,160);
  const p=state.player,m=p.move,t=m?m.frame/m.frames:0,px=m?m.fromX+(m.toX-m.fromX)*t:p.x,py=m?m.fromY+(m.toY-m.fromY)*t:p.y;
  const cameraX=px*16-112,cameraY=py*16-72;
  this.drawMap(map,this.lower,cameraX,cameraY,()=>true); this.drawMap(map,this.upper,cameraX,cameraY,l=>l===1);
  for(const object of objects) this.drawObject(object,cameraX,cameraY);
  this.drawPlayer(state,cameraX,cameraY);
  this.drawMap(map,this.upper,cameraX,cameraY,l=>l!==1);
  if(state.dialogue)this.drawDialogue(state.dialogue[state.dialoguePage]);
 }
 private drawMap(map:MapData,image:HTMLImageElement,cx:number,cy:number,accept:(layer:number)=>boolean){if(!image.complete)return;for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++){const block=map.blocks[y*map.width+x];if(!accept(layer(map,block)))continue;const id=metatileId(block),dx=Math.round(x*16-cx),dy=Math.round(y*16-cy);if(dx<-16||dy<-16||dx>240||dy>160)continue;this.ctx.drawImage(image,(id%32)*16,Math.floor(id/32)*16,16,16,dx,dy,16,16);}}
 private drawObject(o:MapObject,cx:number,cy:number){const image=o.graphics_id==='OBJ_EVENT_GFX_TWIN'?this.twin:o.graphics_id==='OBJ_EVENT_GFX_BOY_2'?this.boy:o.graphics_id==='OBJ_EVENT_GFX_FAT_MAN'?this.fatMan:null;if(!image?.complete)return;const frame=o.movement_type==='MOVEMENT_TYPE_FACE_UP'?1:0;this.ctx.drawImage(image,frame*16,0,16,32,Math.round(o.x*16-cx),Math.round(o.y*16-cy-16),16,32);}
 private drawPlayer(state:GameState,cx:number,cy:number){if(!this.player.complete)return;const p=state.player,m=p.move;let x=p.x,y=p.y;if(m){const t=m.frame/m.frames;x=m.fromX+(m.toX-m.fromX)*t;y=m.fromY+(m.toY-m.fromY)*t;}const base:Record<Direction,number>={south:0,north:1,west:2,east:2};let frame=base[p.facing],flip=p.facing==='east';if(m){const step=m.frame<8?0:1;frame=p.facing==='south'?(step?4:3):p.facing==='north'?(step?6:5):(step?8:7);}const dx=Math.round(x*16-cx),dy=Math.round(y*16-cy-16);this.ctx.save();if(flip){this.ctx.translate(dx+16,0);this.ctx.scale(-1,1);this.ctx.drawImage(this.player,frame*16,0,16,32,0,dy,16,32);}else this.ctx.drawImage(this.player,frame*16,0,16,32,dx,dy,16,32);this.ctx.restore();}
 private drawDialogue(text:string){const c=this.ctx;c.fillStyle='#f8f8f8';c.fillRect(4,112,232,44);c.strokeStyle='#383838';c.lineWidth=2;c.strokeRect(5,113,230,42);c.strokeStyle='#a8a8a8';c.strokeRect(8,116,224,36);c.fillStyle='#202020';c.font='10px monospace';c.textBaseline='top';text.split('\n').forEach((line,i)=>c.fillText(line,13,120+i*12));}
}
