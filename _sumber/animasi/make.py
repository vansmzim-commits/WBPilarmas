import numpy as np
from PIL import Image
from cut import key
from scipy import ndimage
def frames_pos(path, min_gap=6):
    rgba=key(path); A=rgba[...,3]>40
    cols=A.sum(0)>0; segs=[];x=0;W=len(cols)
    while x<W:
        if cols[x]:
            s=x
            while x<W and (cols[x] or (x+min_gap<W and cols[x:x+min_gap].any())): x+=1
            if x-s>40: segs.append((s,x))
        x+=1
    out=[]
    for s,e in segs:
        sub=rgba[:,s:e]; m=sub[...,3]>40
        ys=np.where(m.any(1))[0]; xs=np.where(m.any(0))[0]
        im=Image.fromarray(sub[ys[0]:ys[-1]+1, xs[0]:xs[-1]+1])
        # horizontal anchor = centre of body column mass in lower-middle band (shorts/legs)
        mm=np.asarray(im)[...,3]>40; h=mm.shape[0]
        band=mm[int(h*.55):int(h*.8)]
        cx=np.where(band.any(0))[0].mean() if band.any() else im.width/2
        out.append(dict(im=im, top=ys[0], cx=cx))
    return out
def build(path, seq, durs, out, size=300, ground=True):
    fr=frames_pos(path)
    sel=[fr[i] for i in seq]
    L=max(f['cx'] for f in sel); R=max(f['im'].width-f['cx'] for f in sel)
    T=min(f['top'] for f in sel); B=max(f['top']+f['im'].height for f in sel)
    W=int(L+R)+4; H=int(B-T)+4
    ims=[]
    for f in sel:
        c=Image.new('RGBA',(W,H),(0,0,0,0))
        c.paste(f['im'],(int(L-f['cx'])+2, f['top']-T+2), f['im']); ims.append(c)
    sc=size/max(W,H); ns=(round(W*sc),round(H*sc))
    ims=[i.resize(ns,Image.LANCZOS) for i in ims]
    ims[0].save(out,save_all=True,append_images=ims[1:],duration=durs,loop=0,quality=80,method=6)
    ims[0].save(out.replace('.webp','-still.webp'),quality=85)
    print(out, ns, len(ims))
U='/mnt/user-data/uploads/'
# melambai: pose -> lambai 2x -> pose
build(U+'5f6faeb1-image.png',[0,1,2,1,2,1,3],[900,180,180,180,180,180,1100],'monpil-wave.webp')
# lompat gembira
build(U+'a832e45c-image.png',[0,1,2,3,2,1,4],[500,110,110,280,110,110,900],'monpil-jump.webp')
# lari
build(U+'6fdef94f-image.png',list(range(8)),[90]*8,'monpil-run.webp')
# jempol
build(U+'4b7a0d98-image.png',[0,1,2,1,3,4,5],[700,300,700,300,250,250,1300],'monpil-thumb.webp')
