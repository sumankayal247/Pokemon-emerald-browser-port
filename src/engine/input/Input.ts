import type { Direction } from '../state/types';
const keyMap: Record<string,string> = {ArrowDown:'down',ArrowUp:'up',ArrowLeft:'left',ArrowRight:'right',z:'a',Z:'a',x:'b',X:'b',Enter:'start',Shift:'select'};
export class Input {
  private held = new Set<string>(); private pressed = new Set<string>();
  constructor(target: Window = window) {
    target.addEventListener('keydown', e => { const k=keyMap[e.key]; if(!k)return; e.preventDefault(); if(!this.held.has(k))this.pressed.add(k); this.held.add(k); });
    target.addEventListener('keyup', e => { const k=keyMap[e.key]; if(k){e.preventDefault();this.held.delete(k);} });
    target.addEventListener('blur',()=>this.held.clear());
  }
  direction(): Direction | null {
    // GBA field input resolves one cardinal direction; this ordering follows overworld input use.
    if(this.held.has('down'))return 'south'; if(this.held.has('up'))return 'north';
    if(this.held.has('left'))return 'west'; if(this.held.has('right'))return 'east'; return null;
  }
  take(button:'a'|'b'|'start'|'select') { const v=this.pressed.has(button); this.pressed.delete(button); return v; }
  endFrame(){ this.pressed.clear(); }
}
