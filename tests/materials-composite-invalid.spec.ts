import { describe, it, expect } from 'vitest';
import { Model } from '../src/model';

describe('CompositeMaterials invalid cases', () => {
  it('throws when composite values do not sum to 1.0', () => {
    const model = new Model();
    const setId = model.createBaseMaterialsSet();
    model.addBaseMaterial('A', '#FF0000FF', setId);
    model.addBaseMaterial('B', '#0000FFFF', setId);
    const compId = model.createCompositeMaterials(setId);
    expect(() => model.addComposite(compId, [0.2, 0.2]))
      .toThrow(/sum to 1\.0/);
  });
});
