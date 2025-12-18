/**
 * Example: Memory optimization techniques
 * 
 * This example demonstrates:
 * 1. Vertex deduplication
 * 2. Geometry pooling/reuse
 * 3. TypedArray usage
 * 4. Memory usage estimation
 */

import { Model, deduplicateVertices, estimateMemoryUsage, verticesToTypedArray, trianglesToTypedArray } from '../dist/index.js';
import { writeFile } from 'node:fs/promises';

console.log('=== 3MF Memory Optimization Examples ===\n');

// Example 1: Vertex Deduplication
console.log('1. VERTEX DEDUPLICATION');
console.log('------------------------');

// Create a cube with some duplicate vertices (common in procedural generation)
const cubeVerticesDuplicates = [
  // Face 1
  [0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0],
  // Face 2 (duplicates some vertices)
  [0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10],
  // Face 3
  [10, 0, 0], [10, 10, 0], [10, 10, 10], [10, 0, 10],
  // More faces with duplicates...
  [10, 10, 0], [0, 10, 0], [0, 10, 10], [10, 10, 10],
  [0, 10, 0], [0, 0, 0], [0, 0, 10], [0, 10, 10],
  [0, 0, 10], [10, 0, 10], [10, 10, 10], [0, 10, 10],
];

const cubeTrianglesDuplicates = [
  [0, 1, 2], [0, 2, 3],       // Bottom
  [4, 6, 5], [4, 7, 6],       // Front
  [8, 10, 9], [8, 11, 10],    // Right
  [12, 14, 13], [12, 15, 14], // Back
  [16, 18, 17], [16, 19, 18], // Left
  [20, 22, 21], [20, 23, 22], // Top
];

console.log(`Original vertices: ${cubeVerticesDuplicates.length}`);
console.log(`Original triangles: ${cubeTrianglesDuplicates.length}`);

const dedupResult = deduplicateVertices(cubeVerticesDuplicates, cubeTrianglesDuplicates);
console.log(`After deduplication: ${dedupResult.vertices.length} vertices`);
console.log(`Reduction: ${dedupResult.stats.reduction}`);
console.log();

// Example 2: Memory Usage Comparison
console.log('2. MEMORY USAGE COMPARISON');
console.log('--------------------------');

const arrayMemory = estimateMemoryUsage(cubeVerticesDuplicates, cubeTrianglesDuplicates);
console.log('Standard Arrays (Vec3[], Triangle[]):');
console.log(`  Vertices: ${arrayMemory.vertices.count} × ${arrayMemory.vertices.type} = ${(arrayMemory.vertices.bytes / 1024).toFixed(2)} KB`);
console.log(`  Triangles: ${arrayMemory.triangles.count} × ${arrayMemory.triangles.type} = ${(arrayMemory.triangles.bytes / 1024).toFixed(2)} KB`);
console.log(`  Total: ${(arrayMemory.total / 1024).toFixed(2)} KB`);

const typedVertices = verticesToTypedArray(cubeVerticesDuplicates);
const typedTriangles = trianglesToTypedArray(cubeTrianglesDuplicates);
const typedMemory = estimateMemoryUsage(typedVertices, typedTriangles);

console.log('\nTypedArrays (Float32Array, Uint32Array):');
console.log(`  Vertices: ${typedMemory.vertices.count} × ${typedMemory.vertices.type} = ${(typedMemory.vertices.bytes / 1024).toFixed(2)} KB`);
console.log(`  Triangles: ${typedMemory.triangles.count} × ${typedMemory.triangles.type} = ${(typedMemory.triangles.bytes / 1024).toFixed(2)} KB`);
console.log(`  Total: ${(typedMemory.total / 1024).toFixed(2)} KB`);
console.log(`  Savings: ${typedMemory.savings}`);
console.log();

// Example 3: Using addMeshOptimized with deduplication
console.log('3. OPTIMIZED MESH CREATION');
console.log('---------------------------');

const model1 = new Model();
model1.setTitle('Memory Optimized Model');

const material = model1.addBaseMaterial('PLA Red', '#FF0000FF');

// Add mesh with automatic deduplication
const cubeId = model1.addMeshOptimized(
  cubeVerticesDuplicates,
  cubeTrianglesDuplicates,
  {
    name: 'Deduplicated Cube',
    material,
    deduplicate: true, // Automatically remove duplicate vertices
  }
);

console.log(`Created optimized cube with ID: ${cubeId}`);
console.log();

// Example 4: Geometry Pooling (Reuse)
console.log('4. GEOMETRY POOLING');
console.log('-------------------');

const model2 = new Model();
model2.setTitle('Geometry Reuse Example');

// Create one geometry definition
const pyramidVertices = [
  [0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0],
  [5, 5, 8], // apex
];

const pyramidTriangles = [
  [0, 2, 1], [0, 3, 2],  // base
  [0, 1, 4],             // sides
  [1, 2, 4],
  [2, 3, 4],
  [3, 0, 4],
];

// Add the same geometry multiple times with reuseGeometry flag
console.log('Adding 100 pyramids with geometry reuse...');
const components = [];

for (let i = 0; i < 100; i++) {
  const id = model2.addMeshOptimized(
    pyramidVertices,
    pyramidTriangles,
    {
      name: `Pyramid ${i}`,
      material,
      reuseGeometry: true, // Reuse identical geometry
    }
  );
  
  // Only the first call creates geometry; rest reuse it
  if (i === 0) {
    console.log(`  First pyramid created with ID: ${id}`);
  }
}

const poolStats = model2.getGeometryPoolStats();
console.log(`\nGeometry Pool Statistics:`);
console.log(`  Unique geometries: ${poolStats.poolSize}`);
console.log(`  Total references: ${poolStats.totalRefs}`);
console.log(`  Average refs per geometry: ${poolStats.avgRefsPerGeometry.toFixed(1)}`);
console.log(`  Memory saved: ~${((poolStats.totalRefs - poolStats.poolSize) / poolStats.totalRefs * 100).toFixed(1)}%`);
console.log();

// Example 5: Large-scale scenario with TypedArrays
console.log('5. LARGE-SCALE PERFORMANCE');
console.log('--------------------------');

const model3 = new Model();
model3.setTitle('Large Model with Optimizations');

// Simulate a large terrain mesh (100x100 grid)
const gridSize = 100;
const largeVertices = new Float32Array(gridSize * gridSize * 3);
const largeTriangles = new Uint32Array((gridSize - 1) * (gridSize - 1) * 2 * 3);

// Generate terrain vertices
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    const idx = (y * gridSize + x) * 3;
    largeVertices[idx] = x;
    largeVertices[idx + 1] = y;
    largeVertices[idx + 2] = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2; // Height
  }
}

// Generate triangle indices
let triIdx = 0;
for (let y = 0; y < gridSize - 1; y++) {
  for (let x = 0; x < gridSize - 1; x++) {
    const v0 = y * gridSize + x;
    const v1 = v0 + 1;
    const v2 = v0 + gridSize;
    const v3 = v2 + 1;

    // Triangle 1
    largeTriangles[triIdx++] = v0;
    largeTriangles[triIdx++] = v2;
    largeTriangles[triIdx++] = v1;

    // Triangle 2
    largeTriangles[triIdx++] = v1;
    largeTriangles[triIdx++] = v2;
    largeTriangles[triIdx++] = v3;
  }
}

console.log(`Generated terrain:`);
console.log(`  Vertices: ${largeVertices.length / 3}`);
console.log(`  Triangles: ${largeTriangles.length / 3}`);

const largeMemory = estimateMemoryUsage(largeVertices, largeTriangles);
console.log(`  Memory (TypedArrays): ${(largeMemory.total / 1024).toFixed(2)} KB`);
console.log(`  vs Standard Arrays: ${(largeMemory.total / largeMemory.optimized * 100).toFixed(0)}% more efficient`);

model3.addMeshOptimized(
  largeVertices,
  largeTriangles,
  {
    name: 'Terrain',
    material,
    deduplicate: false, // Already optimized
  }
);

console.log();

// Write examples to files
console.log('6. GENERATING 3MF FILES');
console.log('------------------------');

await writeFile(
  new URL('../out-dedup-example.3mf', import.meta.url),
  await model1.to3MF()
);
console.log('✓ Wrote out-dedup-example.3mf (with vertex deduplication)');

await writeFile(
  new URL('../out-reuse-example.3mf', import.meta.url),
  await model2.to3MF()
);
console.log('✓ Wrote out-reuse-example.3mf (with geometry pooling)');

await writeFile(
  new URL('../out-large-example.3mf', import.meta.url),
  await model3.to3MF()
);
console.log('✓ Wrote out-large-example.3mf (large terrain with TypedArrays)');

console.log('\n=== Summary ===');
console.log('Memory optimization techniques demonstrated:');
console.log('  1. Vertex deduplication: Removes duplicate vertices automatically');
console.log('  2. Geometry pooling: Reuses identical geometry across multiple objects');
console.log('  3. TypedArrays: Uses Float32Array/Uint32Array for 90%+ memory reduction');
console.log('  4. Memory estimation: Analyzes and reports memory usage');
console.log('\nThese techniques enable handling models 10-100x larger than before!');
