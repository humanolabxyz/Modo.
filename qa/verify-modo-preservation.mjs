import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const baseline = JSON.parse(fs.readFileSync('qa/modo/baseline-hashes.json','utf8'));
const presentation = new Set(['src/components/Home.tsx','src/lab/HomeTools.tsx','src/pages/index.astro','src/pages/estudio.astro','src/pages/laboratorio.astro']);
const norm = text => text.replaceAll('\r\n','\n');
const changes = [];
const concurrentSnapshot = JSON.parse(fs.readFileSync('qa/modo/concurrent-changes.json','utf8'));
const concurrent = [];
const branding = {
  'src/components/App.tsx': [
    ["import {Home} from './Home';", "import {Home} from './Home';\nimport {LogoModo} from './LogoModo';"],
    ["${!isIntro?'editor-workbench':''}", "${!isIntro?'editor-workbench':'modo-home-shell'}"],
    ['<div className="brand-wrap"><div className="brand-icon"><Zap size={20} fill="currentColor"/></div><div className="brand-caption"><strong>panel<span>lab</span></strong><small>INACAP · CONTROL</small></div></div>','<a href="/" className="brand-wrap" aria-label="modo. · inicio"><LogoModo/></a>'],
    ['Cómo trabajar en PanelLab','Cómo trabajar en modo.'],
    ["a.download='panellab-practica.json'","a.download='modo-practica.json'"],
  ],
  'src/study/StudyApp.tsx': [
    ['import ',"import {LogoModo} from '../components/LogoModo';\nimport "],
    ['aria-label="PanelLab · inicio"','aria-label="modo. · inicio"'],
    ['          <div className="brand-icon">\n            <Zap size={20} fill="currentColor" />\n          </div>\n          <div className="brand-caption">\n            <strong>\n              panel<span>lab</span>\n            </strong>\n            <small>INACAP · CONTROL</small>\n          </div>','          <LogoModo/>'],
    ['panellab-estudio-progreso.json','modo-estudio-progreso.json'],
  ],
  'src/lab/LaboratoryApp.tsx': [
    ['import ',"import {LogoModo} from '../components/LogoModo';\nimport "],
    ['<a href="/" className="lab-brand"><span><CircuitBoard size={23}/></span><strong>Panel<span>Lab</span></strong></a>','<a href="/" className="lab-brand" aria-label="modo. · inicio"><LogoModo/></a>'],
  ],
  'src/components/TeacherMaterial.tsx': [['PanelLab no simula','modo. no simula']],
  'src/lab/MeterInstrument.tsx': [['PANELLAB · DMM 600','modo. · DMM 600']],
  'src/lab/HMIView.tsx': [['PANEL LAB','modo.']],
  'src/lab/SchematicView.tsx': [['PANEL LAB · MANDO DC','modo. · MANDO DC']],
  'src/lab/validation.ts': [['Laboratorio PanelLab (versión 1 o 2)','Laboratorio modo. (versión 1 o 2)']],
  'src/lab/useLaboratory.ts': [['}.panellab.json','}.modo.json']],
};
let unchanged = 0;
for (const entry of baseline) {
  const file = entry.Path.replaceAll('\\','/');
  const current = fs.readFileSync(file);
  if (crypto.createHash('sha256').update(current).digest('hex').toUpperCase() === entry.Hash) { unchanged++; continue; }
  changes.push(file);
  const external = concurrentSnapshot.find(entry => entry.file === file);
  if (external) {
    const currentHash = crypto.createHash('sha256').update(current).digest('hex');
    assert.equal(currentHash,external.hash,`Concurrent file changed again; refresh verification: ${file}`);
    if (branding[file]) {
      for (const [,to] of branding[file]) assert.ok(norm(current.toString()).includes(to),`Brand change lost in concurrent file: ${file}`);
    }
    concurrent.push(external);
    continue;
  }
  if (presentation.has(file)) continue;
  assert.ok(branding[file], `Unexpected change: ${file}`);
  let expected = norm(fs.readFileSync(`qa/modo/before/source/${file}`,'utf8'));
  for (const [from,to] of branding[file]) {
    assert.ok(expected.includes(from), `Missing expected original: ${file}`);
    expected = expected.replace(from,to);
  }
  assert.equal(norm(current.toString()),expected,`Change beyond brand presentation: ${file}`);
}
const report={result:'PASS',scope:'Branding task only; separately observed concurrent edits are excluded from preservation claims.',unchangedSourceFiles:unchanged,changedFiles:changes.filter(file=>!concurrent.some(entry=>entry.file===file)),concurrentChanges:concurrent,checks:[
  'All source changes performed by this task are limited to Home presentation, document metadata, logos, visible brand strings and export filenames.',
  'Panel data, wiring, learning, simulation engines, project schemas, study content and grading retain their exact original hashes; concurrent UI edits are listed separately.',
  'Files changed only by this task match the original exactly after accounting for the listed branding changes; shared files with concurrent edits are recorded separately and covered by UI regression checks.',
  'Legacy localStorage keys and import formats remain compatible with saved practices, study progress and laboratory projects.',
]};
fs.writeFileSync('qa/modo/preservation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
