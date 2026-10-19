const {Harness,delay}=require('./harness.cjs');const path=require('path');
const all=require('../catalog.json').filter(c=>c.fr==='FR-15'),selected=new Set(['TC01','TC02','TC03','TC04','TC07','TC10']);
const picture='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"/>';
async function showTable(h){await h.page.locator('tbody').last().evaluate(e=>{const table=e.closest('table');let spacer=document.getElementById('hw02-table-reading-space');if(!spacer){spacer=document.createElement('div');spacer.id='hw02-table-reading-space';spacer.style.height='350px';spacer.setAttribute('aria-hidden','true');table.after(spacer);}e.scrollIntoView({block:'center'});});}
function define(){const h=new Harness('FR-15');beforeAll(()=>h.start());afterAll(()=>h.finish());
 for(const tc of all){if(!selected.has(tc.tc)){test.skip(tc.id+' — '+tc.name,()=>{});continue;}
 test(tc.id+' — '+tc.name,()=>h.runCase(tc,async function(){
  const n=Number(tc.tc.slice(2)),before=this.caseData.before;
  if(n===2){await showTable(this);const r=await this.request('/api/products/1001',undefined,this.caseData.token,'GET');this.check('UI hiển thị sản phẩm đích',await this.page.getByText('SP_MUC_TIEU',{exact:true}).count(),1);this.check('Tên sản phẩm đọc được',r.data?.name,'SP_MUC_TIEU');this.check('Giá sản phẩm đọc được',r.data?.price,100000);this.check('Danh mục sản phẩm đọc được',r.data?.category_id,1);return;}
  if(n===4){const row=this.page.locator('tbody tr').filter({has:this.page.getByText('SP_MUC_TIEU',{exact:true})});const button=row.getByRole('button',{name:'Xóa',exact:true});await this.beforeAction(button,'Xóa SP_MUC_TIEU; sản phẩm đối chứng phải giữ nguyên.');const pending=this.page.waitForResponse(r=>r.url().endsWith('/api/products/1001')&&r.request().method()==='DELETE');await button.click();await pending;await this.page.getByText('SP_MUC_TIEU',{exact:true}).waitFor({state:'hidden'});await showTable(this);const after=await this.all('SELECT * FROM products ORDER BY id');this.check('Sản phẩm đích đã bị xóa',after.some(p=>p.id===1001),false);this.check('Sản phẩm khác không đổi',JSON.stringify(after)===JSON.stringify([before[1]]),true);this.observations={before,after};return;}
  if(n===3){const row=this.page.locator('tbody tr').filter({has:this.page.getByText('SP_MUC_TIEU',{exact:true})});await row.getByRole('button',{name:'Sửa',exact:true}).click();}
  const name=n===7?'A'.repeat(256):n===3?'SP_THU_FR15_DA_SUA':'SP_THU_FR15',price=n===10?0:n===3?150000:100000,category=n===3?'2':'1';
  await this.fillField(this.page.getByPlaceholder('Tên sản phẩm',{exact:true}),name,'tên sản phẩm');
  await this.fillField(this.page.getByPlaceholder('Giá tiền',{exact:true}),price,'giá tiền');
  const select=this.page.locator('form select');await select.evaluate(e=>e.scrollIntoView({block:'center'}));await this.banner(tc.id+' | Chọn danh mục','Chọn danh mục '+(category==='1'?'Điện thoại':'Laptop')+' có sẵn. Dừng 1,5 giây sau khi chọn.');await select.selectOption(category);await delay(1500);
  const button=this.page.getByRole('button',{name:'Lưu sản phẩm',exact:true});await this.beforeAction(button,'Lưu sản phẩm với dữ liệu đã nhập.');
  const pending=this.page.waitForResponse(r=>r.url().endsWith(n===3?'/api/products/1001':'/api/products')&&r.request().method()===(n===3?'PUT':'POST'));
  await button.click();const response=await pending;await delay(700);await showTable(this);
  const after=await this.all('SELECT * FROM products ORDER BY id');this.observations={http:response.status(),before,after,payload:{name,price,category_id:Number(category)},immediate_names:await this.page.locator('tbody tr td:nth-child(2)').allTextContents()};
  if(n===3){
   this.check('Đối chứng giữ tên ngay sau lưu',await this.page.getByText('SP_DOI_CHUNG',{exact:true}).count(),1);
   this.check('Chỉ sản phẩm đích có tên mới ngay sau lưu',await this.page.getByText(name,{exact:true}).count(),1);
   await this.banner(tc.id+' | Quan sát ngay sau lưu','Chỉ SP_MUC_TIEU được đổi tên; SP_DOI_CHUNG phải giữ nguyên.\nTên hiển thị thực tế: '+this.observations.immediate_names.join(' | '),'#7f1d1d');await delay(3500);
   await this.page.screenshot({path:path.join(process.env.HW02_RUN,tc.id+'-immediate.png'),fullPage:true});
   await this.page.reload({waitUntil:'domcontentloaded'});await this.page.getByText('Sản phẩm',{exact:true}).click();await this.page.getByText('SP_DOI_CHUNG',{exact:true}).waitFor();await showTable(this);
   this.check('Đối chứng giữ tên sau tải lại',await this.page.getByText('SP_DOI_CHUNG',{exact:true}).count(),1);
   const target=after.find(p=>p.id===1001);this.check('Tên sản phẩm đích đã lưu',target.name,name);this.check('Giá và danh mục sản phẩm đích đúng',target.price===price&&target.category_id===Number(category),true);this.check('CSDL sản phẩm đối chứng không đổi',JSON.stringify(after.find(p=>p.id===1002))===JSON.stringify(before[1]),true);
  }else if(n===1){const added=after.find(p=>p.id!==1001&&p.id!==1002);await this.page.reload({waitUntil:'domcontentloaded'});await this.page.getByText('Sản phẩm',{exact:true}).click();await this.page.getByText(name,{exact:true}).waitFor();await showTable(this);this.check('Thêm đúng một sản phẩm',after.length,before.length+1);this.check('Tên lưu đúng',added?.name,name);this.check('Giá và danh mục lưu đúng',added?.price===price&&added?.category_id===Number(category),true);}
  else {this.check('Dữ liệu không hợp lệ bị từ chối',response.status()>=400,true);this.check('Không tăng số sản phẩm',after.length,before.length);this.check('CSDL giữ nguyên khi dữ liệu không hợp lệ',JSON.stringify(after)===JSON.stringify(before),true);}
 },async function(){
  const token=await this.token(true);await this.sql('DELETE FROM products');
  for(const p of [[1001,'SP_MUC_TIEU',100000,1],[1002,'SP_DOI_CHUNG',200000,2]])await this.sql('INSERT INTO products(id,name,price,category_id,description,imageUrl) VALUES(?,?,?,?,?,?)',[...p,'',picture]);
  const before=await this.all('SELECT * FROM products ORDER BY id');
  await this.page.goto('http://localhost:5174',{waitUntil:'domcontentloaded'});await this.page.evaluate(t=>{localStorage.clear();localStorage.setItem('adminToken',t);},token);await this.page.reload({waitUntil:'domcontentloaded'});
  await this.page.getByText('Sản phẩm',{exact:true}).click();await this.page.getByText('SP_MUC_TIEU',{exact:true}).waitFor();
  if(['TC02','TC04'].includes(tc.tc))await showTable(this);else await this.page.getByPlaceholder('Tên sản phẩm',{exact:true}).evaluate(e=>e.scrollIntoView({block:'center'}));
  this.caseData={token,before};this.caseContext='Admin đã đăng nhập; sản phẩm đích và sản phẩm đối chứng được chuẩn bị riêng; hai danh mục có sẵn.';
 }));}
}
module.exports={define};
