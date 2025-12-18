import { generate3MF } from '../dist/index.js';
import { writeFile, readFile } from 'node:fs/promises';

async function main() {
  const text = await readFile(new URL('./minimal.json', import.meta.url));
  const scene = JSON.parse(text.toString('utf-8'));
  const buffer = await generate3MF(scene, { production: false, validate: true });
  await writeFile(new URL('../out-minimal.3mf', import.meta.url), buffer);
  console.log('Wrote out-minimal.3mf');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
