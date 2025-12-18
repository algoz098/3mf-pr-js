import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Model } from '../src/model';

describe('Advanced features', () => {
  describe('Multiple basematerials sets', () => {
    it('creates multiple material sets with different IDs', async () => {
      const m = new Model();
      
      // Create two material sets
      m.createBaseMaterialsSet(1);
      m.createBaseMaterialsSet(2);
      
      // Add materials to set 1
      const mat1a = m.addBaseMaterial('PLA Red', '#FF0000FF', 1);
      const mat1b = m.addBaseMaterial('PLA Blue', '#0000FFFF', 1);
      
      // Add materials to set 2
      const mat2a = m.addBaseMaterial('ABS Black', '#000000FF', 2);
      const mat2b = m.addBaseMaterial('ABS White', '#FFFFFFFF', 2);
      
      expect(mat1a.pid).toBe(1);
      expect(mat1b.pid).toBe(1);
      expect(mat2a.pid).toBe(2);
      expect(mat2b.pid).toBe(2);
      
      expect(mat1a.pindex).toBe(0);
      expect(mat1b.pindex).toBe(1);
      expect(mat2a.pindex).toBe(0);
      expect(mat2b.pindex).toBe(1);
      
      // Create meshes with different material sets
      const mesh1 = m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]], { name: 'Red', material: mat1a });
      const mesh2 = m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]], { name: 'Black', material: mat2a });
      
      const buf = await m.to3MF();
      const xml = await JSZip.loadAsync(buf).then(z => z.file('3D/3dmodel.model')!.async('string'));
      
      // Verify both material sets exist
      expect(xml).toMatch('<basematerials id="1">');
      expect(xml).toMatch('<basematerials id="2">');
      
      // Verify materials in sets
      expect(xml).toMatch('name="PLA Red"');
      expect(xml).toMatch('name="ABS Black"');
      
      // Verify objects reference correct sets
      expect(xml).toMatch(/id="1"[^>]*pid="1"/);
      expect(xml).toMatch(/id="2"[^>]*pid="2"/);
    });

    it('prevents duplicate set IDs', () => {
      const m = new Model();
      m.createBaseMaterialsSet(5);
      expect(() => m.createBaseMaterialsSet(5)).toThrow('already exists');
    });

    it('auto-creates set when adding material to non-existent set', async () => {
      const m = new Model();
      const mat = m.addBaseMaterial('PLA Green', '#00FF00FF', 3);
      expect(mat.pid).toBe(3);
      
      const buf = await m.to3MF();
      const xml = await JSZip.loadAsync(buf).then(z => z.file('3D/3dmodel.model')!.async('string'));
      expect(xml).toMatch('<basematerials id="3">');
    });
  });

  describe('Thumbnail directory options', () => {
    it('places thumbnail in /Thumbnails/ by default', async () => {
      const m = new Model();
      const png = new Uint8Array([137,80,78,71,13,10,26,10]);
      m.setThumbnail(png);
      m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]]);
      
      const buf = await m.to3MF();
      const zip = await JSZip.loadAsync(buf);
      expect(Object.keys(zip.files)).toContain('Thumbnails/thumbnail.png');
      
      const rels = await zip.file('_rels/.rels')!.async('string');
      expect(rels).toMatch('/Thumbnails/thumbnail.png');
    });

    it('places thumbnail in /Metadata/ when specified', async () => {
      const m = new Model();
      const png = new Uint8Array([137,80,78,71,13,10,26,10]);
      m.setThumbnail(png, 'png', 'Metadata');
      m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]]);
      
      const buf = await m.to3MF();
      const zip = await JSZip.loadAsync(buf);
      expect(Object.keys(zip.files)).toContain('Metadata/thumbnail.png');
      
      const rels = await zip.file('_rels/.rels')!.async('string');
      expect(rels).toMatch('/Metadata/thumbnail.png');
    });

    it('supports JPEG thumbnails', async () => {
      const m = new Model();
      const jpg = new Uint8Array([255,216,255,224]); // JPEG header
      m.setThumbnail(jpg, 'jpg');
      m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]]);
      
      const buf = await m.to3MF();
      const zip = await JSZip.loadAsync(buf);
      expect(Object.keys(zip.files)).toContain('Thumbnails/thumbnail.jpg');
      
      const rels = await zip.file('_rels/.rels')!.async('string');
      expect(rels).toMatch('/Thumbnails/thumbnail.jpg');
    });
  });

  describe('Content Types overrides', () => {
    it('adds Override entries for model parts', async () => {
      const m = new Model();
      m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]]);
      
      const buf = await m.to3MF();
      const ct = await JSZip.loadAsync(buf).then(z => z.file('[Content_Types].xml')!.async('string'));
      
      expect(ct).toMatch('<Override');
      expect(ct).toMatch('PartName="/3D/3dmodel.model"');
      expect(ct).toMatch('ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"');
    });

    it('adds Override entries for external model parts', async () => {
      const m = new Model();
      m.enableProduction(true);
      m.addBaseMaterial('PLA', '#FFFFFFFF');
      
      const ext = m.addExternalMesh('3D/parts/part1.model', 'Part1',
        [[0,0,0],[1,0,0],[0,1,0]],
        [[0,1,2]],
        { material: { pid: 1, pindex: 0 } }
      );
      m.addExternalBuildItem(ext.objectid, ext.path);
      
      const buf = await m.to3MF();
      const ct = await JSZip.loadAsync(buf).then(z => z.file('[Content_Types].xml')!.async('string'));
      
      expect(ct).toMatch('PartName="/3D/parts/part1.model"');
      expect(ct).toMatch('ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"');
    });
  });

  describe('Geometry validation in addMesh', () => {
    it('rejects empty vertices', () => {
      const m = new Model();
      expect(() => m.addMesh([], [[0,1,2]])).toThrow('vertices must not be empty');
    });

    it('rejects empty triangles', () => {
      const m = new Model();
      expect(() => m.addMesh([[0,0,0]], [])).toThrow('triangles must not be empty');
    });

    it('rejects non-finite vertex coordinates', () => {
      const m = new Model();
      expect(() => m.addMesh([[NaN,0,0],[1,0,0],[0,1,0]], [[0,1,2]])).toThrow('finite numbers');
      expect(() => m.addMesh([[Infinity,0,0],[1,0,0],[0,1,0]], [[0,1,2]])).toThrow('finite numbers');
    });

    it('rejects invalid triangle indices', () => {
      const m = new Model();
      expect(() => m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,3]])).toThrow('out of range');
      expect(() => m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[-1,1,2]])).toThrow('out of range');
      expect(() => m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0.5,1,2] as any])).toThrow('must be integers');
    });
  });
});
