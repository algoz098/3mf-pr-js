/**
 * Example: Using the high-level generate3MF API
 * This shows how to programmatically create a 3MF file from JavaScript/TypeScript
 */

import { generate3MF } from '../dist/index.js';
import { writeFile } from 'fs/promises';

async function main() {
  // Define a simple scene
  const scene = {
    unit: 'millimeter',
    metadata: {
      Title: 'API Example',
      Designer: 'Example Code'
    },
    basematerials: [
      { name: 'PLA Red', displaycolor: '#FF0000FF' },
      { name: 'PLA Blue', displaycolor: '#0000FFFF' }
    ],
    objects: [
      {
        type: 'mesh',
        name: 'Cube',
        vertices: [
          [0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0],
          [0, 0, 10], [10, 0, 10], [10, 10, 10], [0, 10, 10]
        ],
        triangles: [
          [0, 1, 2], [0, 2, 3],
          [4, 6, 5], [4, 7, 6],
          [0, 5, 1], [0, 4, 5],
          [1, 6, 2], [1, 5, 6],
          [2, 7, 3], [2, 6, 7],
          [3, 4, 0], [3, 7, 4]
        ],
        materialIndex: 0
      },
      {
        type: 'mesh',
        name: 'Small Cube',
        vertices: [
          [0, 0, 0], [5, 0, 0], [5, 5, 0], [0, 5, 0],
          [0, 0, 5], [5, 0, 5], [5, 5, 5], [0, 5, 5]
        ],
        triangles: [
          [0, 1, 2], [0, 2, 3],
          [4, 6, 5], [4, 7, 6],
          [0, 5, 1], [0, 4, 5],
          [1, 6, 2], [1, 5, 6],
          [2, 7, 3], [2, 6, 7],
          [3, 4, 0], [3, 7, 4]
        ],
        materialIndex: 1
      }
    ],
    build: [
      {
        objectIndex: 0,
        transform: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]
      },
      {
        objectIndex: 1,
        transform: [1, 0, 0, 0, 1, 0, 0, 0, 1, 15, 0, 0]
      }
    ]
  };

  try {
    console.log('Generating 3MF file...');
    
    // Generate with validation and Production extension
    const buffer = await generate3MF(scene, {
      production: true,
      validate: true,
      strictValidation: true
    });

    // Write to file
    await writeFile('api-example-output.3mf', buffer);
    console.log('✓ Generated api-example-output.3mf');
    console.log(`  Size: ${buffer.length} bytes`);
  } catch (error) {
    console.error('Error generating 3MF:', error);
    if (error.validationErrors) {
      console.error('Validation errors:', error.validationErrors);
    }
    process.exit(1);
  }
}

main();
