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

describe('Materials extension - colorgroup', () => {
  it('emits m:colorgroup and allows pid/pindex assignment on triangles', async () => {
    const model = new Model();
    // Create color group and add colors
    const gid = model.createColorGroup();
    const red = model.addColorToGroup('#FF0000FF', 'Red', gid);
    const green = model.addColorToGroup('#00FF00FF', 'Green', gid);

    // Mesh
    const obj = model.addMesh(
      [ [0,0,0], [1,0,0], [0,1,0], [0,0,1] ],
      [ [0,1,2], [0,1,3], [0,2,3], [1,2,3] ],
      { name: 'Colored', material: red }
    );

    // Per-triangle override using color group indices
    model.setTriangleMaterials(obj, [
      { index: 1, pid: red.pid, p1: red.pindex, p2: red.pindex, p3: red.pindex },
      { index: 2, pid: green.pid, p1: green.pindex, p2: green.pindex, p3: green.pindex }
    ]);

    const buf = await model.to3MF();
    const xml = await readModelXml(buf);
    expect(xml).toContain('xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"');
    expect(xml).toContain('<m:colorgroup id="' + gid + '">');
    expect(xml).toContain('<m:color');
    expect(xml).toContain('value="#FF0000FF"');
    expect(xml).toContain('name="Red"');
    expect(xml).toContain('value="#00FF00FF"');
    expect(xml).toContain('name="Green"');

    // Triangles should include pid/p1..p3 referencing color group
    expect(xml).toMatch(/<triangle[^>]*pid="\d+"/);

    const result = await validate3MF(buf);
    expect(result.ok).toBe(true);
  });
});
