"""Render complete prompt/output in AI-02 cells, with no file dependencies."""
from pathlib import Path
from datetime import datetime,timezone,timedelta
import json,html,hashlib

def cell(text):
    value=html.escape(text,quote=False)
    for a,b in [('|','&#124;'),('`','&#96;'),('*','&#42;'),('_','&#95;'),('[','&#91;'),(']','&#93;')]:value=value.replace(a,b)
    return value.replace('\r','&#13;').replace('\n','<br>')

def clock(text):
    return datetime.fromisoformat(text.replace('Z','+00:00')).astimezone(timezone(timedelta(hours=7))).strftime('%H:%M:%S %d/%m/%Y')

def collect(root):
    items=[]
    for path in (root/'history').glob('*/index.json'):
        idx=json.loads(path.read_text(encoding='utf-8'))
        for ent in idx['interactions']:
            r=json.loads((root/ent['record']).read_text(encoding='utf-8'))
            items.append({'id':r['interaction_id'],'key':r['turn_id'],'timestamp':r['prompts'][0]['timestamp_utc'],
                          'prompts':[{'text':m['text'],'timestamp':m['timestamp_local']} for m in r['prompts']],
                          'outputs':[{'text':m['text'],'timestamp':m['timestamp_local'],'phase':m['phase']} for m in r['outputs']]})
    historical=['\n\n'.join(m['text'] for m in r['prompts']) for r in items]
    for path in (root/'interactions').glob('*/record.json'):
        r=json.loads(path.read_text(encoding='utf-8'))
        if any(r['prompt'].strip() in p for p in historical):continue
        items.append({'id':'AI-LOCAL-'+r['interaction_id'],'key':r['request_key'],'timestamp':r.get('source_timestamp') or r['recorded_at'],
                      'prompts':[{'text':r['prompt'],'timestamp':r.get('source_timestamp') or r['recorded_at']}],
                      'outputs':[{'text':r['final_output'],'timestamp':r['recorded_at'],'phase':'final_answer'}]})
    items.sort(key=lambda r:r['timestamp'])
    return items

def render(root):
    root=Path(root);items=collect(root)
    reviews={}
    rp=root/'human_review.json'
    if rp.exists():
        reviews=json.loads(rp.read_text(encoding='utf-8'))
        if not isinstance(reviews,dict):raise ValueError('human_review.json must map interaction key to review')
    out=['# AI Audit Report HW02\n\nTôi sử dụng công cụ AI cho các nhiệm vụ sau:\n\n',
    '- Đọc đề và đặc tả, giải thích lý thuyết, chọn chức năng HW02.\n- Thiết kế test và skill, tạo/chỉnh báo cáo, tìm template và ghi audit.\n\n',
    '## 1. Thông tin Sinh viên\n\n| Mục | Giá trị |\n| --- | --- |\n| Họ tên | NGUYỄN SƠN TÙNG |\n| MSSV | 23120399 |\n| Lớp / Khoá | Chờ xác nhận cho HW02 |\n| Mã bài tập | HW02 |\n| Công cụ AI | Codex |\n\n',
    'Tên và MSSV lấy từ mẫu AI-02 người dùng cung cấp; không mang ngày, chữ ký và kết quả HW01 sang HW02.\n\n',
    '## 2. Hướng dẫn\n\nPrompt và output được ghi đầy đủ ngay trong cột (1) và (2), không thay bằng liên kết hoặc tóm tắt. Công cụ hiển thị là Codex. Thời gian theo HH:mm:ss dd/MM/yyyy, múi giờ UTC+07:00. Dòng nhãn phân biệt prompt bổ sung, commentary và phản hồi cuối; nội dung bên trong giữ nguyên văn. Các ký hiệu Markdown/HTML được mã hóa để hiển thị đúng trong ô bảng. Nếu nội dung gốc chứa URL hoặc tên model thì vẫn giữ như một phần nguyên văn, không dùng làm liên kết thay thế nội dung audit.\n\n',
    'Cột Verdict chỉ điền VALID, INVALID hoặc INCOMPLETE khi có đánh giá thực tế của sinh viên. Ô trống nghĩa là chưa được đánh giá, không phải một verdict thứ tư. Không tự dịch nhãn hoặc tự nhận đã rà soát.\n\n',
    '## 3. Bảng Audit — 1 hàng / artifact hội thoại\n\n',
    'Mỗi hàng ghi một tương tác hội thoại. Nội dung output dưới đây là thông điệp AI hiển thị, chưa bao gồm bytes của mọi file lịch sử hoặc tool log. Snapshot và record kỹ thuật được giữ riêng để truy vết nhưng không bắt buộc mở hoặc đính kèm để đọc hai cột đầu.\n\n',
    '| (1) Prompt + Công cụ | (2) Output AI | (3) Verdict | (4) Lý do (ISTQB) | (5) Bản SV sửa |\n| --- | --- | --- | --- | --- |\n']
    appendix=['# Appendix A Nhật ký prompt và output nguyên văn\n\nCông cụ: Codex. Múi giờ: UTC+07:00. Thời gian HH:mm:ss dd/MM/yyyy.\n\n']
    counts={v:0 for v in ['VALID','INVALID','INCOMPLETE']}
    for item in items:
        rev=reviews.get(item['key'],{});verdict=rev.get('verdict','')
        if verdict and verdict not in counts:raise ValueError('Unsupported verdict '+verdict)
        if verdict:counts[verdict]+=1
        a=item['id']+'\nCông cụ: Codex\n'
        for j,m in enumerate(item['prompts'],1):a+='\nNgày và giờ: '+clock(m['timestamp'])+f'\nPrompt {j} nguyên văn:\n'+m['text']
        b=''
        for j,m in enumerate(item['outputs'],1):b+=f"\nOutput {j} ({'Phản hồi cuối' if m['phase']=='final_answer' else 'Cập nhật tiến độ'}), {clock(m['timestamp'])}:\n"+m['text']
        values=[cell(a),cell(b),verdict,cell(rev.get('reason','')),cell(rev.get('student_revision',''))]
        out.append('| '+' | '.join(values)+' |\n')
        # Lossless check for literal prompt and output in table cells.
        for content,encoded in [(a,values[0]),(b,values[1])]:
            assert html.unescape(encoded.replace('<br>','\n'))==content
        appendix.append('## '+item['id']+'\n\n### Tên công cụ AI\nCodex\n\n### Ngày và giờ\n'+clock(item['timestamp'])+'\n\n### Prompt của bạn\n\n')
        for m in item['prompts']:appendix.append(m['text']+'\n\n')
        appendix.append('### Output của AI\n\n')
        for m in item['outputs']:appendix.append(m['text']+'\n\n')
    reviewed=sum(counts.values());total=len(items)
    out.append(f'\n## 4. Tổng kết Độ chính xác AI\n\nTổng artifact hội thoại ghi nhận: {total}. Đã có verdict: {reviewed}. Chưa đánh giá: {total-reviewed}.\n\n| Verdict | Số lượng đã xác nhận | Tỉ lệ trên nhóm đã đánh giá |\n| --- | --- | --- |\n')
    for v,n in counts.items():out.append(f'| {v} | {n} | '+(f'{n/reviewed:.2%}' if reviewed else 'Chưa tính')+' |\n')
    out.extend(['\n## 5. Kết luận — Khi nào nên / không nên dùng AI?\n\nChưa có kết luận 80–150 chữ được sinh viên xác nhận. Phần này không thay AI Critique 200–300 từ.\n',
    '\n## 6. Mandatory Disclosure\n\nChưa điền câu cam đoan hoặc ký thay sinh viên. Cần xác nhận phần AI đóng góp, phần sinh viên sửa/tự viết theo thực tế.\n',
    '\n## Chữ ký\n\nChưa ký. Ngày ký và giảng viên chưa xác nhận.\n',
    '\n## Tham khảo\n\nĐề HW02 mục 9, mẫu AI-02 do người dùng cung cấp và lịch sử chính cuộc trò chuyện Codex này.\n'])
    report=''.join(out)
    (root/'AI_Audit_Report.md').write_text(report,encoding='utf-8')
    (root/'Appendix_A_Prompt_Log.md').write_text(''.join(appendix),encoding='utf-8')
    (root/'generated_report_state.json').write_text(json.dumps({'sha256':hashlib.sha256(report.encode()).hexdigest(),'owner':'inline-audit'}),encoding='utf-8')
    print(f'Rendered {total} interactions inline; {reviewed} reviewed; lossless cell verification passed.')
    template=Path(__file__).parent.parent/'references'/'AI-02_Template_Vn.docx'
    if template.exists():
        from sync_template_formats import sync
        sync(root,template)
    return total

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--root',required=True);render(p.parse_args().root)
