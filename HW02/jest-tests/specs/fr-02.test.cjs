const {Harness,delay}=require('../helpers/harness.cjs');
const catalog=require('../catalog.json').filter(c=>c.fr==='FR-02');
const demo=new Set(['TC01','TC02','TC03','TC04','TC07','TC14']);
const h=new Harness('FR-02');beforeAll(()=>h.start());afterAll(()=>h.finish());
const denied=(r)=>!!r&&r.status>=400&&!r.data?.token;
for(const tc of catalog){
 if(tc.tc==='TC13'||(process.env.HW02_DEMO==='1'&&!demo.has(tc.tc))){test.skip(tc.id+' — '+tc.name,()=>{});continue;}
 test(tc.id+' — '+tc.name,()=>h.runCase(tc,async function(){
  const n=Number(tc.tc.slice(2));await this.resetUser([2,3,4].includes(n)?n-2:0);
  if(n===1){
   const r=await this.submit('test@eshop.com','Test1234!');this.check('Login HTTP',r?.status,200);this.check('JWT returned',typeof r?.data?.token,'string');
   await delay(800);const token=await this.page.evaluate(()=>localStorage.getItem('token'));this.check('Client stores returned JWT',!!token&&token===r?.data?.token,true);
   const profile=this.events.find(e=>e.url.endsWith('/api/users/me')&&e.authorization==='Bearer '+token);this.check('Client sends same JWT in Authorization',!!profile,true);
   const me=await this.request('/api/users/me',undefined,token,'GET');this.check('JWT accepted by backend',me.status,200);this.check('JWT identifies correct account',me.data?.email,'test@eshop.com');return;
  }
  if([2,3,4].includes(n)){
   const before=n-2;const r=await this.submit('test@eshop.com','WrongPass9!');const start=this.lastSubmit.requestAt,end=this.lastSubmit.responseAt,state=await this.user();
   this.check('Rejected; no JWT issued',denied(r),true);this.check('Counter after wrong login',state.login_attempts,before+1);
   this.check('Account lock activated',!!state.locked_until,n===4);
   if(n===4&&state.locked_until){const duration=Date.parse(state.locked_until)-start;this.observations={before,state,lock_ms_from_request_start:duration,request_duration_ms:end-start};this.check('Lock duration is 30 seconds',duration>=30000&&duration<=30000+(end-start)+300,true);}
   else this.observations={before,state};
   this.check('Generic UI error displayed',await this.page.getByText('Đăng nhập thất bại. Vui lòng kiểm tra lại.',{exact:true}).isVisible(),true);return;
  }
  if(n===6){await this.sql('DELETE FROM users WHERE email=?',['hw02-absent@example.com']);const r=await this.submit('hw02-absent@example.com','Test1234!');this.check('Unknown account denied',denied(r),true);this.check('Generic UI authentication error',await this.page.getByText('Đăng nhập thất bại. Vui lòng kiểm tra lại.',{exact:true}).isVisible(),true);return;}
  if(n===7){const r=await this.submit('abc','Test1234!');this.check('Email input type',await this.page.locator('form input').nth(0).getAttribute('type'),'email');this.check('HTML5 validity blocks invalid email',await this.page.locator('form input').nth(0).evaluate(e=>e.checkValidity()),false);this.check('No login request sent',r===null,true);this.observations={login_http:r?.status||null,login_requests:this.events.filter(e=>e.url.endsWith('/api/login')).length};return;}
  // Real lock activation uses consecutive wrong-login requests, not a fabricated lock timestamp.
  let state,activationStart,activationEnd;
  for(let i=0;i<3;i++){await this.submit('test@eshop.com','WrongPass9!');state=await this.user();activationStart=this.lastSubmit.requestAt;activationEnd=this.lastSubmit.responseAt;await this.explain(tc.id+' | Chuẩn bị khóa mới',`Đã gửi sai ${i+1} lần. Bộ đếm thực tế: ${state.login_attempts}.\nTrạng thái thực tế: ${state.locked_until?'đã khóa':'chưa khóa'}.`,1000);if(state.locked_until)break;}
  if(!state?.locked_until)throw Error('Unable to establish locked-account precondition');
  this.observations={activated_state:state,activation_interval:[activationStart,activationEnd]};
  const waits={5:10000,8:35000,9:0,10:0,11:1000,12:29000,14:31000};const wait=waits[n];
  if(wait===undefined)throw Error('Missing FR02 executor');
  const target=activationEnd+wait;
  // Prepare credentials before waiting so slow typing does not shift the timed request.
  await this.enterCredentials('test@eshop.com',n===9?'WrongPass9!':'Test1234!');
  while(Date.now()<target-2000){const left=Math.ceil((target-Date.now())/1000);await this.banner(tc.id+' | '+tc.name,`Khóa mới đã được kích hoạt bằng đăng nhập sai.\nChờ đồng hồ thật: còn ${left} giây; không tua nhanh hoặc sửa đồng hồ backend.`);await delay(Math.min(1000,target-2000-Date.now()));}
  await this.banner(tc.id+' | Bước 3: trước khi gửi','Đã nhập xong dữ liệu. Dừng 2 giây trước khi gửi đăng nhập.');
  if(Date.now()<target)await delay(target-Date.now());
  await this.banner(tc.id+' | '+tc.name,'Gửi yêu cầu tại thời điểm đã chọn; đọc trạng thái thực tế.');
  const r=await this.clickSubmit({timed:true});const requestAt=this.lastSubmit.requestAt;
  this.observations.elapsed_since_activation_ms=[requestAt-activationEnd,requestAt-activationStart];
  if([8,14].includes(n)){this.check('Successful login after lock expiry',r?.status,200);this.check('JWT issued after expiry',typeof r?.data?.token,'string');}
  else this.check('Locked account denied; no JWT',denied(r),true);
  // Exact t=0/1/29 cannot be certified with uncontrolled OS scheduling.
  if([10,11,12].includes(n)){this.observations.timing_limit='Measured interval saved; no claim of an exact boundary timestamp.';}
 }));
}
