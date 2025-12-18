import { describe, it, expect } from 'vitest';
import { Model } from '../src/model';
import { validate3MF } from '../src/lib3mf-validator';

describe('Materials Property Resources: CompositeMaterials', () => {
  it('emits m:compositematerials and allows triangle pid/pindex assignment', async () => {
    const model = new Model();
    model.setTitle('Composite test');

    // Base materials set with two entries
    const setId = model.createBaseMaterialsSet();
    const red = model.addBaseMaterial('Red', '#FF0000FF', setId);
    model.addBaseMaterial('Blue', '#0000FFFF', setId);

    // Composite group based on base materials pid
    const compId = model.createCompositeMaterials(setId);
    const mixIndex = model.addComposite(compId, [0.5, 0.5]);

    // Mesh
    const obj = model.addMesh(
      [ [0,0,0], [1,0,0], [0,1,0] ],
      [ [0,1,2] ],
      { name: 'tri', material: { pid: compId, pindex: mixIndex } }
    );

    // Assign triangle composite via pid/p1..p3
    model.setTriangleMaterials(obj, [ { index: 0, p1: mixIndex, p2: mixIndex, p3: mixIndex } ]);

    const buf = await model.to3MF();
    const text = buf.toString('utf-8');
    expect(text).toMatch(/xmlns:m="http:\/\/schemas.microsoft.com\/3dmanufacturing\/material\/2015\/02"/);
    expect(text).toMatch(/<m:compositematerials[^>]*id="\d+"[^>]*pid="\d+"/);
    expect(text).toMatch(/<m:composite[^>]*values="0\.5 0\.5"/);
    expect(text).toMatch(/<triangle[^>]*p1="\d+"[^>]*p2="\d+"[^>]*p3="\d+"/);

    // Structural only; lib3mf composite specifics vary, and Bambu Studio
    // typically relies on displaycolor/basematerials rather than composites.
  });
});
