import subprocess, sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, out, size, fps = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
HOLES = len(sys.argv) > 5
raw = subprocess.run(["ffmpeg","-v","error","-i",src,"-vf",f"fps={fps}","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout
W=H=640; n=len(raw)//(W*H*3)
frames=np.frombuffer(raw,np.uint8).reshape(n,H,W,3)
# shared crop box over all frames
masks=[]
for f in frames:
    d = 255 - f.min(axis=2)            # darkness
    bg = d < 18                        # near-white
    lab,_ = ndimage.label(bg)
    border = set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]]))) - {0}
    outside = np.isin(lab, list(border))
    if HOLES:
        pure = f.min(axis=2) >= 246
        lab2,n2 = ndimage.label(pure)
        sizes = ndimage.sum(pure, lab2, range(1,n2+1))
        big = np.isin(lab2, [i+1 for i,v in enumerate(sizes) if v > 150])
        outside = outside | big
    masks.append(~outside)
ys,xs=np.where(np.any(masks,axis=0))
pad=8; y0,y1=max(ys.min()-pad,0),min(ys.max()+pad,H); x0,x1=max(xs.min()-pad,0),min(xs.max()+pad,W)
imgs=[]
for f,m in zip(frames,masks):
    a = Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    im = Image.fromarray(f).convert("RGBA"); im.putalpha(a)
    im = im.crop((x0,y0,x1,y1)); im.thumbnail((size,size), Image.LANCZOS)
    imgs.append(im)
imgs[0].save(out, save_all=True, append_images=imgs[1:], duration=int(1000/fps), loop=0, quality=48, method=4, lossless=False)
imgs[0].save(out.replace(".webp","-still.webp"), quality=80)
print(out, n, imgs[0].size)
