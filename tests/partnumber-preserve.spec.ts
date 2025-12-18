import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Model } from '../src/model';
import { validate3MF } from '../src/lib3mf-validator';

async function readXml(zipBuf: Buffer, path: string): Promise<string> {
  const zip = await JSZip.loadAsync(zipBuf);
  const file = zip.file(path);
  if (!file) throw new Error(`${path} not found`);
  return await file.async('string');
}

describe('Partnumber attributes', () => {
  it('emits partnumber on object and build item', async () => {
    const model = new Model();
    const obj = model.addMesh(
      [ [0,0,0], [1,0,0], [0,1,0] ],
      [ [0,1,2] ],
      { name: 'Part A' }
    );
    model.setObjectPartNumber(obj, 'PN-001');
    model.addBuildItem(obj, undefined, { partnumber: 'BI-001' });

    const buf = await model.to3MF();
    const modelXml = await readXml(buf, '3D/3dmodel.model');
    expect(modelXml).toContain('partnumber="PN-001"');
    expect(modelXml).toContain('<item objectid="' + obj + '"');
    expect(modelXml).toContain('partnumber="BI-001"');

    const result = await validate3MF(buf);
    expect(result.ok).toBe(true);
  });
});

describe('MustPreserve custom parts', () => {
  it('adds MustPreserve relationship and content types', async () => {
    const model = new Model();
    // Minimal mesh to create valid model
    model.addMesh([ [0,0,0], [1,0,0], [0,1,0] ], [ [0,1,2] ]);

    // Add a preserved text part
    model.addPreservePart('/Metadata/notes.txt', 'Important notes');

    const buf = await model.to3MF();
    const rels = await readXml(buf, '_rels/.rels');
    expect(rels).toContain('relationships/mustpreserve');
    expect(rels).toContain('/Metadata/notes.txt');

    const contentTypes = await readXml(buf, '[Content_Types].xml');
    expect(contentTypes).toContain('Extension="txt"');
    expect(contentTypes).toContain('ContentType="text/plain"');

    const zip = await JSZip.loadAsync(buf);
    expect(zip.file('Metadata/notes.txt')).toBeTruthy();

    const result = await validate3MF(buf);
    expect(result.ok).toBe(true);
  });
});
