import sys, numpy as np
from PIL import Image
from scipy import ndimage
def key(path):
    a=np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r,g,b=a[...,0],a[...,1],a[...,2]
    # magenta-ness: high R & B, low G
    m=np.clip(((np.minimum(r,b)-g)-60)/120,0,1)       # 1 = pure magenta bg
    alpha=1-m
    # despill: pull magenta out of semi-transparent edge pixels
    spill=np.minimum(r,b)-g
    adj=a.copy()
    k=(spill>0)&(alpha<1)
    adj[...,0]=np.where(k,np.minimum(r,g+ (r-g)*alpha),r)
    adj[...,2]=np.where(k,np.minimum(b,g+ (b-g)*alpha),b)
    alpha=ndimage.grey_erosion(alpha,size=(2,2))
    rgba=np.dstack([np.clip(adj,0,255),alpha*255]).astype(np.uint8)
    return rgba
def frames(path, min_gap=6):
    rgba=key(path); A=rgba[...,3]>40
    cols=A.sum(0)>0
    segs=[];x=0;W=len(cols)
    while x<W:
        if cols[x]:
            s=x
            while x<W and (cols[x] or (x+min_gap<W and cols[x:x+min_gap].any())): x+=1
            if x-s>40: segs.append((s,x))
        x+=1
    out=[]
    for s,e in segs:
        sub=rgba[:,s:e]; m=sub[...,3]>40
        ys=np.where(m.any(1))[0]; out.append(Image.fromarray(sub[ys[0]:ys[-1]+1]))
    return out
if __name__=='__main__':
    for p in sys.argv[1:]:
        fs=frames(p); print(p, len(fs), [f.size for f in fs])
