/**
 * src/cli-concept.ts
 * Concept implementation for the 3mf-pr-js CLI.
 * demonstrates basic structure and usage of library features.
 */

import { readFile } from 'node:fs/promises';
import { validate3MF, formatValidationResult } from './lib3mf-validator.js';
import { inspect3MF } from './inspection.js';
import { ThreeMFReader } from './reader.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const filePath = args[1];

  if (!command || !filePath) {
    console.log('Usage: node cli-concept.js <command> <file.3mf>');
    console.log('Commands:');
    console.log('  validate  - Validate a 3MF file using lib3mf');
    console.log('  inspect   - Inspect file structure and metadata');
    console.log('  read      - Test reading/parsing (experimental)');
    process.exit(1);
  }

  try {
    const buffer = await readFile(filePath);

    if (command === 'validate') {
      console.log(`Validating ${filePath}...`);
      const result = await validate3MF(buffer);
      console.log(formatValidationResult(result));
      process.exit(result.ok ? 0 : 1);
    }
    else if (command === 'inspect') {
      console.log(`Inspecting ${filePath}...`);
      const info = await inspect3MF(buffer);

      console.log('\n--- 3MF File Report ---');
      console.log(`File Size: ${(info.fileSize / 1024).toFixed(2)} KB`);
      console.log(`Extensions: ${info.extensions.join(', ') || 'None'}`);

      console.log('\nMetadata:');
      const metaKeys = Object.keys(info.metadata);
      if (metaKeys.length > 0) {
        for (const k of metaKeys) {
          console.log(`  ${k}: ${info.metadata[k]}`);
        }
      } else {
        console.log('  (None)');
      }

      console.log('\nResources:');
      console.log(`  Objects: ${info.resources.objects}`);
      console.log(`  Base Materials: ${info.resources.baseMaterials}`);
      console.log(`  Textures: ${info.resources.textures}`);

      console.log('\nGeometry:');
      console.log(`  Total Vertices: ${info.meshStats.vertices.toLocaleString()}`);
      console.log(`  Total Triangles: ${info.meshStats.triangles.toLocaleString()}`);

      if (info.warnings.length > 0) {
        console.log('\nWarnings:');
        info.warnings.forEach(w => console.warn(`  - ${w}`));
      }
    }
    else if (command === 'read') {
      console.log(`Reading ${filePath}...`);
      const reader = new ThreeMFReader();
      const model = await reader.read(buffer);
      console.log('Read complete (skeleton). Model object created.');
    }
    else {
      console.error(`Unknown command: ${command}`);
      process.exit(1);
    }

  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
