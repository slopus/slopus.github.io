"""Keeps the real otter untouched and grades only the water behind it toward the meme panel's slate blue,
so the ripples stay but the otter separates from them. Writes 1310x964 JPGs.
python3 grade.py <src.mp4> <mask.mp4> <out-dir> [hex]"""
import os, subprocess, sys
import numpy as np
from PIL import Image

W, H = 1310, 964
src, mask, out = sys.argv[1:4]
tint = np.array([int((sys.argv[4] if len(sys.argv) > 4 else "#465a78")[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
os.makedirs(out, exist_ok=True)


def frames(path, gray=False):
    w, h = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                             "stream=width,height", "-of", "csv=p=0", path]).decode().split(","))
    fmt, c = ("gray", 1) if gray else ("rgb24", 3)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", fmt, "-"], stdout=subprocess.PIPE)
    while chunk := p.stdout.read(w * h * c):
        yield np.frombuffer(chunk, np.uint8).reshape(h, w, c).astype(np.float32) / 255


for i, (rgb, m) in enumerate(zip(frames(src), frames(mask, gray=True))):
    a = np.clip((m - 0.04) / 0.92, 0, 1)
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    water = tint * (0.7 + 1.6 * np.clip(lum, 0, 0.35))[..., None]  # dark water -> slate, highlights a touch lighter
    img = a * rgb + (1 - a) * np.clip(water, 0, 1)
    h = round(img.shape[1] * H / W)  # crop to the panel's aspect from the top
    frame = Image.fromarray((img[:h] * 255 + 0.5).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    frame.save(f"{out}/{i:04d}.jpg", quality=93)
print("wrote", i + 1, "frames to", out)
