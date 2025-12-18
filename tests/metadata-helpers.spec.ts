import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Model } from '../src/model';

async function readModelXml(buf: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file('3D/3dmodel.model');
  if (!file) throw new Error('3D/3dmodel.model not found');
  return await file.async('string');
}

describe('Metadata helpers', () => {
  it('emits well-known metadata entries', async () => {
    const m = new Model();
    m.setTitle('Project X');
    m.setDesigner('Designer Name');
    m.setAuthor('Author Name');
    m.setApplication('3mf-pr-js');
    m.setCreationDate('2025-11-24');
    m.setModificationDate('2025-11-24');
    m.setDescription('Test description');

    // minimal mesh
    m.addMesh([ [0,0,0], [1,0,0], [0,1,0] ], [ [0,1,2] ]);

    const buf = await m.to3MF();
    const xml = await readModelXml(buf);

    expect(xml).toContain('<metadata name="Title">Project X</metadata>');
    expect(xml).toContain('<metadata name="Designer">Designer Name</metadata>');
    expect(xml).toContain('<metadata name="Author">Author Name</metadata>');
    expect(xml).toContain('<metadata name="Application">3mf-pr-js</metadata>');
    expect(xml).toContain('<metadata name="CreationDate">2025-11-24</metadata>');
    expect(xml).toContain('<metadata name="ModificationDate">2025-11-24</metadata>');
    expect(xml).toContain('<metadata name="Description">Test description</metadata>');
  });
});
