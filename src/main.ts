import './style.css';
import { FixedClock } from './engine/clock/FixedClock';
import { Input } from './engine/input/Input';
import { Game } from './engine/game/Game';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import type { MapData } from './world/maps/types';
async function boot(){const canvas=document.querySelector<HTMLCanvasElement>('#game')!;const map=await fetch('/assets/littleroot/map.json').then(r=>r.json()) as MapData;const game=new Game(map),input=new Input(),renderer=new CanvasRenderer(canvas),clock=new FixedClock();clock.start(performance.now());const frame=(now:number)=>{clock.consume(now,()=>game.update(input));renderer.render(game.state,map,game.objects());requestAnimationFrame(frame);};requestAnimationFrame(frame);}
void boot();
