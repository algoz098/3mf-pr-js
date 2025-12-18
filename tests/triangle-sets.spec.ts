import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Model } from '../src/model';
import { validate3MF } from '../src/lib3mf-validator';

async function readModelXml(buf: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file('3D/3dmodel.model');
  if (!file) throw new Error('3D/3dmodel.model not found');
  return await file.async('string');
}

describe('Triangle Sets extension', () => {
  it('emits t:trianglesets with namespace and validates with lib3mf', async () => {
    const model = new Model();
    const mat = model.addBaseMaterial('PLA', '#FF0000FF');
    const obj = model.addMesh(
      [ [0,0,0], [1,0,0], [0,1,0], [0,0,1] ],
      [ [0,1,2], [0,1,3], [0,2,3], [1,2,3] ],
      { material: mat }
    );
    const setIdx = model.addTriangleSet(obj, 'Group A', 't:groupA');
    model.addTriangleSetRefs(obj, setIdx, [0, 1, { startindex: 2, endindex: 3 }]);

    const buf = await model.to3MF();
    const xml = await readModelXml(buf);

    expect(xml).toContain('xmlns:t="http://schemas.microsoft.com/3dmanufacturing/trianglesets/2021/07"');
    expect(xml).toContain('<t:trianglesets>');
    expect(xml).toContain('<t:triangleset');
    expect(xml).toContain('<t:ref index="0"');
    expect(xml).toContain('<t:refrange startindex="2" endindex="3"');

    const result = await validate3MF(buf);
    expect(result.ok).toBe(true);
  });
});

describe('Object thumbnails', () => {
  it('adds object-level thumbnail and relationship in model rels', async () => {
    const model = new Model();
    const obj = model.addMesh(
      [ [0,0,0], [1,0,0], [0,1,0] ],
      [ [0,1,2] ]
    );

    const thumb = new Uint8Array([137,80,78,71,13,10,26,10]); // minimal PNG header (not a full PNG, but enough for presence)
    model.setObjectThumbnail(obj, thumb, 'png', 'Metadata');

    const buf = await model.to3MF();
    const zip = await JSZip.loadAsync(buf);

    const relsFile = zip.file('3D/_rels/3dmodel.model.rels');
    expect(relsFile).toBeTruthy();
    const relsXml = await relsFile!.async('string');
    expect(relsXml).toContain('metadata/thumbnail');
    expect(relsXml).toContain('/Metadata/object-');

    const objThumb = zip.file('Metadata/object-' + obj + '.png');
    expect(objThumb).toBeTruthy();

    const result = await validate3MF(buf);
    expect(result.ok).toBe(true);
  });
});
