/**
 * tests/lib3mf-validation.spec.ts
 * Tests for 3MF validation using official lib3mf library
 */

import { describe, it, expect } from 'vitest';
import { Model } from '../src/model.js';
import { validate3MF } from '../src/lib3mf-validator.js';

describe('lib3mf validation', () => {
  it('should validate a minimal valid 3MF file', async () => {
    const model = new Model();
    model.addBaseMaterial('PLA', '#FFFFFFFF');
    const meshId = model.addMesh(
      [[0, 0, 0], [10, 0, 0], [0, 10, 0]],
      [[0, 1, 2]]
    );
    model.addBuildItem(meshId);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a model with multiple objects', async () => {
    const model = new Model();
    const mat = model.addBaseMaterial('Red PLA', '#FF0000FF');
    
    const mesh1 = model.addMesh(
      [[0, 0, 0], [10, 0, 0], [0, 10, 0]],
      [[0, 1, 2]],
      { name: 'Triangle 1', material: mat }
    );
    
    const mesh2 = model.addMesh(
      [[0, 0, 1], [10, 0, 1], [0, 10, 1]],
      [[0, 1, 2]],
      { name: 'Triangle 2', material: mat }
    );
    
    model.addBuildItem(mesh1);
    model.addBuildItem(mesh2, [1, 0, 0, 0, 1, 0, 0, 0, 1, 5, 5, 0]);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a model with component objects', async () => {
    const model = new Model();
    const mat = model.addBaseMaterial('Blue PLA', '#0000FFFF');
    
    const cube = model.addMesh(
      [
        [0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], // bottom
        [0, 0, 10], [10, 0, 10], [10, 10, 10], [0, 10, 10], // top
      ],
      [
        [0, 1, 2], [0, 2, 3], // bottom
        [4, 6, 5], [4, 7, 6], // top
        [0, 4, 5], [0, 5, 1], // front
        [1, 5, 6], [1, 6, 2], // right
        [2, 6, 7], [2, 7, 3], // back
        [3, 7, 4], [3, 4, 0], // left
      ],
      { name: 'Cube', material: mat }
    );
    
    const assembly = model.addComponentObject('Assembly', [
      { objectid: cube },
      { objectid: cube, transform: [1, 0, 0, 0, 1, 0, 0, 0, 1, 15, 0, 0] },
    ]);
    
    model.addBuildItem(assembly);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a model with production extension', async () => {
    const model = new Model();
    model.enableProduction(true);
    
    const mat = model.addBaseMaterial('Green PLA', '#00FF00FF');
    const mesh = model.addMesh(
      [[0, 0, 0], [10, 0, 0], [0, 10, 0]],
      [[0, 1, 2]],
      { material: mat }
    );
    
    model.addBuildItem(mesh);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a model with micron units', async () => {
    const model = new Model();
    model.setUnit('micron');
    
    const mesh = model.addMesh(
      [[0, 0, 0], [1000, 0, 0], [0, 1000, 0]],
      [[0, 1, 2]]
    );
    
    model.addBuildItem(mesh);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a model with metadata', async () => {
    const model = new Model();
    model.addMetadata('Title', 'Test Model');
    model.addMetadata('Designer', 'AI Assistant');
    model.addMetadata('Description', 'A simple test model');
    
    const mesh = model.addMesh(
      [[0, 0, 0], [10, 0, 0], [0, 10, 0]],
      [[0, 1, 2]]
    );
    
    model.addBuildItem(mesh);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate a model with multiple basematerials sets', async () => {
    const model = new Model();
    
    // Create two separate material sets
    const set1Id = model.createBaseMaterialsSet();
    const set2Id = model.createBaseMaterialsSet();
    
    const mat1 = model.addBaseMaterial('Red', '#FF0000FF', set1Id);
    const mat2 = model.addBaseMaterial('Blue', '#0000FFFF', set2Id);
    
    const mesh1 = model.addMesh(
      [[0, 0, 0], [10, 0, 0], [0, 10, 0]],
      [[0, 1, 2]],
      { material: mat1 }
    );
    
    const mesh2 = model.addMesh(
      [[0, 0, 1], [10, 0, 1], [0, 10, 1]],
      [[0, 1, 2]],
      { material: mat2 }
    );
    
    model.addBuildItem(mesh1);
    model.addBuildItem(mesh2, [1, 0, 0, 0, 1, 0, 0, 0, 1, 15, 0, 0]);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate that resource IDs are unique', async () => {
    // This test verifies that basematerials and objects don't have conflicting IDs
    const model = new Model();
    
    // Add multiple basematerials (will get ID 1)
    const mat1 = model.addBaseMaterial('Material 1', '#FF0000FF');
    const mat2 = model.addBaseMaterial('Material 2', '#00FF00FF');
    const mat3 = model.addBaseMaterial('Material 3', '#0000FFFF');
    
    // Add multiple objects (should get IDs 2, 3, 4, etc.)
    const mesh1 = model.addMesh([[0, 0, 0], [10, 0, 0], [0, 10, 0]], [[0, 1, 2]], { material: mat1 });
    const mesh2 = model.addMesh([[0, 0, 1], [10, 0, 1], [0, 10, 1]], [[0, 1, 2]], { material: mat2 });
    const mesh3 = model.addMesh([[0, 0, 2], [10, 0, 2], [0, 10, 2]], [[0, 1, 2]], { material: mat3 });
    
    model.addBuildItem(mesh1);
    model.addBuildItem(mesh2, [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 15, 0]);
    model.addBuildItem(mesh3, [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 15]);
    
    const buffer = await model.to3MF();
    const result = await validate3MF(buffer);
    
    // lib3mf will reject files with duplicate resource IDs
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
