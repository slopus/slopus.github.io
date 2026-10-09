import random
random.seed(7)
INK="#183f38"; MUTED="#6b7f78"; ACC="#e6522c"
j=lambda a=1.2: random.uniform(-a,a)
def line(x1,y1,x2,y2,w=1.6,c=INK,a=1.0):
    n=max(2,int(abs(x2-x1)+abs(y2-y1))//40+1)
    pts=[(x1+j(.5),y1+j(.5))]
    for i in range(1,n):
        t=i/n; pts.append((x1+(x2-x1)*t+j(a),y1+(y2-y1)*t+j(a)))
    pts.append((x2+j(.5),y2+j(.5)))
    d="M"+" L".join(f"{x:.1f} {y:.1f}" for x,y in pts)
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def rect(x,y,w,h,sw=1.6,c=INK,fill=None):
    out=[]
    if fill: out.append(f'<path d="M{x+2} {y+2} L{x+w-1} {y+1} L{x+w-2} {y+h-1} L{x+1} {y+h-2} Z" fill="{fill}"/>')
    out+= [line(x,y,x+w+1,y+j(.6),sw,c),line(x+w,y-1,x+w+j(.6),y+h+1,sw,c),
           line(x+w+1,y+h,x-1,y+h+j(.6),sw,c),line(x,y+h+1,x+j(.6),y-1,sw,c)]
    return "\n".join(out)
def circle(cx,cy,r,c=INK,w=1.6,dash=None,rx=None):
    rx=rx or r; pts=[]
    import math
    for i in range(0,26):
        t=i/24*2*math.pi+0.3
        k=1+j(.04)
        pts.append((cx+rx*k*math.cos(t),cy+r*k*math.sin(t)))
    d="M"+" L".join(f"{x:.1f} {y:.1f}" for x,y in pts)
    da=f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{da}/>'
def bar(x,y,w,c=MUTED,sw=1.5): return line(x,y,x+w,y+j(.8),sw,c,1.0)
def text(x,y,s,size=13,c=INK,wt=400,anchor=None):
    a=f' text-anchor="{anchor}"' if anchor else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}"{a}>{s}</text>'
def doc(x,y): return line(x,y,x+7,y,1.3)+line(x+7,y,x+10,y+3,1.3)+line(x+10,y+3,x+10,y+13,1.3)+line(x+10,y+13,x,y+13,1.3)+line(x,y+13,x,y,1.3)+line(x+2.5,y+6,x+7.5,y+6,1.1)+line(x+2.5,y+9,x+7.5,y+9,1.1)
def prev(x,y): return rect(x,y,12,10,1.3)+line(x,y+3,x+12,y+3,1.1)

o=[]
o.append('<rect x="0" y="0" width="720" height="400" rx="12" fill="#fffdf8"/>')
o.append(rect(4,4,712,392,1.8))
o.append(line(230,10,230,390,1.5))
o.append(rect(12,14,206,42,1.6,INK,"#f6eadf"))
o.append(circle(34,35,11)); o.append(circle(30,33,1,w=2)); o.append(circle(38,33,1,w=2))
o.append(line(29,39,34,41,1.3)); o.append(line(34,41,39,39,1.3))
o.append(text(54,32,"Your agent",13,INK,700)); o.append(text(54,48,"2 things need you",11,MUTED))
o.append(f'<circle cx="204" cy="35" r="3.5" fill="{ACC}"/>')
o.append(rect(12,199,206,30,1.4,INK,"#efe9dc"))
for args in [(26,90,26,146),(26,112,36,112),(26,146,36,146),(48,156,48,180),(48,180,58,180),(26,224,26,248),(26,248,36,248)]:
    o.append(line(*args,1.3,MUTED,.6))
o.append(circle(26,78,7)); o.append(circle(26,214,7))
o.append(doc(44,241))
o.append(line(22,281,27,286,1.6)); o.append(line(27,286,22,291,1.6))
for x,y,s,wt in [(44,82,"Release health",400),(44,116,"Subscriptions",700),(44,150,"Analytics",400),(64,184,"Mobile analytics",400),
                 (44,219,"Where are we going?",700),(64,252,"Wireframe",400),(36,290,"Auth issues",700)]:
    o.append(text(x,y,s,13,INK,wt))
o.append(text(214,116,"+194 −30",11,MUTED,400,"end")); o.append(text(214,290,"+1.7k −20",11,MUTED,400,"end"))
X=260
o.append(text(X,44,"Where are we going?",18,INK,700)); o.append(text(X,62,"Rewritten 2 min ago",11,MUTED))
o.append(bar(X,84,140,INK,2.2))
for y,w in [(104,410),(118,380),(132,260)]: o.append(bar(X,y,w))
o.append(rect(X,148,420,72,1.5))
pts=[(276,206),(320,199),(364,202),(408,189),(452,191),(496,177),(540,180),(584,166),(628,163),(664,154)]
o.append('<path d="M'+" L".join(f"{x+j(.8):.1f} {y+j(.8):.1f}" for x,y in pts)+f'" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>')
for y,w in [(240,400),(254,320),(268,370),(292,390),(306,250)]: o.append(bar(X,y,w))
o.append(circle(420,254,11,ACC,1.6,None,168))
o.append(text(600,258,"cut this",12,ACC,700))
o.append(rect(256,340,428,40,1.6))
o.append(text(272,365,"Talk, or mark up the page",13,MUTED))
svg=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" font-family="\'Shantell Sans\', \'Comic Sans MS\', \'Chalkboard SE\', \'Segoe Print\', cursive">\n'
     +"\n".join(o)+"\n</svg>\n")
open("wireframe-v4.svg","w").write(svg)
