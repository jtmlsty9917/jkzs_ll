"""
使用 SAM2 对 logo 图片自动抠图，移除米色背景，生成透明 PNG
"""
import os
import sys
import numpy as np
from PIL import Image
import torch

# 设置路径
SAM2_DIR = r"D:\vibecoding\sam2-main\sam2-main"
sys.path.insert(0, SAM2_DIR)
os.chdir(SAM2_DIR)

from sam2.build_sam import build_sam2
from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator

# 输入输出目录
INPUT_DIR = r"d:\vibecoding\jiankangzhushou\public\logos"
OUTPUT_DIR = r"d:\vibecoding\jiankangzhushou\public\logos"

# 选择设备
if torch.cuda.is_available():
    device = torch.device("cuda")
    torch.autocast("cuda", dtype=torch.bfloat16).__enter__()
    if torch.cuda.get_device_properties(0).major >= 8:
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
elif torch.backends.mps.is_available():
    device = torch.device("mps")
else:
    device = torch.device("cpu")
print(f"使用设备: {device}")

# 加载模型
print("加载 SAM2 模型...")
sam2_checkpoint = "checkpoints/sam2.1_hiera_large.pt"
model_cfg = "configs/sam2.1/sam2.1_hiera_l.yaml"

sam2 = build_sam2(model_cfg, sam2_checkpoint, device=device, apply_postprocessing=False)

# 自动掩码生成器
mask_generator = SAM2AutomaticMaskGenerator(
    model=sam2,
    points_per_side=32,
    pred_iou_thresh=0.88,
    stability_score_thresh=0.95,
    crop_n_layers=1,
    crop_n_points_downscale_factor=2,
    min_mask_region_area=100.0,
)

def remove_background(image_path, output_path):
    """使用 SAM2 自动分割并移除背景"""
    print(f"处理: {os.path.basename(image_path)} ...", end=" ")

    # 加载图片
    image = Image.open(image_path).convert("RGB")
    orig_size = image.size
    img_array = np.array(image)

    # 生成掩码
    masks = mask_generator.generate(img_array)

    if not masks:
        print("未检测到对象，跳过")
        return None

    # 按面积排序，取最大的掩码（应该就是完整的狗+边框）
    masks = sorted(masks, key=lambda x: x['area'], reverse=True)

    # 合并前几个大掩码（狗+边框可能被分成多个区域）
    best_mask = masks[0]['segmentation'].copy()

    # 创建 RGBA 图片
    rgba = np.zeros((img_array.shape[0], img_array.shape[1], 4), dtype=np.uint8)
    rgba[:, :, :3] = img_array
    rgba[:, :, 3] = (best_mask * 255).astype(np.uint8)

    # 保存
    result = Image.fromarray(rgba, 'RGBA')
    result.save(output_path, 'PNG')

    print(f"✓ 掩码覆盖 {masks[0]['area']} 像素")
    return True

# 处理所有 logo (只处理原始 PNG，跳过已有透明通道的)
logo_files = sorted([
    f for f in os.listdir(INPUT_DIR)
    if f.startswith('logo-0') and f.endswith('.png') and '-sm' not in f
])

for filename in logo_files:
    input_path = os.path.join(INPUT_DIR, filename)
    output_path = os.path.join(OUTPUT_DIR, 'cutout-' + filename)
    remove_background(input_path, output_path)

print("\n完成！透明 PNG 已保存到 public/logos/cutout-*.png")
