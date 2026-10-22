import type { GameState, Direction } from '../engine/state/types';
import type { MapData, MapObject } from '../world/maps/types';
import { layer, metatileId } from '../world/maps/types';
const A='/assets/littleroot/', ASSET_VERSION='5';
export class CanvasRenderer {
 private ctx:CanvasRenderingContext2D; private lower=new Image();private upper=new Image();private player=new Image();private twin=new Image();private boy=new Image();private fatMan=new Image();private font=new Image();private messageBox=new Image();private fontWidths:number[]=[];
 constructor(private canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;for(const [i,n] of [[this.lower,'lower.png'],[this.upper,'upper.png'],[this.player,'brendan.png'],[this.twin,'twin.png'],[this.boy,'boy.png'],[this.fatMan,'fat-man.png'],[this.font,'font-normal.png'],[this.messageBox,'message-box.png']] as [HTMLImageElement,string][])i.src=A+n+'?v='+ASSET_VERSION;void fetch(A+'font-widths.json?v='+ASSET_VERSION).then(r=>r.json()).then((widths:number[])=>this.fontWidths=widths); this.resize();addEventListener('resize',()=>this.resize());}
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
 private drawDialogue(text:string){
  if(!this.messageBox.complete||!this.font.complete)return;
  // WindowFunc_DrawDialogueFrame: tilemapLeft 2, top 15, width 27, height 4.
  this.frameTile(1,0,112);this.frameTile(3,8,112);
  for(let x=16;x<=216;x+=8)this.frameTile(4,x,112);
  this.frameTile(5,224,112);this.frameTile(6,232,112);
  for(let y=120;y<=152;y+=8){this.frameTile(7,0,y);for(let x=8;x<=224;x+=8)this.frameTile(9,x,y);this.frameTile(10,232,y);}
  this.frameTile(1,0,152,true);this.frameTile(3,8,152,true);
  for(let x=16;x<=216;x+=8)this.frameTile(4,x,152,true);
  this.frameTile(5,224,152,true);this.frameTile(6,232,152,true);
  text.split('\n').slice(0,2).forEach((line,row)=>this.drawEmeraldText(line,16,120+row*16));
 }
 private frameTile(index:number,x:number,y:number,flipY=false){const sx=(index%7)*8,sy=Math.floor(index/7)*8;if(!flipY)this.ctx.drawImage(this.messageBox,sx,sy,8,8,x,y,8,8);else{this.ctx.save();this.ctx.translate(0,y*2+8);this.ctx.scale(1,-1);this.ctx.drawImage(this.messageBox,sx,sy,8,8,x,y,8,8);this.ctx.restore();}}
 private drawEmeraldText(text:string,x:number,y:number){for(const char of text){const code=this.glyphCode(char),width=this.fontWidths[code]??6;this.ctx.drawImage(this.font,(code%16)*16,Math.floor(code/16)*16,16,16,x,y,16,16);x+=width;}}
 private glyphCode(char:string){
  const n=char.charCodeAt(0);if(char===' ')return 0;if(n>=48&&n<=57)return 0xa1+n-48;if(n>=65&&n<=90)return 0xbb+n-65;if(n>=97&&n<=122)return 0xd5+n-97;
  return ({'!':0xab,'?':0xac,'.':0xad,'-':0xae,'…':0xb0,'“':0xb1,'”':0xb2,"'":0xb4,',':0xb8,'/':0xba,':':0xf0,'é':0x1b,'(':0x5c,')':0x5d,'&':0x2d,'+':0x2e,'=':0x35,';':0x36} as Record<string,number>)[char]??0xac;
 }
}
