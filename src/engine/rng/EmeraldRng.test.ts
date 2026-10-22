import { describe,expect,it } from 'vitest';
import { EmeraldRng } from './EmeraldRng';
describe('Emerald RNG',()=>{it('matches pokeemerald ISO_RANDOMIZE1 unsigned sequence',()=>{const rng=new EmeraldRng(0);expect(Array.from({length:5},()=>rng.nextU16())).toEqual([0,59774,21105,12720,36418]);});});
