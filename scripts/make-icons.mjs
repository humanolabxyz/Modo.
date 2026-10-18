// Genera los iconos de la PWA. Requiere `sharp` (ya instalado como dependencia de Astro). Uso: node scripts/make-icons.mjs
import sharp from 'sharp';
import {mkdirSync,writeFileSync} from 'node:fs';
const BG='#15191e';
const bolt=(size,scale)=>{const s=size*scale,o=(size-s)/2,p=([x,y])=>`${o+x*s/24},${o+y*s/24}`;return `<polygon fill="#fff" points="${[[13,2],[3,14],[12,14],[11,22],[21,10],[12,10]].map(p).join(' ')}"/>`};
const svg=(size,{radius=0,scale})=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>${bolt(size,scale)}</svg>`;
const out='public/icons';mkdirSync(out,{recursive:true});
const targets=[['icon-192.png',192,{radius:44,scale:.62}],['icon-512.png',512,{radius:112,scale:.62}],['icon-maskable-512.png',512,{radius:0,scale:.46}],['apple-touch-icon.png',180,{radius:0,scale:.58}]];
for(const [name,size,o] of targets)await sharp(Buffer.from(svg(size,o))).png().toFile(`${out}/${name}`);
writeFileSync(`${out}/icon.svg`,svg(512,{radius:112,scale:.62}));
console.log('Iconos generados en',out);
