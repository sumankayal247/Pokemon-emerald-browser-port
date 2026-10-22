/* Extracts auditable browser assets from pret/pokeemerald. This is data conversion,
 * not ROM execution. See docs/source-map.md for the source-to-runtime mapping. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..');
const pret = path.join(root, 'reference/pokeemerald');
const out = path.join(root, 'public/assets/littleroot');
if (!fs.existsSync(pret)) throw new Error('Clone pret/pokeemerald at reference/pokeemerald first.');
fs.mkdirSync(out, { recursive: true });

function indexedPng(filename) {
  const b = fs.readFileSync(filename);
  const width = b.readUInt32BE(16), height = b.readUInt32BE(20);
  const depth = b[24], colorType = b[25];
  if ((depth !== 2 && depth !== 4) || colorType !== 3) throw new Error(`Expected indexed 2/4bpp PNG: ${filename}`);
  const idats = [];
  for (let p = 8; p < b.length;) {
    const n = b.readUInt32BE(p); const type = b.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') idats.push(b.subarray(p + 8, p + 8 + n));
    p += n + 12;
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const stride = Math.ceil(width * depth / 8), rows = [];
  let previous = Buffer.alloc(stride), at = 0;
  const paeth = (a,b,c) => { const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c); return pa<=pb&&pa<=pc?a:pb<=pc?b:c; };
  for (let y=0;y<height;y++) {
    const filter=raw[at++], row=Buffer.alloc(stride);
    for (let x=0;x<stride;x++) {
      const v=raw[at++], left=x?row[x-1]:0, up=previous[x], ul=x?previous[x-1]:0;
      row[x]=(v+(filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,ul)))&255;
    }
    const pixels = new Uint8Array(width);
    for(let x=0;x<width;x++) {
      if(depth===4) pixels[x] = x&1 ? row[x>>1]&15 : row[x>>1]>>4;
      else pixels[x] = (row[x>>2] >> (6-(x&3)*2)) & 3;
    }
    rows.push(pixels); previous=row;
  }
  return { width, height, rows };
}
function palette(filename) {
  return fs.readFileSync(filename,'utf8').trim().split(/\r?\n/).slice(3).map(line => line.split(' ').map(Number));
}
function u16s(filename) {
  const b=fs.readFileSync(filename), values=[];
  for(let i=0;i<b.length;i+=2) values.push(b.readUInt16LE(i));
  return values;
}
const general='data/tilesets/primary/general', petalburg='data/tilesets/secondary/petalburg';
const primaryTiles=indexedPng(path.join(pret,general,'tiles.png'));
const secondaryTiles=indexedPng(path.join(pret,petalburg,'tiles.png'));
const palettes=[];
for(let i=0;i<13;i++) {
  const owner=i<6?general:petalburg;
  palettes.push(palette(path.join(pret,owner,'palettes',String(i).padStart(2,'0')+'.pal')));
}
const primaryMeta=u16s(path.join(pret,general,'metatiles.bin'));
const secondaryMeta=u16s(path.join(pret,petalburg,'metatiles.bin'));
const primaryAttrs=u16s(path.join(pret,general,'metatile_attributes.bin'));
const secondaryAttrs=u16s(path.join(pret,petalburg,'metatile_attributes.bin'));
const size=512;
function makeAtlas(layer) {
  const png=new PNG({width:size,height:size,colorType:6}); png.data.fill(0);
  for(let id=0;id<1024;id++) {
    const secondary=id>=512, local=secondary?id-512:id;
    const meta=secondary?secondaryMeta:primaryMeta;
    if(local*8+7>=meta.length) continue;
    for(let q=0;q<4;q++) {
      const d=meta[local*8+(layer==='upper'?4:0)+q];
      const tileId=d&0x3ff, source=tileId>=512?secondaryTiles:primaryTiles, localTile=tileId>=512?tileId-512:tileId;
      const sx=(localTile%16)*8, sy=Math.floor(localTile/16)*8, flipX=!!(d&0x400), flipY=!!(d&0x800), pal=palettes[(d>>12)&15]||palettes[0];
      const ox=(id%32)*16+(q&1)*8, oy=Math.floor(id/32)*16+(q>>1)*8;
      for(let y=0;y<8;y++) for(let x=0;x<8;x++) {
        const index=source.rows[sy+(flipY?7-y:y)]?.[sx+(flipX?7-x:x)]||0;
        if(layer==='upper' && index===0) continue;
        const [r,g,b]=pal[index]||[0,0,0], p=((oy+y)*size+ox+x)*4;
        png.data[p]=r; png.data[p+1]=g; png.data[p+2]=b; png.data[p+3]=255;
      }
    }
  }
  fs.writeFileSync(path.join(out,layer+'.png'),PNG.sync.write(png));
}
makeAtlas('lower'); makeAtlas('upper');
const map=u16s(path.join(pret,'data/layouts/LittlerootTown/map.bin'));
const mapJson=JSON.parse(fs.readFileSync(path.join(pret,'data/maps/LittlerootTown/map.json'),'utf8'));
const attributes=[...primaryAttrs];
for(let i=0;i<secondaryAttrs.length;i++) attributes[512+i]=secondaryAttrs[i];
fs.writeFileSync(path.join(out,'map.json'),JSON.stringify({
  source:'pret/pokeemerald data/layouts/LittlerootTown/map.bin + data/maps/LittlerootTown/map.json',
  width:20,height:20,blocks:map,attributes,
  warps:mapJson.warp_events,backgroundEvents:mapJson.bg_events,
  objects:mapJson.object_events
},null,2));
function embeddedPalette(filename) {
  const bytes=fs.readFileSync(filename); let plte;
  for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);if(type==='PLTE')plte=bytes.subarray(p+8,p+8+n);p+=n+12;}
  if(!plte) throw new Error(`No PLTE in ${filename}`);
  return plte;
}
function writeIndexedRgba(from, to, transparentZero) {
  const filename=path.join(pret,from),source=indexedPng(filename),plte=embeddedPalette(filename);
  const png=new PNG({width:source.width,height:source.height,colorType:6});
  for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++){
    const index=source.rows[y][x],p=(y*source.width+x)*4;
    png.data[p]=plte[index*3];png.data[p+1]=plte[index*3+1];png.data[p+2]=plte[index*3+2];png.data[p+3]=transparentZero&&index===0?0:255;
  }
  fs.writeFileSync(path.join(out,to),PNG.sync.write(png));
}
// GBA OBJ/font mode treats palette index 0 as transparent; source PNGs do not
// carry a tRNS chunk because grit applies that rule during the native build.
function writeObjectSprite(from, to) { writeIndexedRgba(from,to,true); }
for(const [from,to] of [
 ['graphics/object_events/pics/people/brendan/walking.png','brendan.png'],
 ['graphics/object_events/pics/people/twin.png','twin.png'],
 ['graphics/object_events/pics/people/boy_2.png','boy.png'],
 ['graphics/object_events/pics/people/fat_man.png','fat-man.png']
]) writeObjectSprite(from,to);
writeIndexedRgba('graphics/fonts/latin_normal.png','font-normal.png',true);
writeIndexedRgba('graphics/text_window/message_box.png','message-box.png',false);
const fontsSource=fs.readFileSync(path.join(pret,'src/fonts.c'),'utf8');
const widthMatch=fontsSource.match(/gFontNormalLatinGlyphWidths\[\]\s*=\s*\{([\s\S]*?)\};/);
if(!widthMatch) throw new Error('Could not locate gFontNormalLatinGlyphWidths');
const fontWidths=(widthMatch[1].match(/\d+/g)||[]).map(Number);
fs.writeFileSync(path.join(out,'font-widths.json'),JSON.stringify(fontWidths));
console.log('Extracted Littleroot map, metatiles, events, transparent sprites, font, and dialogue frame.');
