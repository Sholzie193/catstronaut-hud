import {mkdir,writeFile,copyFile,cp,rm} from 'node:fs/promises';
import {pages} from '../src/pages.mjs';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const [route,html] of pages){const dest=route==='/'?'dist/index.html':`dist${route}.html`;await mkdir(dest.slice(0,dest.lastIndexOf('/')),{recursive:true});await writeFile(dest,html)}
await cp('assets','dist/assets',{recursive:true});
for(const f of ['styles.css','app.mjs','motion.mjs','effects.mjs','booking.mjs','data.mjs','booking-domain.mjs'])await copyFile(`src/${f}`,`dist/${f}`);
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://catstronaut-hud.vercel.app/sitemap.xml\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages.keys()].filter(p=>!['/404','/my-visits','/book'].includes(p)).map(p=>`<url><loc>https://catstronaut-hud.vercel.app${p}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.size} static pages.`);
