import { describe, it, expect } from 'vitest';
import { Model } from '../src/model.js';
import { inspect3MF } from '../src/inspection.js';

describe('Inspection API', () => {
  it('correctly reports metadata and mesh statistics', async () => {
    // Feature: Core Specification 1.2.3 - Metadata
    // https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md#341-metadata
    const model = new Model();
    model.setUnit('millimeter');
    model.setTitle('Inspection Test Model');
    model.setDesigner('Test Suite');
    model.setDescription('A simple cube for testing inspection');

    // Feature: Core Specification 1.2.1 - Resources (Mesh)
    // https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md#31-mesh
    const v: [number,number,number][] = [
      [0,0,0], [10,0,0], [10,10,0], [0,10,0],
      [0,0,10], [10,0,10], [10,10,10], [0,10,10]
    ];
    // 12 triangles
    const t: [number,number,number][] = [
      [0,1,2], [0,2,3], [4,6,5], [4,7,6],
      [0,5,1], [0,4,5], [1,6,2], [1,5,6],
      [2,7,3], [2,6,7], [3,4,0], [3,7,4]
    ];

    model.addMesh(v, t, { name: 'TestCube' });

    const buffer = await model.to3MF();
    const result = await inspect3MF(buffer);

    // Verify Metadata
    expect(result.metadata['Title']).toBe('Inspection Test Model');
    expect(result.metadata['Designer']).toBe('Test Suite');
    expect(result.metadata['Description']).toBe('A simple cube for testing inspection');

    // Verify Mesh Statistics
    expect(result.meshStats.vertices).toBe(8);
    expect(result.meshStats.triangles).toBe(12);

    // Verify Resource Counts
    expect(result.resources.objects).toBe(1);
    expect(result.resources.baseMaterials).toBe(0); // No materials added
  });

  it('correctly reports materials and extensions', async () => {
    // Feature: Material Extension 1.1 - Color Groups
    // https://github.com/3MFConsortium/spec_materials/blob/master/3MF%20Materials%20and%20Properties%20Extension.md#32-colorgroups
    const model = new Model();
    const groupId = model.createColorGroup();
    model.addColorToGroup('#FF0000FF', 'Red', groupId);

    const v: [number,number,number][] = [[0,0,0], [10,0,0], [0,10,0]];
    const t: [number,number,number][] = [[0,1,2]];
    model.addMesh(v, t, { name: 'Triangle' });

    const buffer = await model.to3MF();
    const result = await inspect3MF(buffer);

    // Check for extensions (Materials extension adds 'm' to required/recommended)
    // The library adds 'm' to recommendedextensions
    expect(result.extensions).toContain('m');

    // Check Resources
    // inspect3MF current implementation counts texture2d but doesn't explicitly count colorgroups in the summary yet,
    // but ensures object count is correct.
    expect(result.resources.objects).toBe(1);
  });
});
