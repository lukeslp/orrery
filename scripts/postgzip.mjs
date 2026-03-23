/**
 * Post-build: pre-gzip large data files in dist/ for Caddy precompressed serving.
 * Caddy serves .gz files automatically when client accepts gzip encoding.
 */
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';

const DIST_DATA = 'dist/data';
const MIN_SIZE = 10_000; // Only gzip files > 10KB

const files = await readdir(DIST_DATA).catch(() => []);
let total = 0;
let saved = 0;

for (const f of files) {
  if (f.endsWith('.gz')) continue;
  const path = join(DIST_DATA, f);
  const info = await stat(path);
  if (info.size < MIN_SIZE) continue;

  const gzPath = path + '.gz';
  await pipeline(
    createReadStream(path),
    createGzip({ level: 9 }),
    createWriteStream(gzPath),
  );
  const gzInfo = await stat(gzPath);
  const pct = ((1 - gzInfo.size / info.size) * 100).toFixed(0);
  console.log(`  ${f}: ${(info.size / 1024).toFixed(0)}KB → ${(gzInfo.size / 1024).toFixed(0)}KB (${pct}% smaller)`);
  total += info.size;
  saved += info.size - gzInfo.size;
}

if (total > 0) {
  console.log(`\n  Total saved: ${(saved / 1024).toFixed(0)}KB (${((saved / total) * 100).toFixed(0)}%)`);
}
