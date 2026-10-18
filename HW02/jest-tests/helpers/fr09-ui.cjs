const {Harness,delay}=require('./harness.cjs');
const path=require('path');const all=require('../catalog.json').filter(c=>c.fr==='FR-09');
const selected=new Set(['TC01','TC02','TC05','TC09','TC14','TC17']);
function define(){
 const h=new Harness('FR-09');beforeAll(()=>h.start());afterAll(()=>h.finish());
 for(const tc of all){if(!selected.has(tc.tc)){test.skip(tc.id+' — '+tc.name,()=>{});continue;}
 test(tc.id+' — '+tc.name,()=>h.runCase(tc,async function(){
  const {code,total,n}=this.caseData;
  await this.fillField(this.page.getByPlaceholder('Nhập mã giảm giá...',{exact:true}),code,'mã giảm giá');
  const button=this.page.getByRole('button',{name:'Áp dụng',exact:true});await this.beforeAction(button,'Áp dụng mã '+code+' cho giỏ hàng '+total.toLocaleString('vi-VN')+' đ.');
  const pending=this.page.waitForResponse(r=>r.url().endsWith('/api/apply-coupon')&&r.request().method()==='POST');
  await button.click();const response=await pending;const data=await response.json();await delay(350);
  const request=response.request(),headers=await request.allHeaders(),payload=request.postDataJSON();
  const accepts=[1,2,14,17].includes(n);
  this.observations={http:response.status(),response:data,payload,authorization_present:!!headers.authorization,total,coupon:code,ui:await this.page.locator('main').innerText()};
  this.check('Tổng giỏ hiển thị khớp dữ liệu chuẩn bị',Number(await this.page.getByRole('spinbutton').inputValue()),total);
  this.check('Mã được áp dụng',response.status()===200&&data.success===true,accepts);
  if(n===9)this.check('Request không có JWT',!headers.authorization,true);
  if(accepts){const discount=code==='SAVE10'?total*.1:code==='BIGBUY'?50000:100000;this.check('Số tiền giảm (đ)',data.discount_amount,discount);this.check('Tổng tiền sau giảm (đ)',data.final_amount,total-discount);}
  else this.check('Có phản hồi lỗi từ chối áp dụng',typeof data.error==='string',true);
 },async function(){
  const n=Number(tc.tc.slice(2)),code=tc.input.match(/Mã giảm giá: "([^"]+)"/)[1],total=Number(tc.input.match(/Tổng đơn trước giảm: ([\d.]+)/)[1].replaceAll('.',''));
  await this.sql('UPDATE coupons SET is_active=1,expired_at=?',['2099-12-31']);await this.sql('DELETE FROM coupon_usage');
  if(n===5)await this.sql('UPDATE coupons SET is_active=0 WHERE code=?',[code]);
  const email='ui-'+path.basename(process.env.HW02_RUN)+'-'+n+'@example.com';await this.sql('INSERT INTO users(name,email,password,role,login_attempts) VALUES(?,?,?,?,0)',['HW02 Coupon Demo',email,'Test1234!','user']);
  const user=await this.get('SELECT id FROM users WHERE email=?',[email]);const login=await this.request('/api/login',{email,password:'Test1234!'});const token=login.data.token;
  const coupon=await this.get('SELECT id FROM coupons WHERE code=?',[code]);if(n===14)await this.sql('INSERT INTO coupon_usage(coupon_id,user_id) VALUES(?,?)',[coupon.id,user.id]);
  const id=10001+n*2;await this.sql('INSERT INTO products(id,name,price,description,imageUrl,category_id) VALUES(?,?,?,?,?,?)',[id,'Giỏ thử '+tc.tc,total,'Dữ liệu riêng cho '+tc.id,'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>',1]);
  await this.page.goto('http://localhost:5173/login',{waitUntil:'domcontentloaded'});await this.page.evaluate(t=>{localStorage.clear();if(t)localStorage.setItem('token',t);},n===9?null:token);
  await this.page.goto('http://localhost:5173/product/'+id,{waitUntil:'domcontentloaded'});
  if(n!==9)await this.page.getByRole('button',{name:'Thoát',exact:true}).waitFor();
  const add=this.page.getByRole('button',{name:'Thêm vào giỏ hàng',exact:true});await add.dblclick();
  await this.page.getByRole('link',{name:'Giỏ hàng',exact:true}).click();await this.page.getByRole('heading',{name:'Giỏ Hàng',exact:true}).waitFor();
  // Navigate directly within the SPA for the deliberately unauthenticated coupon test.
  if(n===9)await this.page.evaluate(()=>{history.pushState({},'','/checkout');window.dispatchEvent(new PopStateEvent('popstate'));});
  else await this.page.getByRole('button',{name:'Tiến hành thanh toán',exact:true}).click();
  await this.page.getByPlaceholder('Nhập mã giảm giá...',{exact:true}).waitFor();
  const actual=Number(await this.page.getByRole('spinbutton').inputValue());if(actual!==total)throw Error('Cart fixture amount mismatch: '+actual);
  this.caseData={n,code,total};this.caseContext='Giỏ hàng '+total.toLocaleString('vi-VN')+' đ; '+(n===9?'chưa đăng nhập.':n===5?'mã đang bị vô hiệu hóa.':'đã đăng nhập, mã còn hạn; '+(n===14?'đã dùng 1/2 lượt.':'chưa dùng lượt.'));
 }));}
}
module.exports={define};
