# Lista plana de párrafos del docx (también dentro de tablas), en orden, con sus tramos de formato.
import re,sys,html,json
X=sys.argv[1]
d=open(X+'/word/document.xml',encoding='utf8').read()
body=d[d.index('<w:body>'):]
out=[]
for m in re.finditer(r'<w:p[ >].*?</w:p>',body,re.S):
    p=m.group(0)
    segs=[]
    for r in re.finditer(r'<w:hyperlink[^>]*>(.*?)</w:hyperlink>|<w:r[ >].*?</w:r>',p,re.S):
        g=r.group(0)
        if g.startswith('<w:hyperlink'):
            t=''.join(html.unescape(x) for x in re.findall(r'<w:t[^>]*>([^<]*)',r.group(1)))
            if t: segs.append({'t':t,'link':True})
            continue
        t=''.join(html.unescape(x) for x in re.findall(r'<w:t[^>]*>([^<]*)',g))
        if '<w:tab/>' in g: t='\t'+t
        if not t: continue
        rpr=re.search(r'<w:rPr>.*?</w:rPr>',g,re.S); rpr=rpr.group(0) if rpr else ''
        b=bool(re.search(r'<w:b/>|<w:b w:val="(1|true)"/>',rpr)); i=bool(re.search(r'<w:i/>|<w:i w:val="(1|true)"/>',rpr))
        col=re.search(r'<w:color w:val="([0-9A-Fa-f]{6})"',rpr); rojo=bool(col and col.group(1).upper()=='FF0000')
        segs.append({'t':t,'b':b,'i':i,'rojo':rojo})
    texto=''.join(s['t'] for s in segs)
    if not texto.strip(): continue
    out.append({'texto':texto,'segs':segs,'lista':bool(re.search(r'<w:numId ',p)),'rojo':all(s.get('rojo') for s in segs if s['t'].strip())})
json.dump(out,open(sys.argv[2],'w',encoding='utf8'),ensure_ascii=False,indent=0)
print(len(out))
