const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {dependency}=require('./deps.cjs');
const {chromium}=dependency('playwright');const sqlite=dependency('sqlite3');
const root=path.resolve(__dirname,'../..'),run=process.env.HW02_RUN;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
class Harness{
 constructor(fr){this.fr=fr;this.results={run_id:path.basename(run),cases:[]};this.demo=process.env.HW02_DEMO==='1';this.events=[];this.timeline=[];}
 async start(){
  this.db=new sqlite.Database(process.env.HW02_DB);this.db.configure('busyTimeout',5000);
  let executablePath=process.env.HW02_CHROMIUM;
  if(!executablePath&&!fs.existsSync(chromium.executablePath())){const cache=path.join(process.env.LOCALAPPDATA||'','ms-playwright');for(const f of fs.readdirSync(cache).filter(n=>/^chromium-\d+$/.test(n)).sort().reverse()){const p=path.join(cache,f,'chrome-win64/chrome.exe');if(fs.existsSync(p)){executablePath=p;break;}}}
  this.browser=await chromium.launch({headless:false,executablePath,args:['--window-size=1360,950']});
  this.context=await this.browser.newContext({viewport:{width:1280,height:850},locale:'vi-VN',...(this.demo?{recordVideo:{dir:path.join(run,'video'),size:{width:1280,height:850}}}:{})});
  this.page=await this.context.newPage();
  this.page.on('request',r=>{if(r.url().includes('/api/')){const h=r.headers();this.events.push({time:Date.now(),url:r.url(),method:r.method(),body:r.postData(),bearer:h.authorization?.startsWith('Bearer ')||false,authorization:h.authorization});}});
  this.page.on('dialog',async d=>{this.dialogs=(this.dialogs||[]).concat(d.message());await d.accept();});
  this.metadata=JSON.parse(fs.readFileSync(path.join(run,'environment.json'),'utf8'));this.metadata.browser=await this.browser.version();this.metadata.playwright=dependency('playwright/package.json').version;
  fs.writeFileSync(path.join(run,'environment-browser.json'),JSON.stringify(this.metadata,null,2));
 }
 sql(q,p=[]){return new Promise((res,rej)=>this.db.run(q,p,function(e){e?rej(e):res({changes:this.changes,id:this.lastID});}));}
 get(q,p=[]){return new Promise((res,rej)=>this.db.get(q,p,(e,row)=>e?rej(e):res(row)));}
 all(q,p=[]){return new Promise((res,rej)=>this.db.all(q,p,(e,row)=>e?rej(e):res(row)));}
 async user(){return this.get('SELECT id,email,login_attempts,locked_until FROM users WHERE email=?',['test@eshop.com']);}
 async resetUser(n=0,until=null){await this.sql('UPDATE users SET login_attempts=?,locked_until=? WHERE email=?',[n,until,'test@eshop.com']);}
 async request(route,body,token,method='POST'){
  const response=await fetch('http://localhost:3000'+route,{method,headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  let data;try{data=await response.json();}catch{data=null;}return {status:response.status,data};
 }
 async token(admin=false){const r=await this.request('/api/login',{email:admin?'admin@eshop.com':'test@eshop.com',password:admin?'Admin123!':'Test1234!'});assert.equal(r.status,200,'Fixture login must succeed');return r.data.token;}
 async banner(title,detail,color='#19334d'){
  this.timeline.push({at:new Date().toISOString(),title,detail});
  await this.page.evaluate(({title,detail,color})=>{let e=document.getElementById('hw02-harness');if(!e){e=document.createElement('div');e.id='hw02-harness';document.body.append(e);}e.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:2147483647;min-height:130px;padding:16px 24px;background:'+color+';color:white;font:18px Arial;white-space:pre-wrap;border-top:4px solid #72b2ff;box-sizing:border-box;';e.replaceChildren();const t=document.createElement('b');t.textContent='HW02 TEST HARNESS — '+title;const p=document.createElement('div');p.style.cssText='margin-top:10px;line-height:1.45';p.textContent=detail;e.append(t,p);},{title,detail,color});
 }
 async explain(title,detail,ms=4500){if(this.demo){await this.banner(title,detail);await delay(ms);}}
 async loginPage(){await this.page.goto('http://localhost:5173/login');await this.page.waitForSelector('form input');}
 async enterCredentials(email,password){
  const emailInput=this.page.locator('form input').nth(0),passwordInput=this.page.locator('form input').nth(1);
  if(this.demo){
   await this.banner(this.currentCase+' | Bước 1: nhập email','Nhập email: '+email+'\nQuan sát dữ liệu đang được gõ vào form.');
   await emailInput.evaluate(e=>e.style.outline='3px solid #2563eb');await emailInput.fill('');await emailInput.pressSequentially(email,{delay:60});await delay(1500);await emailInput.evaluate(e=>e.style.outline='');
   await this.banner(this.currentCase+' | Bước 2: nhập mật khẩu','Nhập mật khẩu của tài khoản demo.\nSau khi điền xong sẽ dừng để kiểm tra dữ liệu trước khi gửi.');
   await passwordInput.evaluate(e=>e.style.outline='3px solid #2563eb');await passwordInput.fill('');await passwordInput.pressSequentially(password,{delay:60});await delay(1500);await passwordInput.evaluate(e=>e.style.outline='');
  }else{await emailInput.fill(email);await passwordInput.fill(password);}
 }
 async clickSubmit({timed=false}={}){
  const button=this.page.getByRole('button',{name:'Sign In',exact:true});
  if(this.demo&&!timed){await this.banner(this.currentCase+' | Bước 3: gửi đăng nhập','Kiểm tra email và mật khẩu vừa nhập.\nTiếp theo: bấm Sign In rồi đối chiếu kết quả với yêu cầu.');await button.hover();await delay(2000);}
  const pending=this.page.waitForResponse(r=>r.url().endsWith('/api/login')&&r.request().method()==='POST',{timeout:3500}).catch(()=>null);
  const beforeClick=Date.now();await button.click();const r=await pending;
  const responseAt=Date.now();const event=[...this.events].reverse().find(e=>e.url.endsWith('/api/login')&&e.method==='POST'&&e.time>=beforeClick);
  this.lastSubmit={requestAt:event?.time||beforeClick,responseAt};
  await delay(350);return r?{status:r.status(),data:await r.json()}:null;
 }
 async submit(email,password){await this.enterCredentials(email,password);return this.clickSubmit();}
 check(label,actual,expected){this.checks.push({label,actual,expected,pass:JSON.stringify(actual)===JSON.stringify(expected)});}
 async fillField(locator,value,label){
  await locator.evaluate(e=>e.scrollIntoView({block:'center'}));
  await this.banner(this.currentCase+' | Nhập '+label,'Điền '+label+(String(value).length>80?' ('+String(value).length+' ký tự)':'')+'. Dừng 1,5 giây sau khi nhập xong.');
  await locator.evaluate(e=>e.style.outline='3px solid #2563eb');await locator.fill('');
  if(String(value).length>80)await locator.fill(String(value));else await locator.pressSequentially(String(value),{delay:60});
  if(this.demo)await delay(1500);await locator.evaluate(e=>e.style.outline='');
 }
 async beforeAction(button,label){await button.evaluate(e=>e.scrollIntoView({block:'center'}));await this.banner(this.currentCase+' | Trước khi gửi',label+'\nDừng 2 giây trước khi thực hiện.');await button.hover();if(this.demo)await delay(2000);}
 async runCase(tc,fn,prepare){
  this.checks=[];this.observations={};this.events=[];this.currentCase=tc.id;await this.context.clearCookies();let prepareError;
  try{if(this.fr==='FR-02'){await this.loginPage();await this.page.evaluate(()=>localStorage.clear());await this.loginPage();}else{await this.page.goto('about:blank');if(prepare)await prepare.call(this,tc);}}catch(e){prepareError=e;}
  const title={'FR-02':'Đăng nhập và khóa tài khoản','FR-09':'Mã giảm giá','FR-15':'Quản lý sản phẩm CRUD'}[this.fr];
  if(this.demo&&this.results.cases.length===0){await this.banner(this.fr+' — '+title,'Các TC tiêu biểu được thực hiện trên giao diện thật.\nChú thích kiểm thử do runner hiển thị; không phải UI gốc EShop.');await delay(2000);}
  const number=Number(tc.tc.slice(2));
  await this.banner(tc.id+' | '+tc.name,'MỤC TIÊU: '+tc.expected+(this.fr==='FR-02'?'\nTiền điều kiện riêng: tài khoản tồn tại, chưa khóa; n='+([2,3,4].includes(number)?number-2:0)+'.':'\n'+(this.caseContext||'Dữ liệu và trạng thái được chuẩn bị độc lập cho từng TC.')));
  if(this.demo)await delay(4000);
  const started=new Date().toISOString();let infra;
  try{if(prepareError)throw prepareError;await fn.call(this,tc);}catch(e){infra=e;}
  const failed=this.checks.filter(c=>!c.pass);const status=infra?'Not Run':failed.length?'Fail':'Pass';
  const summary=this.checks.map(c=>(c.pass?'PASS':'FAIL')+' '+c.label+': '+JSON.stringify(c.actual)+(c.pass?'':' (expected '+JSON.stringify(c.expected)+')')).join('\n');
  const labels={'Login HTTP':'HTTP đăng nhập','JWT returned':'Có JWT trả về','Client stores returned JWT':'Client lưu đúng JWT trả về','Client sends same JWT in Authorization':'Client gửi đúng JWT trong Authorization','JWT accepted by backend':'Backend chấp nhận JWT (HTTP)','JWT identifies correct account':'JWT xác định đúng tài khoản','Rejected; no JWT issued':'Từ chối đăng nhập, không cấp JWT','Counter after wrong login':'Bộ đếm sau lần đăng nhập sai','Account lock activated':'Tài khoản bị khóa','Lock duration is 30 seconds':'Thời hạn khóa đúng 30 giây','Generic UI error displayed':'Có thông báo lỗi phù hợp trên giao diện','Email input type':'Kiểu của trường email','HTML5 validity blocks invalid email':'HTML5 xem email nhập vào là hợp lệ','No login request sent':'Không gửi request đăng nhập','Successful login after lock expiry':'Đăng nhập đúng sau khi hết khóa (HTTP)','JWT issued after expiry':'Có JWT sau khi hết khóa'};
  const display=v=>v===true?'có / đúng':v===false?'không / sai':v==='string'?'chuỗi JWT':v==='undefined'?'không có':JSON.stringify(v);
  const readable=this.checks.map(c=>(c.pass?'ĐẠT':'LỖI')+' — '+(labels[c.label]||c.label)+': '+display(c.actual)+(c.pass?'':' | Mong đợi: '+display(c.expected))).join('\n');
  const duration=this.observations.lock_ms_from_request_start;const extra=duration?'\nThời hạn khóa đo được: khoảng '+Math.round(duration/1000)+' giây; yêu cầu: 30 giây.':'';
  await this.banner(tc.id+' — '+status,infra?'Lỗi hạ tầng: '+infra.message:'Bước 4: ĐỐI CHIẾU KẾT QUẢ\n'+readable+extra,status==='Pass'?'#14532d':status==='Fail'?'#7f1d1d':'#5b4612');
  if(this.demo)await delay(3500);
  const shot=path.join(run,tc.id+'.png');await this.page.screenshot({path:shot,fullPage:true});
  const result={id:tc.id,status,tested_at:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Ho_Chi_Minh'})+' UTC+07:00',started_at:started,actual:summary,checks:this.checks,observations:this.observations,evidence:path.relative(root,shot).replaceAll('\\','/'),...(infra?{reason:infra.message}:{})};
  this.results.cases.push(result);fs.writeFileSync(path.join(run,'results.json'),JSON.stringify(this.results,null,2));
  // Record request metadata only; never persist bearer tokens or login response bodies.
  const safe=this.events.map(({authorization,body,...r})=>({...r,...(r.url.endsWith('/api/login')?{}:{body})}));
  fs.writeFileSync(path.join(run,tc.id+'-requests.json'),JSON.stringify(safe,null,2));
  if(infra)throw infra;if(failed.length)throw new Error(failed.map(c=>`${c.label}: expected ${JSON.stringify(c.expected)}, received ${JSON.stringify(c.actual)}`).join('; '));
 }
 async finish(){
  if(this.demo&&this.page){const pass=this.results.cases.filter(r=>r.status==='Pass').length,fail=this.results.cases.filter(r=>r.status==='Fail').length;await this.banner(this.fr+' — Tổng kết video',`${this.results.cases.length} TC minh họa | Pass: ${pass} | Fail: ${fail}\nCác kết quả được lưu vào README và hồ sơ chạy test.\n`+(this.fr==='FR-02'?'Dừng và chờ duyệt trước video FR-09/FR-15.':'Đã hoàn tất các TC minh họa của chức năng này.'));await delay(3500);}
  const video=this.page?.video();await this.context?.close();
  if(video){const v=path.join(root,'videos',this.fr==='FR-02'&&this.demo?'FR-02-demo-paced.webm':this.fr+'-demo.webm');await video.saveAs(v);fs.copyFileSync(v,path.join(run,this.fr+'-demo.webm'));this.results.video=path.relative(root,v).replaceAll('\\','/');}
  await this.browser?.close();if(this.db)await new Promise(res=>this.db.close(res));
  fs.writeFileSync(path.join(run,'demo-timeline.json'),JSON.stringify(this.timeline,null,2));
  fs.writeFileSync(path.join(run,'results.json'),JSON.stringify(this.results,null,2));
 }
}
module.exports={Harness,delay};
