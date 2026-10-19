if(process.env.HW02_DEMO==='1'){require('../helpers/fr15-ui.cjs').define();}else{
const {Harness,delay}=require('../helpers/harness.cjs');
const cases=require('../catalog.json').filter(c=>c.fr==='FR-15');const h=new Harness('FR-15');
beforeAll(()=>h.start());afterAll(()=>h.finish());
for(const tc of cases)test(tc.id+' — '+tc.name,()=>h.runCase(tc,async function(){
 const n=Number(tc.tc.slice(2)),token=await this.token(true);
 await this.sql('DELETE FROM products');
 await this.sql('INSERT INTO products(id,name,price,category_id,description,imageUrl) VALUES(?,?,?,?,?,?)',[1001,'SP_MUC_TIEU',100000,1,'','']);
 await this.sql('INSERT INTO products(id,name,price,category_id,description,imageUrl) VALUES(?,?,?,?,?,?)',[1002,'SP_DOI_CHUNG',200000,2,'','']);
 const before=await this.all('SELECT * FROM products ORDER BY id');
 if(n===2){const r=await this.request('/api/products/1001',undefined,token,'GET');this.check('View product',r.status,200);for(const k of ['id','name','price','category_id'])this.check('Product '+k,r.data[k],before[0][k]);return;}
 if(n===4){const r=await this.request('/api/products/1001',undefined,token,'DELETE');this.check('Delete successful',r.status,200);this.check('Target removed',await this.get('SELECT id FROM products WHERE id=1001')||null,null);this.check('Other products unchanged',await this.all('SELECT * FROM products ORDER BY id'),[before[1]]);return;}
 const update=tc.input.startsWith('Thao tác: Sửa');
 const nameLine=tc.input.match(/Tên sản phẩm: ([^\n]+)/)[1],priceLine=tc.input.match(/Giá: ([^\n]+)/)[1],categoryLine=tc.input.match(/Danh mục: ([^\n]+)/)[1];
 const data={name:'SP_THU_FR15',price:100000,category_id:1,description:'',imageUrl:''};
 if(nameLine.includes('bỏ trường'))delete data.name;
 else {data.name=nameLine.match(/"([^"]*)"/)[1];if(nameLine.includes('lặp đúng'))data.name=data.name.repeat(Number(nameLine.match(/lặp đúng (\d+)/)[1]));}
 if(priceLine.includes('bỏ trường'))delete data.price;
 else if(priceLine.startsWith('"'))data.price=priceLine.match(/"([^"]*)"/)[1];
 else data.price=Number(priceLine.split(' ')[0].replaceAll('.',''));
 if(categoryLine.includes('bỏ trường'))delete data.category_id;
 else if(categoryLine.includes('999999'))data.category_id=999999;
 else if(categoryLine.includes('Chưa chọn'))data.category_id='';
 else if(categoryLine.startsWith('DM_B'))data.category_id=2;
 const valid=typeof data.name==='string'&&data.name.length>=1&&data.name.length<=255&&typeof data.price==='number'&&data.price>0&&[1,2].includes(data.category_id);
 if(n===3){
  // UI-specific regression: observe immediately after saving, before reload.
  await this.page.goto('http://localhost:5174');await this.page.evaluate(t=>localStorage.setItem('adminToken',t),token);await this.page.reload();
  await this.page.getByText('Sản phẩm',{exact:true}).click();
  const row=this.page.locator('tr').filter({hasText:'SP_MUC_TIEU'});await row.getByRole('button',{name:'Sửa',exact:true}).click();
  await this.page.getByPlaceholder('Tên sản phẩm',{exact:true}).fill(data.name);await this.page.getByPlaceholder('Giá tiền',{exact:true}).fill(String(data.price));await this.page.locator('form select').selectOption(String(data.category_id));
  const response=this.page.waitForResponse(r=>r.url().endsWith('/api/products/1001')&&r.request().method()==='PUT');await this.page.getByRole('button',{name:'Lưu sản phẩm',exact:true}).click();await response;await delay(300);
  this.check('Other product name unchanged immediately after save',await this.page.getByText('SP_DOI_CHUNG',{exact:true}).count(),1);
  this.check('Only target has new name immediately after save',await this.page.getByText(data.name,{exact:true}).count(),1);
  await this.page.screenshot({path:require('path').join(process.env.HW02_RUN,tc.id+'-immediate.png'),fullPage:true});
  await this.page.reload();await this.page.getByText('Sản phẩm',{exact:true}).click();this.check('Other product unchanged after reload',await this.page.getByText('SP_DOI_CHUNG',{exact:true}).count(),1);
 }else{
  const r=await this.request('/api/products'+(update?'/1001':''),data,token,update?'PUT':'POST');this.observations={method:update?'PUT':'POST',payload:data,http:r.status,response:r.data};
  if(!valid)this.check('Invalid data rejected',r.status>=400,true);
  else this.check('Valid data accepted',r.status>=200&&r.status<300,true);
 }
 const after=await this.all('SELECT * FROM products ORDER BY id');
 if(!valid)this.check('Invalid request leaves database unchanged',after,before);
 else if(update){const target=after.find(p=>p.id===1001);for(const key of ['name','price','category_id'])this.check('Saved '+key,target[key],data[key]);this.check('Other products unchanged',after.filter(p=>p.id!==1001),before.filter(p=>p.id!==1001));}
 else {this.check('One product added',after.length,before.length+1);const added=after.find(p=>![1001,1002].includes(p.id));for(const key of ['name','price','category_id'])this.check('Created '+key,added?.[key],data[key]);}
}));

}
