import { describe, it, expect } from 'vitest';
import { Model } from '../src/model';

describe('MultiMaterials invalid cases', () => {
  it('throws when pindices are out of range for a pid', () => {
    const model = new Model();
    const setA = model.createBaseMaterialsSet();
    model.addBaseMaterial('A', '#FF0000FF', setA);
    const setB = model.createBaseMaterialsSet();
    model.addBaseMaterial('B', '#0000FFFF', setB);
    const mmId = model.createMultiMaterials([setA, setB]);
    // setA has length 1 → index 2 is out of range
    expect(() => model.addMultiMaterial(mmId, [2, 0]))
      .toThrow(/out of range/);
  });
});
