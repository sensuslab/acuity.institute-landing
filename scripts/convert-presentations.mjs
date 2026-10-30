import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
const run=promisify(execFile);
const rootArg=process.argv.indexOf('--root');
const root=rootArg >= 0 ? path.resolve(process.argv[rootArg+1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public/library/books');
const force=process.argv.includes('--force'),dryRun=process.argv.includes('--dry-run');
const sources=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){if(item.isSymbolicLink()||item.name.startsWith('.'))continue;const file=path.join(dir,item.name);if(item.isDirectory())walk(file);else if(path.extname(file).toLowerCase()==='.pptx')sources.push(file);}}
walk(root);
const pending=sources.filter(file=>force||!fs.existsSync(file.replace(/\.pptx$/i,'.pdf')));
if(!pending.length){console.log('No PowerPoint files need PDF preparation.');process.exit(0);}
if(dryRun){for(const file of pending)console.log('Prepare PDF:',path.relative(root,file));process.exit(0);}
const binary=process.env.LIBREOFFICE_BIN||'soffice';
let version;
try{version=(await run(binary,['--version'],{timeout:10000})).stdout.trim();}catch{throw new Error('Install LibreOffice for the curator preparation workflow, or set LIBREOFFICE_BIN. The web server does not require it.');}
for(const file of pending){
  const work=fs.mkdtempSync(path.join(os.tmpdir(),'acuity-deck-'));
  try{
    const output=path.join(work,'output');fs.mkdirSync(output);
    await run(binary,[`-env:UserInstallation=${pathToFileURL(path.join(work,'profile')).href}`,'--headless','--convert-to','pdf:impress_pdf_Export','--outdir',output,file],{timeout:180000,maxBuffer:1024*1024});
    const converted=path.join(output,path.basename(file).replace(/\.pptx$/i,'.pdf'));
    if(!fs.existsSync(converted)||fs.readFileSync(converted).subarray(0,5).toString()!=='%PDF-')throw new Error('LibreOffice did not produce a PDF');
    const destination=file.replace(/\.pptx$/i,'.pdf');fs.copyFileSync(converted,destination);
    const metadataFile=file.replace(/\.pptx$/i,'.json');
    if(fs.existsSync(metadataFile)){
      const metadata=JSON.parse(fs.readFileSync(metadataFile,'utf8'));
      metadata.conversion={tool:version,originalSha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),preparedAt:new Date().toISOString()};
      fs.writeFileSync(metadataFile,JSON.stringify(metadata,null,2)+'\n');
    }
    console.log('Prepared:',path.relative(root,destination));
  } finally {fs.rmSync(work,{recursive:true,force:true});}
}
console.log('Review the exported slides, then run npm run catalogue:sync and npm run build.');
