"""
合并 SAM 2 和 U2-Net 的 mask：
- 取两个 mask 的并集（保留完整轮廓，尤其是尾巴）
- SAM 2 覆盖区域：使用 SAM 2 的无偏色 RGB
- 仅 U2-Net 覆盖区域：使用原始帧的 RGB（避免 AI 偏色）
"""
import numpy as np
from PIL import Image
import os

SAM2_DIR = r"D:\vibecoding\jiankangzhushou\素材\frames_clean"
U2NET_DIR = r"D:\vibecoding\jiankangzhushou\素材\frames_out"
ORIG_DIR = r"D:\vibecoding\jiankangzhushou\素材\frames_in"
OUT_DIR = r"D:\vibecoding\jiankangzhushou\素材\frames_merged"

MASK_DIR = r"D:\vibecoding\jiankangzhushou\素材\frames_sam2_out"

os.makedirs(OUT_DIR, exist_ok=True)

files = sorted([f for f in os.listdir(SAM2_DIR) if f.endswith('.png')])
print(f'Processing {len(files)} frames...')

for i, fname in enumerate(files):
    # 加载 SAM 2 输出（干净 RGB + alpha）
    sam2 = Image.open(os.path.join(SAM2_DIR, fname)).convert('RGBA')
    sam2_arr = np.array(sam2)
    sam2_rgb = sam2_arr[:, :, :3]
    sam2_alpha = sam2_arr[:, :, 3]

    # 加载 U2-Net 输出（获取其 alpha mask）
    u2net = Image.open(os.path.join(U2NET_DIR, fname)).convert('RGBA')
    u2net_alpha = np.array(u2net)[:, :, 3]

    # 加载原始帧（无 AI 处理）
    orig = Image.open(os.path.join(ORIG_DIR, fname)).convert('RGB')
    orig_arr = np.array(orig)

    # 构建并集 mask
    sam2_mask = sam2_alpha > 128
    u2net_mask = u2net_alpha > 128
    union_mask = sam2_mask | u2net_mask

    # 构建输出
    out_arr = np.zeros((sam2_arr.shape[0], sam2_arr.shape[1], 4), dtype=np.uint8)

    # SAM 2 覆盖的区域：使用 SAM 2 的颜色
    out_arr[sam2_mask, :3] = sam2_rgb[sam2_mask]
    out_arr[sam2_mask, 3] = 255

    # 仅 U2-Net 覆盖但 SAM 2 不覆盖的区域：使用原始帧颜色
    u2net_only = u2net_mask & ~sam2_mask
    out_arr[u2net_only, :3] = orig_arr[u2net_only]
    out_arr[u2net_only, 3] = 255

    # 保存
    out_img = Image.fromarray(out_arr, mode='RGBA')
    out_img.save(os.path.join(OUT_DIR, fname))

    if (i + 1) % 30 == 0:
        # 统计
        sam2_only = (sam2_mask & ~u2net_mask).sum()
        u2net_only_count = u2net_only.sum()
        union_count = union_mask.sum()
        print(f'  {fname}: union={union_count}, sam2-only={sam2_only}, u2net-only={u2net_only_count}')

print(f'\nDone! Output: {OUT_DIR}')
