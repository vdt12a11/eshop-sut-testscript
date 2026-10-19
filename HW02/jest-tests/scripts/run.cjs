const fs=require('fs'),path=require('path'),{spawn,spawnSync}=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),tests=path.join(root,'jest-tests');
const {sut,dependency}=require('../helpers/deps.cjs');
const args=process.argv.slice(2), fr=args.includes('--fr')?args[args.indexOf('--fr')+1]:'FR-02';
if(fr==='FR-20'){require('./run-mobile.cjs');return;}
if(!['FR-02','FR-09','FR-15'].includes(fr))throw Error('Use --fr FR-02, FR-09, FR-15 or FR-20');
const demo=args.includes('--demo');
if(demo&&fr!=='FR-02'&&!args.includes('--approved-next-video'))throw Error('Await user approval after FR-02 video.');
const runid=new Date().toISOString().replace(/[:.]/g,'-')+'-'+fr;
const run=path.join(tests,'runs',runid), isolated=path.join(root,'runtime','jest-sut',runid);
fs.mkdirSync(run,{recursive:true});fs.mkdirSync(isolated,{recursive:true});
const children=[];
const originalDb=path.join(sut,'backend/database.sqlite');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const meta={run_id:runid,started_at:new Date().toISOString(),timezone:'Asia/Saigon',fr,demo,node:process.version,os:process.platform,source_root:sut,source_commit:spawnSync('C:/Users/tung1/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe',['-C',sut,'rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),source_hashes:{},original_db_before:hash(originalDb),backend:'http://localhost:3000',web:'http://localhost:5173',isolated_db:path.join(isolated,'database.sqlite')};
for(const file of ['backend/server.js','backend/database.js','frontend-web/src/pages/Login.jsx','frontend-web/src/context/AuthContext.jsx','frontend-admin/src/App.jsx'])meta.source_hashes[file]=hash(path.join(sut,file));
for(const f of ['server.js','database.js'])fs.copyFileSync(path.join(sut,'backend',f),path.join(isolated,f));
fs.writeFileSync(path.join(run,'environment.json'),JSON.stringify(meta,null,2));
const moduleRoots=[path.join(sut,'backend/node_modules'),path.join(sut,'testing/node_modules'),process.env.HW02_NODE_MODULES||'C:/Users/tung1/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'];
const env={...process.env,NODE_PATH:moduleRoots.join(path.delimiter),HW02_RUN:run,HW02_FR:fr,HW02_DEMO:demo?'1':'0',HW02_DB:meta.isolated_db,HW02_SUT:sut,HW02_CLOCK_FILE:path.join(isolated,'clock.txt')};
function start(name,argv,cwd){const stream=fs.openSync(path.join(run,name+'.log'),'a');const p=spawn(process.execPath,argv,{cwd,env,windowsHide:true,stdio:['ignore',stream,stream]});children.push(p);p.on('error',e=>console.error(name,e.message));return p;}
async function wait(url){for(let i=0;i<100;i++){try{const r=await fetch(url);if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw Error('Server unavailable: '+url);}
async function ensureFree(port){try{await fetch('http://localhost:'+port);throw Error('Port '+port+' already in use; refusing to replace an existing app.');}catch(e){if(e.message.startsWith('Port'))throw e;}}
(async()=>{let code=2;try{
 await ensureFree(3000);await ensureFree(5173);
 start('backend',['--require',path.join(tests,'helpers/controlled-clock.cjs'),path.join(isolated,'server.js')],isolated);await wait('http://localhost:3000/api/products');
 start('frontend-web',[path.join(sut,'frontend-web/node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','5173','--strictPort'],path.join(sut,'frontend-web'));await wait('http://localhost:5173');
 if(fr==='FR-15'){
  await ensureFree(5174);
  const adminConfig=path.join(isolated,'vite-admin.config.mjs');
  const originalConfig=require('url').pathToFileURL(path.join(sut,'frontend-admin/vite.config.js')).href;
  fs.writeFileSync(adminConfig,'import original from '+JSON.stringify(originalConfig)+';\nexport default {...original,cacheDir:'+JSON.stringify(path.join(isolated,'vite-admin-cache'))+'};\n');
  start('frontend-admin',[path.join(sut,'frontend-admin/node_modules/vite/bin/vite.js'),'--config',adminConfig,'--host','127.0.0.1','--port','5174','--strictPort'],path.join(sut,'frontend-admin'));await wait('http://localhost:5174');
 }
 const jestBin=(()=>{for(const r of [tests,path.join(sut,'testing')]){try{return require.resolve('jest/bin/jest',{paths:[r]});}catch{}}throw Error('Jest not installed');})();
 const p=spawn(process.execPath,[jestBin,'--config',path.join(tests,'jest.config.cjs'),'--runInBand','--json','--outputFile',path.join(run,'jest.json'),'--testPathPatterns',fr.toLowerCase()+'.test.cjs'],{cwd:tests,env,windowsHide:true,stdio:'inherit'});
 code=await new Promise(resolve=>p.on('exit',resolve));
 }catch(e){console.error(e.stack);fs.writeFileSync(path.join(run,'infrastructure-error.txt'),e.stack);}
 finally{
  for(const c of children)c.kill();
  meta.original_db_after=hash(originalDb);meta.original_db_unchanged=meta.original_db_before===meta.original_db_after;meta.finished_at=new Date().toISOString();meta.jest_exit_code=code;
  fs.writeFileSync(path.join(run,'environment.json'),JSON.stringify(meta,null,2));
  console.log('RUN_DIRECTORY='+run);console.log('Original SUT DB unchanged: '+meta.original_db_unchanged);
  process.exitCode=code||0;
 }
})();
