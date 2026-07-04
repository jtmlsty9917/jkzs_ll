"""
使用 SAM 2 视频分割模型进行视频抠图
- 将帧转换为 JPEG（SAM 2 要求）
- 使用 tiny 模型进行视频分割
- 将 mask 应用到原始 PNG 帧，输出透明 PNG
"""
import torch
import numpy as np
from PIL import Image
import os
import sys
import time
import shutil

# ===== 路径配置 =====
FRAMES_IN = r"D:\vibecoding\jiankangzhushou\素材\frames_in"
FRAMES_OUT = r"D:\vibecoding\jiankangzhushou\素材\frames_sam2_out"
JPEG_DIR = r"D:\vibecoding\jiankangzhushou\素材\frames_jpeg"
CHECKPOINT = r"D:\vibecoding\sam2-main\sam2-main\checkpoints\sam2.1_hiera_tiny.pt"
CONFIG = r"D:\vibecoding\sam2-main\sam2-main\sam2\configs\sam2.1\sam2.1_hiera_t.yaml"

# 输出透明 PNG 目录（最终用于编码视频）
ALPHA_OUT = r"D:\vibecoding\jiankangzhushou\素材\frames_clean"

def _save_frame(frame_idx, mask, png_files, frames_in, frames_out, alpha_out):
    """保存遮罩和透明 PNG"""
    # 保存遮罩
    mask_img = Image.fromarray(mask, mode='L')
    mask_img.save(os.path.join(frames_out, f"mask_{frame_idx:04d}.png"))

    # 应用遮罩到原始 PNG，输出透明 PNG
    orig = Image.open(os.path.join(frames_in, png_files[frame_idx]))
    if orig.mode == 'RGB':
        orig = orig.convert('RGBA')
    elif orig.mode == 'P':
        orig = orig.convert('RGBA')

    rgba = np.array(orig)
    # 将遮罩应用到 alpha 通道
    rgba[:, :, 3] = mask
    result = Image.fromarray(rgba, mode='RGBA')
    out_name = png_files[frame_idx]  # 保持原始文件名
    result.save(os.path.join(alpha_out, out_name))


print("=" * 60)
print("SAM 2 视频抠图处理")
print("=" * 60)

# ===== 步骤1：将 PNG 转为 JPEG =====
print("\n[1/5] 将 PNG 帧转为 JPEG...")
os.makedirs(JPEG_DIR, exist_ok=True)
png_files = sorted([f for f in os.listdir(FRAMES_IN) if f.endswith('.png')])
print(f"  找到 {len(png_files)} 个 PNG 帧")

for i, f in enumerate(png_files):
    img = Image.open(os.path.join(FRAMES_IN, f)).convert('RGB')
    jpg_name = f"{i:05d}.jpg"  # SAM 2 期望数字编号的 JPEG
    img.save(os.path.join(JPEG_DIR, jpg_name), 'JPEG', quality=95)
    if (i + 1) % 30 == 0:
        print(f"  已转换 {i+1}/{len(png_files)} 帧...")
print(f"  JPEG 帧已保存到: {JPEG_DIR}")

# ===== 步骤2：加载 SAM 2 模型 =====
print("\n[2/5] 加载 SAM 2 模型...")
print(f"  检查点: {os.path.basename(CHECKPOINT)}")
print(f"  设备: CPU")
t0 = time.time()

from sam2.build_sam import build_sam2_video_predictor

predictor = build_sam2_video_predictor(CONFIG, CHECKPOINT, device="cpu")
print(f"  模型加载完成 ({time.time() - t0:.1f}s)")

# ===== 步骤3：初始化视频状态 =====
print("\n[3/5] 初始化视频推理状态...")
print(f"  处理 {len(png_files)} 帧 (720x1020)")
t0 = time.time()

with torch.inference_mode():
    state = predictor.init_state(video_path=JPEG_DIR, async_loading_frames=False)

video_h = state["video_height"]
video_w = state["video_width"]
print(f"  视频尺寸: {video_w}x{video_h}")
print(f"  初始化完成 ({time.time() - t0:.1f}s)")

# ===== 步骤4：在第一帧上添加点提示 =====
print("\n[4/5] 在第 0 帧上添加正向点提示...")
print(f"  提示位置: 中心点 ({video_w//2}, {video_h//2})")

with torch.inference_mode():
    # 使用中心点作为正向提示（狗在画面中央）
    points = np.array([[video_w // 2, video_h // 2]], dtype=np.float32)
    labels = np.array([1], dtype=np.int32)  # 1 = 前景（狗）

    frame_idx, obj_ids, masks = predictor.add_new_points_or_box(
        inference_state=state,
        frame_idx=0,
        obj_id=1,
        points=points,
        labels=labels,
    )
    print(f"  在第 {frame_idx} 帧添加了 {len(obj_ids)} 个对象的提示")

# ===== 步骤5：传播 mask 到所有帧并保存 =====
print("\n[5/5] 传播 mask 到所有帧并输出透明 PNG...")
os.makedirs(FRAMES_OUT, exist_ok=True)
os.makedirs(ALPHA_OUT, exist_ok=True)

t0 = time.time()
frame_count = 0

with torch.inference_mode():
    # 先保存第 0 帧
    mask_0 = (masks[0, 0] > 0.0).cpu().numpy().astype(np.uint8) * 255
    _save_frame(0, mask_0, png_files, FRAMES_IN, FRAMES_OUT, ALPHA_OUT)
    print(f"  已处理 1/{len(png_files)} 帧")
    frame_count = 1

    # 传播到其余帧
    for out_frame_idx, out_obj_ids, out_masks in predictor.propagate_in_video(state):
        mask = (out_masks[0, 0] > 0.0).cpu().numpy().astype(np.uint8) * 255
        _save_frame(out_frame_idx, mask, png_files, FRAMES_IN, FRAMES_OUT, ALPHA_OUT)
        frame_count += 1

        if frame_count % 30 == 0:
            elapsed = time.time() - t0
            fps = frame_count / elapsed
            print(f"  已处理 {frame_count}/{len(png_files)} 帧 ({fps:.1f} fps)")

total_time = time.time() - t0
print(f"\n✅ 处理完成!")
print(f"  总帧数: {frame_count}")
print(f"  总耗时: {total_time:.1f}s ({frame_count/total_time:.1f} fps)")
print(f"  遮罩输出: {FRAMES_OUT}")
print(f"  透明PNG输出: {ALPHA_OUT}")

# ===== 清理 =====
print(f"\n清理临时 JPEG 目录...")
shutil.rmtree(JPEG_DIR)
print("完成! 现在可以运行 ffmpeg 编码视频了。")
