import './style.css';
import { FixedClock } from './engine/clock/FixedClock';
import { Input } from './engine/input/Input';
import { Game } from './engine/game/Game';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import type { MapData } from './world/maps/types';

async function boot(){
 const canvas=document.querySelector<HTMLCanvasElement>('#game')!;
 const map=await fetch('/assets/littleroot/map.json').then(r=>{if(!r.ok)throw new Error(`Map load failed: ${r.status}`);return r.json();}) as MapData;
 const game=new Game(map),input=new Input(),renderer=new CanvasRenderer(canvas),clock=new FixedClock();
 clock.start(performance.now());
 let reportedRenderError=false;
 const frame=(now:number)=>{
  try{
   clock.consume(now,()=>game.update(input));
   renderer.render(game.state,map,game.objects());
  }catch(error){
   // A presentation failure must not halt gameplay or permanently kill the RAF loop.
   if(!reportedRenderError){console.error('Emerald render frame failed',error);reportedRenderError=true;}
  }finally{requestAnimationFrame(frame);}
 };
 requestAnimationFrame(frame);
}
void boot();
