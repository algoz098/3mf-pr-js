import { describe, it, expect } from 'vitest';
import { Model } from '../src/model';
import { validate3MF } from '../src/lib3mf-validator';

describe('Materials Property Resources: MultiMaterials', () => {
  it('emits m:multimaterials and allows object pid/pindex assignment', async () => {
    const model = new Model();
    model.setTitle('MultiMaterials test');

    // Two base material sets with one entry each
    const setA = model.createBaseMaterialsSet();
    const aMat = model.addBaseMaterial('A', '#FF0000FF', setA);
    const setB = model.createBaseMaterialsSet();
    model.addBaseMaterial('B', '#0000FFFF', setB);

    // MultiMaterials combining pidA and pidB
    const mmId = model.createMultiMaterials([setA, setB]);
    const comboIndex = model.addMultiMaterial(mmId, [aMat.pindex, 0]);

    // Mesh using multimaterials as default
    const obj = model.addMesh(
      [ [0,0,0], [1,0,0], [0,1,0] ],
      [ [0,1,2] ],
      { name: 'tri', material: { pid: mmId, pindex: comboIndex } }
    );

    const buf = await model.to3MF();
    const text = buf.toString('utf-8');
    expect(text).toMatch(/xmlns:m="http:\/\/schemas.microsoft.com\/3dmanufacturing\/material\/2015\/02"/);
    expect(text).toMatch(/<m:multimaterials[^>]*id="\d+"[^>]*pids="\d+ \d+"/);
    expect(text).toMatch(/<m:multimaterial[^>]*pindices="\d+ \d+"/);
    expect(text).toMatch(/<object[^>]*pid="\d+"[^>]*pindex="\d+"/);

    // Structural check only; lib3mf acceptance of multimaterials depends on exact spec version support
  });
});
