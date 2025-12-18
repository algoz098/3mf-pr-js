/**
 * Quick demo: Memory optimization impact
 * Run with: node examples/quick-demo.mjs
 */

import { Model, deduplicateVertices, estimateMemoryUsage } from '../dist/index.js';

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║         3mf-pr-js - Memory Optimization Demo                 ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Scenario 1: Before optimization
console.log('📦 SCENARIO 1: Standard Approach (No Optimization)');
console.log('─────────────────────────────────────────────────────');

const cubeWithDuplicates = [
  [0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0],
  [0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10],  // duplicates
  [10, 0, 0], [10, 10, 0], [10, 10, 10], [10, 0, 10],
  [10, 10, 0], [0, 10, 0], [0, 10, 10], [10, 10, 10],
  [0, 10, 0], [0, 0, 0], [0, 0, 10], [0, 10, 10],
  [0, 0, 10], [10, 0, 10], [10, 10, 10], [0, 10, 10],
];

const triangles = [
  [0, 1, 2], [0, 2, 3],
  [4, 6, 5], [4, 7, 6],
  [8, 10, 9], [8, 11, 10],
  [12, 14, 13], [12, 15, 14],
  [16, 18, 17], [16, 19, 18],
  [20, 22, 21], [20, 23, 22],
];

const beforeMemory = estimateMemoryUsage(cubeWithDuplicates, triangles);
console.log(`  Vertices: ${cubeWithDuplicates.length}`);
console.log(`  Memory: ${(beforeMemory.total / 1024).toFixed(2)} KB`);
console.log(`  Type: ${beforeMemory.vertices.type}, ${beforeMemory.triangles.type}`);

// Scenario 2: After optimization
console.log('\n✨ SCENARIO 2: With Optimization (Deduplication)');
console.log('─────────────────────────────────────────────────────');

const deduped = deduplicateVertices(cubeWithDuplicates, triangles);
const afterMemory = estimateMemoryUsage(deduped.vertices, deduped.triangles);

console.log(`  Vertices: ${deduped.vertices.length} (reduced from ${cubeWithDuplicates.length})`);
console.log(`  Memory: ${(afterMemory.total / 1024).toFixed(2)} KB`);
console.log(`  Reduction: ${deduped.stats.reduction}`);
console.log(`  Saved: ${((beforeMemory.total - afterMemory.total) / 1024).toFixed(2)} KB`);

// Scenario 3: Geometry pooling
console.log('\n🔄 SCENARIO 3: Geometry Pooling (100 identical objects)');
console.log('─────────────────────────────────────────────────────');

const model = new Model();
const mat = model.addBaseMaterial('PLA', '#FF0000FF');

// Without pooling
const startWithout = process.memoryUsage().heapUsed;
for (let i = 0; i < 100; i++) {
  model.addMesh(deduped.vertices, deduped.triangles, { material: mat });
}
const endWithout = process.memoryUsage().heapUsed;

// With pooling
const model2 = new Model();
const mat2 = model2.addBaseMaterial('PLA', '#FF0000FF');

const startWith = process.memoryUsage().heapUsed;
for (let i = 0; i < 100; i++) {
  model2.addMeshOptimized(deduped.vertices, deduped.triangles, {
    material: mat2,
    reuseGeometry: true
  });
}
const endWith = process.memoryUsage().heapUsed;

const poolStats = model2.getGeometryPoolStats();

console.log(`  Without pooling: ${((endWithout - startWithout) / 1024).toFixed(2)} KB`);
console.log(`  With pooling: ${((endWith - startWith) / 1024).toFixed(2)} KB`);
console.log(`  Unique geometries: ${poolStats.poolSize}`);
console.log(`  Total references: ${poolStats.totalRefs}`);
console.log(`  Efficiency: ${((1 - poolStats.poolSize / poolStats.totalRefs) * 100).toFixed(1)}% less memory`);

// Summary
console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║                         SUMMARY                               ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║ Technique              │ Memory Saved │ Use Case              ║');
console.log('╟────────────────────────┼──────────────┼───────────────────────╢');
console.log(`║ Vertex Deduplication   │    ${deduped.stats.reduction}    │ STL/OBJ imports       ║`);
console.log('║ Geometry Pooling       │    ~99.0%    │ Repeated objects      ║');
console.log('║ TypedArrays            │    ~93.0%    │ Large meshes (>100k)  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');

console.log('\n💡 TIP: Combine all three techniques for maximum efficiency!');
console.log('   Read MEMORY_OPTIMIZATION.md for complete guide.\n');
