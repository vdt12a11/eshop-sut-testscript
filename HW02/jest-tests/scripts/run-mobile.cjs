// Android-native runner. Never edits the SUT or uses the Web frontend as Mobile.
const fs=require('fs'),path=require('path'),http=require('http'),net=require('net'),crypto=require('crypto'),{spawn,spawnSync}=require('child_process');
const tests=path.resolve(__dirname,'..'),root=path.resolve(tests,'..');
const {sut,dependency}=require('../helpers/deps.cjs');
const args=process.argv.slice(2),demo=args.includes('--demo'),requestedSerial=process.env.HW02_ANDROID_SERIAL||'emulator-5556';
const serial=requestedSerial.startsWith('emulator-')?'127.0.0.1:'+(Number(requestedSerial.slice(9))+1):requestedSerial;
const adbPort=String(process.env.HW02_ADB_SERVER_PORT||15000+Math.floor(Math.random()*10000)),uiPort=String(Number(adbPort)+1);let adbServerPid;
const adbPath=process.env.HW02_ADB||path.join(process.env.LOCALAPPDATA,'Android/Sdk/platform-tools/adb.exe');
const adb=(...a)=>{const r=spawnSync(adbPath,['-P',adbPort,'-s',serial,...a],{encoding:'utf8',windowsHide:true,timeout:30000});if(r.status!==0)throw Error(r.stderr||r.stdout||'ADB command timeout: '+a.join(' '));return r.stdout.trim();};
const runid=new Date().toISOString().replace(/[:.]/g,'-')+'-FR-20',run=path.join(tests,'runs',runid),isolated=path.join(root,'runtime/jest-sut',runid),mobile=process.env.HW02_MOBILE_PROJECT||path.join(root,'runtime/mobile-app');
fs.mkdirSync(run,{recursive:true});fs.mkdirSync(isolated,{recursive:true});
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const originalDB=path.join(sut,'backend/database.sqlite'),git=process.env.HW02_GIT||'C:/Users/tung1/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/git/cmd/git.exe';
const sourceFiles=['frontend-mobile/App.js','frontend-mobile/index.js','frontend-mobile/app.json','frontend-mobile/package.json','frontend-mobile/package-lock.json','backend/server.js','backend/database.js'];
const meta={run_id:runid,started_at:new Date().toISOString(),timezone:'Asia/Saigon',fr:'FR-20',demo,node:process.version,os:process.platform,source_root:sut,source_commit:spawnSync(git,['-C',sut,'rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),source_hashes:Object.fromEntries(sourceFiles.map(f=>[f,hash(path.join(sut,f))])),original_db_before:hash(originalDB),backend:'http://localhost:3000',mobile_project:mobile,isolated_db:path.join(isolated,'database.sqlite'),android_serial:serial,transport:'Native React Native in Expo Go; ADB input/UIAutomator; Playwright records live ADB screen viewer',fixture_network:'Android HTTP proxy maps original hard-coded API host 192.168.10.13:3000 to isolated localhost:3000; source App.js unchanged'};
for(const f of ['App.js','index.js','app.json','package.json','package-lock.json'])if(hash(path.join(mobile,f))!==hash(path.join(sut,'frontend-mobile',f)))throw Error('Mobile copy differs from SUT: '+f);
for(const f of ['server.js','database.js'])fs.copyFileSync(path.join(sut,'backend',f),path.join(isolated,f));
const children=[],logs=[],moduleRoots=[path.join(sut,'backend/node_modules'),path.join(sut,'testing/node_modules'),process.env.HW02_NODE_MODULES||'C:/Users/tung1/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'];
const env={...process.env,NODE_PATH:moduleRoots.join(path.delimiter),CI:'1',EXPO_NO_TELEMETRY:'1',EXPO_NO_DEPENDENCY_VALIDATION:'1',HW02_RUN:run,HW02_FR:'FR-20',HW02_DEMO:demo?'1':'0',HW02_DB:meta.isolated_db,HW02_SUT:sut,HW02_ANDROID_SERIAL:serial,HW02_ADB:adbPath,HW02_ADB_SERVER_PORT:adbPort,HW02_UIA_PORT:uiPort};
function start(name,argv,cwd){const fd=fs.openSync(path.join(run,name+'.log'),'a');logs.push(fd);const child=spawn(process.execPath,argv,{cwd,env,windowsHide:true,stdio:['ignore',fd,fd]});children.push(child);return child;}
async function wait(url){for(let i=0;i<120;i++){try{const r=await fetch(url);if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw Error('Server unavailable: '+url);}
async function free(port){await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',()=>reject(Error('Port already in use: '+port)));s.listen(port,'127.0.0.1',()=>s.close(resolve));});}
function sql(db,q,p=[]){return new Promise((resolve,reject)=>db.run(q,p,e=>e?reject(e):resolve()));}
let proxy,oldProxy;
(async()=>{let code=2;try{
 await free(Number(adbPort));
 const serverStart=spawnSync(adbPath,['-P',adbPort,'start-server'],{encoding:'utf8',windowsHide:true,timeout:15000});if(serverStart.status!==0)throw Error('Cannot start isolated ADB server');
 const pidResult=spawnSync('powershell.exe',['-NoProfile','-Command','(Get-NetTCPConnection -LocalPort '+adbPort+' -State Listen).OwningProcess'],{encoding:'utf8',windowsHide:true});adbServerPid=Number(pidResult.stdout.trim());if(!adbServerPid)throw Error('Cannot identify owned ADB server PID');
 meta.adb_server_port=Number(adbPort);meta.adb_server_pid=adbServerPid;
 if(serial.includes(':')){const connect=spawnSync(adbPath,['-P',adbPort,'connect',serial],{encoding:'utf8',windowsHide:true,timeout:15000});if(connect.status!==0)throw Error('Cannot connect dedicated ADB transport');}
 if(adb('shell','getprop','sys.boot_completed')!=='1')throw Error('Android emulator is not booted');
 meta.android={release:adb('shell','getprop','ro.build.version.release'),api:adb('shell','getprop','ro.build.version.sdk'),model:adb('shell','getprop','ro.product.model'),expo:adb('shell','dumpsys','package','host.exp.exponent').match(/versionName=([^\r\n]+)/)?.[1]};
  if(!meta.android.expo)throw Error('Install Expo Go SDK 54 first');
  meta.android.uiautomator2='10.7.0';
  if(!adb('shell','pm','list','packages','io.appium.uiautomator2.server').includes('io.appium.uiautomator2.server'))throw Error('Install UiAutomator2 server APKs first (see jest-tests/README.md).');
 await free(3000);await free(8081);await free(3080);
 start('backend',[path.join(isolated,'server.js')],isolated);await wait('http://localhost:3000/api/products');
 const sqlite=dependency('sqlite3'),db=new sqlite.Database(meta.isolated_db);db.configure('busyTimeout',5000);
 await sql(db,'DELETE FROM products');
 const picture='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=';
 for(const item of [[1001,'SP_A',100000],[1002,'SP_B',50000]])await sql(db,'INSERT INTO products(id,name,price,category_id,description,imageUrl) VALUES(?,?,?,?,?,?)',[...item,1,'Sản phẩm fixture FR20',picture]);
 await new Promise(r=>db.close(r));
 oldProxy=adb('shell','settings','get','global','http_proxy');meta.previous_android_proxy=oldProxy;
 proxy=http.createServer((req,res)=>{let url;try{url=new URL(req.url.startsWith('http')?req.url:'http://'+req.headers.host+req.url);}catch{res.writeHead(400);res.end();return;}
  const isFixture=url.hostname==='192.168.10.13'&&url.port==='3000';
  const upstream=http.request({hostname:isFixture?'127.0.0.1':url.hostname,port:isFixture?3000:(url.port||80),path:url.pathname+url.search,method:req.method,headers:{...req.headers,host:isFixture?'localhost:3000':url.host}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});upstream.on('error',e=>{res.writeHead(502);res.end(e.message);});req.pipe(upstream);
 });
 proxy.on('connection',socket=>socket.on('error',()=>socket.destroy()));
 proxy.on('connect',(req,client,head)=>{const [host,port]=req.url.split(':');const upstream=net.connect(Number(port)||443,host,()=>{client.write('HTTP/1.1 200 Connection Established\r\n\r\n');if(head.length)upstream.write(head);client.pipe(upstream);upstream.pipe(client);});upstream.on('error',()=>client.destroy());client.on('error',()=>upstream.destroy());});
 await new Promise(r=>proxy.listen(3080,'0.0.0.0',r));
 adb('reverse','tcp:3080','tcp:3080');adb('reverse','tcp:8081','tcp:8081');adb('shell','settings','put','global','http_proxy','127.0.0.1:3080');
 adb('shell','wm','size','720x1280');adb('shell','wm','density','320');adb('shell','settings','put','system','screen_off_timeout','1800000');adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','wm','dismiss-keyguard');
 await free(Number(uiPort));meta.uiautomator2_host_port=Number(uiPort);adb('forward','tcp:'+uiPort,'tcp:6790');
 let uiReady=false;try{const r=await fetch('http://127.0.0.1:'+uiPort+'/wd/hub/status',{signal:AbortSignal.timeout(1500)});uiReady=r.ok;}catch{}
 meta.uiautomator2_service_reused=uiReady;
 if(!uiReady){const uiLog=fs.openSync(path.join(run,'uiautomator2.log'),'a');const ui=spawn(adbPath,['-P',adbPort,'-s',serial,'shell','am','instrument','-w','io.appium.uiautomator2.server.test/androidx.test.runner.AndroidJUnitRunner'],{env,windowsHide:true,stdio:['ignore',uiLog,uiLog]});ui.hw02Persistent=true;children.push(ui);await wait('http://127.0.0.1:'+uiPort+'/wd/hub/status');}
 start('metro',[path.join(mobile,'node_modules/expo/bin/cli'),'start','--localhost','--port','8081','--max-workers','1'],mobile);await wait('http://localhost:8081/status');
 fs.writeFileSync(path.join(run,'environment.json'),JSON.stringify(meta,null,2));
 const jestBin=require.resolve('jest/bin/jest',{paths:[path.join(sut,'testing')]});
 const child=spawn(process.execPath,[jestBin,'--config',path.join(tests,'jest.config.cjs'),'--runInBand','--json','--outputFile',path.join(run,'jest.json'),'--testPathPatterns','fr-20.test.cjs'],{cwd:tests,env,windowsHide:true,stdio:'inherit'});
 code=await new Promise(resolve=>child.on('exit',resolve));
 }catch(e){console.error(e.stack);fs.writeFileSync(path.join(run,'infrastructure-error.txt'),e.stack);}
 finally{
  try{if(oldProxy!==undefined)adb('shell','settings','put','global','http_proxy',oldProxy==='null'?':0':oldProxy);}catch{}
  // Killing an adb instrumentation client can wedge this Windows ADB transport.
  // The session is deleted by the harness; reuse the isolated emulator service.
  for(const child of children){if(child.hw02Persistent)child.unref();else child.kill();}if(proxy)proxy.closeAllConnections();if(proxy)proxy.close();
  meta.original_db_after=hash(originalDB);meta.original_db_unchanged=meta.original_db_before===meta.original_db_after;meta.source_hashes_after=Object.fromEntries(sourceFiles.map(f=>[f,hash(path.join(sut,f))]));meta.source_unchanged=JSON.stringify(meta.source_hashes)===JSON.stringify(meta.source_hashes_after);meta.finished_at=new Date().toISOString();meta.jest_exit_code=code;
  fs.writeFileSync(path.join(run,'environment.json'),JSON.stringify(meta,null,2));console.log('RUN_DIRECTORY='+run);console.log('Original DB/source unchanged:',meta.original_db_unchanged,meta.source_unchanged);if(adbServerPid){try{process.kill(adbServerPid);}catch{}}process.exitCode=code||0;
 }
})();
