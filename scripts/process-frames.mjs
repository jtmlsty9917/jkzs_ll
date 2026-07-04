import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN_DIR = path.resolve(__dirname, '..', '素材', 'frames_in');
const OUT_DIR = path.resolve(__dirname, '..', '素材', 'frames_out');

const config = {
  model: 'medium',        // medium = good balance
  output: { format: 'image/png' },
};

async function main() {
  const files = fs.readdirSync(IN_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Found ${files.length} frames to process\n`);

  const total = files.length;
  const startAll = Date.now();

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const inPath = path.join(IN_DIR, file);
    const outPath = path.join(OUT_DIR, file);

    if (fs.existsSync(outPath)) {
      console.log(`[${i + 1}/${total}] ${file} — skip (exists)`);
      continue;
    }

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
      const elapsed = Date.now() - t0;
      const avg = Math.round((Date.now() - startAll) / (i + 1));
      const remaining = Math.round(avg * (total - i - 1) / 1000);
      console.log(`[${i + 1}/${total}] ${file} — ${elapsed}ms | ETA ${remaining}s`);
    } catch (e) {
      console.error(`[${i + 1}/${total}] ${file} — ERROR: ${e.message}`);
    }
  }

  const totalTime = Math.round((Date.now() - startAll) / 1000);
  console.log(`\n✅ Done! ${total} frames in ${totalTime}s`);
}

main().catch(e => { console.error(e); process.exit(1); });
