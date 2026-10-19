"""Append an immutable AI interaction and regenerate template-shaped Markdown."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from datetime import datetime

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--root',required=True);ap.add_argument('--record',required=True)
    args=ap.parse_args();root=Path(args.root);record=json.loads(Path(args.record).read_text(encoding='utf-8-sig'))
    for key in ['request_key','tool','recorded_at','prompt','final_output','task']:
        if not isinstance(record.get(key),str) or not record[key].strip():raise ValueError('Missing '+key)
    dt=datetime.fromisoformat(record['recorded_at'])
    if dt.utcoffset() is None:raise ValueError('Timezone required')
    rid=hashlib.sha256(record['request_key'].encode()).hexdigest()[:16]
    location=root/'interactions'/rid
    target=location/'record.json'
    if target.exists():
        previous=json.loads(target.read_text(encoding='utf-8'))
        if any(previous[k]!=record[k] for k in ['request_key','tool','prompt','final_output','task']):
            raise ValueError('Existing request_key has different content; do not overwrite history')
        print('Audit already recorded:',rid);return
    paths=[Path(x) for x in record.get('artifacts',[])]
    for path in paths:
        if not path.is_absolute() or not path.is_file():raise ValueError('Missing absolute artifact: '+str(path))
    location.mkdir(parents=True,exist_ok=False)
    snapshots=[]
    for i,path in enumerate(paths,1):
        out=location/'artifacts'/f'{i:02}-{path.name}';out.parent.mkdir(exist_ok=True)
        shutil.copyfile(path,out)
        snapshots.append({'source':str(path),'snapshot':out.relative_to(root).as_posix(),'sha256':hashlib.sha256(out.read_bytes()).hexdigest()})
    record['snapshots']=snapshots;record['interaction_id']=rid
    (location/'prompt.md').write_text(record['prompt'],encoding='utf-8')
    (location/'output.md').write_text(record['final_output'],encoding='utf-8')
    target.write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf-8')
    from render_inline_audit import render
    report=root/'AI_Audit_Report.md'
    state=root/'generated_report_state.json'
    prior=json.loads(state.read_text(encoding='utf-8')) if state.exists() else {}
    if report.exists() and hashlib.sha256(report.read_bytes()).hexdigest()!=prior.get('sha256'):
        stamp=datetime.now().strftime('%Y%m%dT%H%M%S')
        backup=root/'prior_reports'/('before_auto_render_'+stamp+'.md')
        backup.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(report,backup)
    render(root)
    saved=json.loads(target.read_text(encoding='utf-8'))
    assert saved['prompt']==record['prompt'] and saved['final_output']==record['final_output']
    print('Audit saved and verified:',rid)

if __name__=='__main__':main()
