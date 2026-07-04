/**
 * 测试 large 模型 — 只处理少量动作帧，对比 medium 输出
 */
import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN_DIR = path.resolve(__dirname, '..', '素材', 'frames_in');
const OUT_DIR = path.resolve(__dirname, '..', '素材', 'frames_out');
const TEST_DIR = path.resolve(__dirname, '..', '素材', 'frames_large_test');

// 取中间的动作帧（尾摆/转头通常在动画中段）
const TEST_FRAMES = [40, 50, 60, 70, 80]; // 0-indexed 差不多在序列中段

const config = {
  model: 'large',
  output: { format: 'image/png' },
};

async function main() {
  const files = fs.readdirSync(IN_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Total frames: ${files.length}`);
  console.log(`Testing frames: ${TEST_FRAMES.map(i => files[i]).join(', ')}`);
  console.log(`Output: ${TEST_DIR}\n`);

  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });

  for (const idx of TEST_FRAMES) {
    const file = files[idx];
    const inPath = path.join(IN_DIR, file);
    const outPath = path.join(TEST_DIR, file);

    console.log(`Processing ${file}...`);
    const t0 = Date.now();

    try {
      const fileUrl = `file:///${inPath.replace(/\\/g, '/')}`;
      const result = await removeBackground(fileUrl, config);

      let buf;
      if (Buffer.isBuffer(result)) buf = result;
      else if (result instanceof Uint8Array) buf = Buffer.from(result);
      else if (result.arrayBuffer) {
        const ab = await result.arrayBuffer();
        buf = Buffer.from(ab);
      }

      fs.writeFileSync(outPath, buf);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ✅ ${file} — ${elapsed}s`);
    } catch (e) {
      console.error(`  ❌ ${file} — ${e.message}`);
    }
  }

  console.log('\n--- Done ---');
  console.log(`large 输出在: ${TEST_DIR}`);
  console.log(`medium 输出在: ${OUT_DIR}`);
  console.log('可以用图片查看器对比两边的 frame_00{40,50,60,70,80}.png');
}

main().catch(e => { console.error(e); process.exit(1); });
