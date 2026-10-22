export interface MapObject { local_id?:string; graphics_id:string; x:number; y:number; elevation:number; script:string; flag:string; movement_type:string }
export interface BackgroundEvent { type:string;x:number;y:number;elevation:number;script:string }
export interface MapData { source:string;width:number;height:number;blocks:number[];attributes:number[];backgroundEvents:BackgroundEvent[];objects:MapObject[];warps:unknown[] }
export const metatileId=(block:number)=>block&0x3ff;
export const collision=(block:number)=>(block>>10)&3;
export const elevation=(block:number)=>(block>>12)&15;
export const behavior=(map:MapData,block:number)=>(map.attributes[metatileId(block)]??0)&0xff;
export const layer=(map:MapData,block:number)=>((map.attributes[metatileId(block)]??0)>>12)&15;
