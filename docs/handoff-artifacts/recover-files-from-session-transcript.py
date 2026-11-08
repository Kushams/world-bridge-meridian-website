import json,re,subprocess,os,sys
P='/root/.claude/projects/-home-user-world-bridge-meridian-website/0316844d-3d3f-5b7a-823d-a9b0eb8a6451.jsonl'
W='/tmp/claude-0/-home-user-world-bridge-meridian-website/0316844d-3d3f-5b7a-823d-a9b0eb8a6451/scratchpad/recover'
KEEP={'ta-flow.mjs','sigpdf.mjs','ipad.mjs','wa.mjs','shot-email.mjs','hero.mjs','heroTop.mjs','build-diana.mjs','build-diana-docs.mjs','shot-diana.mjs','dbg-ta.mjs'}
cmds=[]
with open(P) as f:
    for line in f:
        try: ev=json.loads(line)
        except: continue
        c=(ev.get('message') or {}).get('content')
        if isinstance(c,list):
            for b in c:
                if b.get('type')=='tool_use' and b.get('name')=='Bash':
                    cmds.append(b['input'].get('command',''))
log=[]
for cmd in cmds:
    # ordered events inside one command
    events=[]
    for m in re.finditer(r"cat > (\S+) <<'(\w+)'\n(.*?)\n\2(?:\n|$)",cmd,re.S):
        events.append((m.start(),'create',m.group(1),m.group(3)))
    for m in re.finditer(r"python3(?: -I)? - <<'(\w+)'\n(.*?)\n\1(?:\n|$)",cmd,re.S):
        events.append((m.start(),'py',None,m.group(2)))
    for m in re.finditer(r"sed -i '((?:[^']|'\\'')*)' (\S+)",cmd):
        events.append((m.start(),'sed',m.group(2),m.group(1)))
    for _,kind,name,body in sorted(events):
        if kind=='create':
            base=os.path.basename(name)
            if base in KEEP:
                open(os.path.join(W,base),'w').write(body+'\n'); log.append(('create',base))
        elif kind=='py':
            if re.search(r"src/|supabase/|tests/|/home/user|earl-signature|ravi-signature|sigx",body): 
                continue
            if not any(k in body for k in KEEP|{'Reply_to_Diana','diana/'}): continue
            r=subprocess.run(['python3','-I','-c',body],cwd=W,capture_output=True,text=True)
            log.append(('py','ok' if r.returncode==0 else 'FAIL '+r.stderr[-120:].replace('\n',' ')))
        elif kind=='sed':
            if os.path.basename(name) in KEEP:
                r=subprocess.run(['sed','-i',body,os.path.join(W,os.path.basename(name))],capture_output=True,text=True)
                log.append(('sed',os.path.basename(name),'ok' if r.returncode==0 else 'FAIL'))
for l in log: print(l)
