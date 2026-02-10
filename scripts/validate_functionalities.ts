
import {
  Model,
  generate3MF,
  validateSceneJSON,
  validateWindingOrder,
  validateManifold,
  validate3MF,
  formatValidationResult,
  deduplicateVertices,
  estimateMemoryUsage
} from '../src/index.js';
import { SceneJSON } from '../src/validate.js';

async function main() {
  console.log('Starting validation of 3mf-pr-js functionalities...\n');
  let allPassed = true;

  // 1. JSON Schema Validation
  console.log('--- 1. JSON Schema Validation ---');
  const validScene: SceneJSON = {
    unit: 'millimeter',
    objects: [{
      type: 'mesh',
      vertices: [[0,0,0], [10,0,0], [0,10,0]],
      triangles: [[0,1,2]]
    }]
  };
  const invalidScene = {
    unit: 'lightyear', // Invalid unit
    objects: []
  };

  const validRes = validateSceneJSON(validScene);
  if (validRes.ok) console.log('✓ Valid scene accepted');
  else { console.error('✗ Valid scene rejected:', validRes.errors); allPassed = false; }

  const invalidRes = validateSceneJSON(invalidScene);
  if (!invalidRes.ok) console.log('✓ Invalid scene rejected');
  else { console.error('✗ Invalid scene accepted'); allPassed = false; }


  // 2. Geometry Validation
  console.log('\n--- 2. Geometry Validation ---');
  const vertices: [number, number, number][] = [[0,0,0], [10,0,0], [0,10,0]];
  const triangles: [number, number, number][] = [[0,1,2]];

  const windingRes = validateWindingOrder(vertices, triangles);
  if (windingRes.ok) console.log('✓ Winding order ok');
  else console.warn('! Winding order warnings:', windingRes.warnings);

  const manifoldRes = validateManifold(vertices, triangles);
  // A single triangle is open, so not manifold closed, but let's check what it says.
  // The validator checks for edges shared by exactly 2 triangles.
  // For a single triangle, edges are shared by 1 triangle. So it should fail manifold check if it expects closed mesh.
  // However, open meshes are allowed in 3MF but maybe "validateManifold" expects closed.
  if (!manifoldRes.ok) console.log('✓ Manifold check correctly identified open mesh (expected for single triangle)');
  else console.log('? Manifold check passed for open mesh?');


  // 3. 3MF Generation & lib3mf Validation
  console.log('\n--- 3. 3MF Generation & lib3mf Validation ---');

  try {
    const model = new Model();
    model.setUnit('millimeter');
    model.addMetadata('Title', 'Validation Test');

    // Add Base Material
    const mat = model.addBaseMaterial('Blue PLA', '#0000FFFF');

    // Add Mesh
    const meshId = model.addMesh(vertices, triangles, { material: mat });

    // Add Build Item
    model.addBuildItem(meshId);

    // Generate Buffer
    const buffer = await model.to3MF();
    console.log(`✓ 3MF generated (${buffer.length} bytes)`);

    // Validate with lib3mf
    const lib3mfRes = await validate3MF(buffer);
    console.log(formatValidationResult(lib3mfRes));

    if (!lib3mfRes.ok) allPassed = false;

  } catch (e) {
    console.error('✗ 3MF Generation failed:', e);
    allPassed = false;
  }

  // 4. Memory Optimization
  console.log('\n--- 4. Memory Optimization ---');
  const dupVertices: [number, number, number][] = [
    [0,0,0], [10,0,0], [0,10,0],
    [0,0,0], [10,0,0], [0,10,0] // Duplicates
  ];
  const dupTriangles: [number, number, number][] = [
    [0,1,2], [3,4,5]
  ];

  const dedupRes = deduplicateVertices(dupVertices, dupTriangles);
  if (dedupRes.vertices.length === 3) {
    console.log(`✓ Deduplication working: ${dupVertices.length} -> ${dedupRes.vertices.length} vertices`);
  } else {
    console.error(`✗ Deduplication failed: Got ${dedupRes.vertices.length} vertices, expected 3`);
    allPassed = false;
  }

  const memUsage = estimateMemoryUsage(dedupRes.vertices, dedupRes.triangles);
  console.log(`✓ Memory estimation: ${memUsage.total} bytes`);


  // 5. Advanced Features (Components, Production)
  console.log('\n--- 5. Advanced Features ---');
  try {
    const model = new Model();
    model.enableProduction(true);

    const meshId = model.addMesh(vertices, triangles);
    const compId = model.addComponentObject('Assembly', [
        { objectid: meshId, transform: [1,0,0, 0,1,0, 0,0,1, 10,0,0] }
    ]);
    model.addBuildItem(compId);

    const buffer = await model.to3MF();
    const lib3mfRes = await validate3MF(buffer);
    if (lib3mfRes.ok) console.log('✓ Components & Production extension validated');
    else {
        console.error('✗ Components & Production validation failed');
        console.error(formatValidationResult(lib3mfRes));
        allPassed = false;
    }
  } catch (e) {
    console.error('✗ Advanced features failed:', e);
    allPassed = false;
  }

  console.log('\n---------------------------------------------------');
  if (allPassed) {
    console.log('✅ ALL VALIDATION CHECKS PASSED');
    process.exit(0);
  } else {
    console.error('❌ SOME CHECKS FAILED');
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
