import { describe,expect,it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const asset=(name:string)=>readFileSync(new URL(`../../public/assets/littleroot/${name}`,import.meta.url));

describe('Emerald dialogue assets',()=>{
 it('ships a decodable complete Latin glyph sheet',()=>{
  const font=PNG.sync.read(asset('font-normal.png'));
  expect([font.width,font.height]).toEqual([256,512]);
  expect(JSON.parse(asset('font-widths.json').toString())).toHaveLength(512);
 });
 it('ships every source tile used by WindowFunc_DrawDialogueFrame',()=>{
  const frame=PNG.sync.read(asset('message-box.png'));
  expect([frame.width,frame.height]).toEqual([56,16]);
  // Renderer uses tiles through index 10; the source has fourteen 8x8 tiles.
  expect((frame.width/8)*(frame.height/8)).toBeGreaterThan(10);
 });
});
