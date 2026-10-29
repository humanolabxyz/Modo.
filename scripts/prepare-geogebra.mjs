import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync,cpSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version='5.4.933.1',sha256='409095947e065bce5bde20b8a6d56a60e2b3cb3cce6947e817a802513515ec0c';
const source='https://download.geogebra.org/installers/5.4/geogebra-math-apps-bundle-5-4-933-1.zip';
const cache=path.join(root,'.cache','offline'),zip=path.join(cache,'geogebra-math-apps-bundle-5-4-933-1.zip'),unpacked=path.join(cache,`geogebra-${version}`),destination=path.join(root,'public','vendor','geogebra');
mkdirSync(cache,{recursive:true});
if(!existsSync(zip)){
 console.log('Descargando GeoGebra oficial para uso educativo sin conexión (32 MB)…');
 const response=await fetch(source,{signal:AbortSignal.timeout(120000)});if(!response.ok)throw new Error(`GeoGebra: HTTP ${response.status}`);
 const bytes=Buffer.from(await response.arrayBuffer());if(createHash('sha256').update(bytes).digest('hex')!==sha256)throw new Error('La descarga no coincide con la versión verificada.');writeFileSync(zip,bytes);
}
if(createHash('sha256').update(readFileSync(zip)).digest('hex')!==sha256)throw new Error('El ZIP local está incompleto o es de otra versión.');
if(!existsSync(path.join(unpacked,'GeoGebra','deployggb.js'))){
 if(process.platform==='win32')execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath $env:MODO_BUNDLE_ZIP -DestinationPath $env:MODO_BUNDLE_OUT -Force'],{windowsHide:true,env:{...process.env,MODO_BUNDLE_ZIP:zip,MODO_BUNDLE_OUT:unpacked},stdio:'inherit'});
 else execFileSync('unzip',['-q',zip,'-d',unpacked],{stdio:'inherit'});
}
mkdirSync(destination,{recursive:true});
for(const relative of ['deployggb.js','HTML5/5.0/css','HTML5/5.0/web3d'])cpSync(path.join(unpacked,'GeoGebra',relative),path.join(destination,relative),{recursive:true});
cpSync(path.join(unpacked,'README.txt'),path.join(destination,'README.txt'));
writeFileSync(path.join(destination,'bundle-source.json'),JSON.stringify({version,source,sha256,purpose:'Uso personal educativo sin conexión; conserva los avisos originales.',documentation:'https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/'},null,2));
console.log(`GeoGebra ${version} listo: Classic completo con gráfica, CAS y 3D. Licencias y avisos conservados.`);
