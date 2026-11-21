"""Animasi karakter Pilarmas dari gambar asli (tanpa AI).
Setiap frame hanya memindahkan piksel gambar asli lewat warp halus,
jadi desain, warna, dan garis karakter tidak pernah digambar ulang."""
import math, sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

SRC = "/home/claude/web/site/assets/char-{}.webp"
PAD = 40
FPS, N = 10, 40          # 4 detik, berulang mulus


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def render(name, parts, glob, out, size=300):
    im = Image.open(SRC.format(name)).convert("RGBA")
    W, H = im.size
    can = Image.new("RGBA", (W + 2 * PAD, H + 2 * PAD), (0, 0, 0, 0))
    can.paste(im, (PAD, PAD))
    a = np.asarray(can).astype(np.float32) / 255.0
    rgb = a[..., :3] * a[..., 3:4]                       # premultiplied
    src = np.dstack([rgb, a[..., 3:4]])
    HH, WW = src.shape[:2]
    yy, xx = np.mgrid[0:HH, 0:WW].astype(np.float32)
    frames = []
    for f in range(N):
        t = f / N
        sx, sy = xx.copy(), yy.copy()
        # global: bounce / squash / sway (inverse map)
        g = glob(t)
        ax, ay = g["anchor"][0] + PAD, g["anchor"][1] + PAD
        th = math.radians(g.get("rot", 0))
        sxs, sys_ = g.get("sx", 1.0), g.get("sy", 1.0)
        dx, dy = g.get("dx", 0), g.get("dy", 0)
        px, py = xx - ax - dx, yy - ay - dy
        c, s = math.cos(-th), math.sin(-th)
        rx, ry = c * px - s * py, s * px + c * py
        gx, gy = rx / sxs + ax, ry / sys_ + ay
        # local parts: weighted rotation around a pivot
        ox, oy = gx.copy(), gy.copy()
        for p in parts:
            ang = math.radians(p["amp"] * math.sin(2 * math.pi * (p.get("freq", 1) * t + p.get("phase", 0))))
            cx, cy = p["center"][0] + PAD, p["center"][1] + PAD
            pvx, pvy = p["pivot"][0] + PAD, p["pivot"][1] + PAD
            d = np.hypot(gx - cx, gy - cy)
            w = smooth(1 - d / p["radius"])
            c, s = math.cos(-ang), math.sin(-ang)
            qx, qy = gx - pvx, gy - pvy
            tx, ty = c * qx - s * qy + pvx, s * qx + c * qy + pvy
            ox += w * (tx - gx)
            oy += w * (ty - gy)
        chans = [map_coordinates(src[..., k], [oy, ox], order=1, mode="constant", cval=0) for k in range(4)]
        A = np.clip(chans[3], 0, 1)
        RGB = np.dstack(chans[:3]) / np.maximum(A, 1e-4)[..., None]
        fr = np.dstack([np.clip(RGB, 0, 1), A])
        frames.append(Image.fromarray((fr * 255).astype(np.uint8), "RGBA"))
    # crop to union bbox and scale
    box = None
    for fr in frames:
        b = fr.getbbox()
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    frames = [fr.crop(box) for fr in frames]
    sc = size / max(frames[0].size)
    ns = (round(frames[0].width * sc), round(frames[0].height * sc))
    frames = [fr.resize(ns, Image.LANCZOS) for fr in frames]
    frames[0].save(out, save_all=True, append_images=frames[1:], duration=int(1000 / FPS),
                   loop=0, quality=58, method=4)
    print(out, ns)


def bounce(t, h, hops=2):
    v = abs(math.sin(math.pi * hops * t))
    return -h * v


RIGS = {
    "monpil": dict(
        parts=[
            dict(center=(55, 165), radius=120, pivot=(175, 240), amp=14, freq=2),            # kepalan tangan dipompa
            dict(center=(420, 215), radius=100, pivot=(380, 300), amp=8, freq=1, phase=.25), # toples ubur-ubur
            dict(center=(200, 120), radius=150, pivot=(215, 245), amp=3, freq=1),            # kepala miring
        ],
        glob=lambda t: dict(anchor=(240, 515), dy=bounce(t, 12),
                            sy=1 + 0.03 * math.cos(2 * math.pi * 2 * t), sx=1 - 0.015 * math.cos(2 * math.pi * 2 * t),
                            rot=2 * math.sin(2 * math.pi * t)),
    ),
    "bungjin": dict(
        parts=[
            dict(center=(35, 150), radius=80, pivot=(80, 230), amp=9, freq=2),               # jempol
            dict(center=(320, 440), radius=130, pivot=(230, 330), amp=7, freq=1, phase=.1),  # ekor
            dict(center=(110, 85), radius=115, pivot=(130, 190), amp=4, freq=1, phase=.5),   # kepala
        ],
        glob=lambda t: dict(anchor=(110, 515), dy=bounce(t, 5),
                            sy=1 + 0.015 * math.cos(2 * math.pi * 2 * t), rot=1.5 * math.sin(2 * math.pi * t)),
    ),
    "halaf": dict(
        parts=[
            dict(center=(60, 80), radius=115, pivot=(110, 210), amp=6, freq=1),              # kepala mengangguk
            dict(center=(355, 120), radius=85, pivot=(325, 170), amp=14, freq=2, phase=.2),  # ekor
        ],
        glob=lambda t: dict(anchor=(200, 515), sy=1 + 0.018 * math.sin(2 * math.pi * 2 * t),
                            rot=1.2 * math.sin(2 * math.pi * t)),
    ),
}

if __name__ == "__main__":
    for n in (sys.argv[1:] or RIGS):
        render(n, RIGS[n]["parts"], RIGS[n]["glob"], f"/home/claude/rig/anim-{n}.webp")
