if(process.env.HW02_DEMO==='1'){require('../helpers/fr09-ui.cjs').define();}else{
const fs=require('fs');const {Harness}=require('../helpers/harness.cjs');const {dependency,sut}=require('../helpers/deps.cjs');
const path=require('path');const cases=require('../catalog.json').filter(c=>c.fr==='FR-09');
const h=new Harness('FR-09');beforeAll(()=>h.start());afterAll(()=>h.finish());
for(const tc of cases)test(tc.id+' — '+tc.name,()=>h.runCase(tc,async function(){
 const n=Number(tc.tc.slice(2));await this.resetUser();
 const email='coupon-'+path.basename(process.env.HW02_RUN)+'-'+n+'@example.com';
 await this.sql('INSERT INTO users(name,email,password,role,login_attempts) VALUES(?,?,?,?,0)',['HW02 Coupon Fixture',email,'Test1234!','user']);
 const user=await this.get('SELECT id,email FROM users WHERE email=?',[email]);
 const login=await this.request('/api/login',{email,password:'Test1234!'});const fixtureToken=login.data.token;let token=fixtureToken;
 const code=tc.input.match(/Mã giảm giá: "([^"]+)"/)[1];const total=Number(tc.input.match(/Tổng đơn trước giảm: ([\d.]+)/)[1].replaceAll('.',''));
 let coupon=await this.get('SELECT * FROM coupons WHERE code=?',[code]);
 await this.sql('DELETE FROM coupon_usage');await this.sql('UPDATE coupons SET is_active=1,expired_at=?',['2099-12-31']);
 if(n===5)await this.sql('UPDATE coupons SET is_active=0 WHERE code=?',[code]);
 const time=new Date().toISOString();const offset=n===21?1000:n===7?-1000:0;
 if([6,7,21].includes(n)){fs.writeFileSync(process.env.HW02_CLOCK_FILE,time);await this.sql('UPDATE coupons SET expired_at=? WHERE code=?',[new Date(Date.parse(time)+offset).toISOString(),code]);}
 const used=([3,13,14,15].includes(n)?1:[11].includes(n)?1:[12,19].includes(n)?2:n===20?3:0);
 for(let i=0;i<used;i++)await this.sql('INSERT INTO coupon_usage(coupon_id,user_id) VALUES(?,?)',[coupon.id,user.id]);
 if(n===9)token=undefined;
 if(n===10){const source=fs.readFileSync(path.join(sut,'backend/server.js'),'utf8');const key=source.match(/SECRET_KEY\s*=\s*"([^"]+)"/)[1];token=dependency('jsonwebtoken').sign({id:user.id,role:'user',exp:1},key);}
 // Build the amount from a real server-side cart item and verify its product price.
 const fixture=await this.sql('INSERT INTO products(name,price,category_id) VALUES(?,?,?)',['HW02_COUPON_CART_'+Date.now(),total,1]);
 await this.request('/api/cart',{id:fixture.id,name:'HW02 coupon fixture',price:total,quantity:1},fixtureToken);
 const cart=await this.request('/api/cart',undefined,fixtureToken,'GET');this.check('Server cart contains requested test amount',cart.data.reduce((s,p)=>s+p.price*p.quantity,0),total);
 const persisted=await this.get('SELECT price FROM products WHERE id=?',[fixture.id]);this.check('Fixture total derives from persisted product',persisted.price,total);
 await this.banner(tc.id+' | '+tc.name,'API test: mã '+code+'; tổng giỏ hợp lệ '+total+' đ. Kết quả dựa trên response thật.');
 const response=await this.request('/api/apply-coupon',{code,total_amount:total,user_id:user.id},token);
 this.observations={http:response.status,response:response.data,coupon:code,total,used,controlled_clock:[6,7,21].includes(n)?time:null};
 const accepts=[1,2,3,14,15,17,18,21].includes(n);
 this.check('Coupon accepted',response.status===200&&response.data?.success===true,accepts);
 if(accepts){const discount=code==='SAVE10'?total*0.1:code==='BIGBUY'?50000:100000;this.check('Discount amount',response.data?.discount_amount,discount);this.check('Final amount',response.data?.final_amount,total-discount);}
 else this.check('Error returned',!!response.data?.error,true);
 fs.writeFileSync(process.env.HW02_CLOCK_FILE,'');
}));
afterEach(()=>{fs.writeFileSync(process.env.HW02_CLOCK_FILE,'');});

}
