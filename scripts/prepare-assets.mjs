import sharp from 'sharp';
import {readdir,copyFile} from 'node:fs/promises';
for(let i=0;i<96;i++){
 const filename=`frame_${String(i).padStart(3,'0')}`;
 await Promise.all([sharp(`frames-hq/${filename}.jpg`).resize(1440).webp({quality:76}).toFile(`assets/sequence/desktop/${filename}.webp`),sharp(`frames-hq/${filename}.jpg`).resize(800).webp({quality:70}).toFile(`assets/sequence/mobile/${filename}.webp`)]);
}
await sharp('frames-hq/frame_000.jpg').resize(1440).webp({quality:84}).toFile('assets/images/orbit-poster.webp');
await sharp('frames-hq/frame_095.jpg').resize(1200).webp({quality:80}).toFile('assets/images/orbit-wide.webp');
for(const name of ['bricolage-grotesque','dm-sans']){
 const dir=`node_modules/@fontsource-variable/${name}`;
 for(const f of await readdir(`${dir}/files`)) if(f===`${name}-latin-wght-normal.woff2`) await copyFile(`${dir}/files/${f}`,`assets/fonts/${name}.woff2`);
 await copyFile(`${dir}/LICENSE`,`assets/fonts/${name}-LICENSE`);
}
