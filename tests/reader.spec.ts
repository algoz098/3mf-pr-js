import { describe, it, expect } from 'vitest';
import { Model } from '../src/model.js';
import { ThreeMFReader } from '../src/reader.js';

describe('Reader API (Skeleton)', () => {
  it('loads a valid 3MF archive', async () => {
    // Feature: Core Specification 1.1 - Package Structure
    // https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md#2-package-structure
    const model = new Model();
    const v: [number,number,number][] = [[0,0,0], [1,0,0], [0,1,0]];
    const t: [number,number,number][] = [[0,1,2]];
    model.addMesh(v, t, { name: 'Triangle' });

    const buffer = await model.to3MF();
    const reader = new ThreeMFReader();
    const loadedModel = await reader.read(buffer);

    // Currently reader returns an empty model, but it should not throw
    expect(loadedModel).toBeInstanceOf(Model);
  });

  it('rejects an invalid buffer (not a zip)', async () => {
    // Feature: ZIP Validation
    const invalidBuffer = Buffer.from('not a zip file');
    const reader = new ThreeMFReader();

    await expect(reader.read(invalidBuffer)).rejects.toThrow('Failed to load ZIP');
  });

  it('rejects a zip without 3MF structure', async () => {
    // Feature: Core Specification 2.1 - 3D Payload
    // https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md#21-3d-payload
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file('hello.txt', 'world');
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    const reader = new ThreeMFReader();
    await expect(reader.read(buffer)).rejects.toThrow('Invalid 3MF file');
  });
});
