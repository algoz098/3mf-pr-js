import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { generate3MF } from '../src/generator';
import { Model } from '../src/model';

describe('High-level API', () => {
  describe('generate3MF()', () => {
    it('generates valid 3MF from minimal scene', async () => {
      const scene = {
        objects: [
          {
            type: 'mesh' as const,
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>
          }
        ]
      };

      const buffer = await generate3MF(scene);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      const zip = await JSZip.loadAsync(buffer);
      expect(Object.keys(zip.files)).toContain('3D/3dmodel.model');
    });

    it('applies unit and metadata from scene', async () => {
      const scene = {
        unit: 'inch' as const,
        metadata: {
          Title: 'Test Scene',
          Author: 'Tester'
        },
        objects: [
          {
            type: 'mesh' as const,
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>
          }
        ]
      };

      const buffer = await generate3MF(scene);
      const xml = await JSZip.loadAsync(buffer).then(z => z.file('3D/3dmodel.model')!.async('string'));
      
      expect(xml).toMatch('unit="inch"');
      expect(xml).toMatch('<metadata name="Title">Test Scene</metadata>');
      expect(xml).toMatch('<metadata name="Author">Tester</metadata>');
    });

    it('enables Production extension when requested', async () => {
      const scene = {
        objects: [
          {
            type: 'mesh' as const,
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>
          }
        ]
      };

      const buffer = await generate3MF(scene, { production: true });
      const xml = await JSZip.loadAsync(buffer).then(z => z.file('3D/3dmodel.model')!.async('string'));
      
      expect(xml).toMatch('xmlns:p=');
      expect(xml).toMatch('requiredextensions="p"');
      expect(xml).toMatch(/p:UUID="[0-9a-f-]+"/);
    });

    it('applies basematerials from scene', async () => {
      const scene = {
        basematerials: [
          { name: 'Red PLA', displaycolor: '#FF0000FF' },
          { name: 'Blue PLA', displaycolor: '#0000FFFF' }
        ],
        objects: [
          {
            type: 'mesh' as const,
            name: 'Red Object',
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>,
            materialIndex: 0
          },
          {
            type: 'mesh' as const,
            name: 'Blue Object',
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>,
            materialIndex: 1
          }
        ]
      };

      const buffer = await generate3MF(scene);
      const xml = await JSZip.loadAsync(buffer).then(z => z.file('3D/3dmodel.model')!.async('string'));
      
      expect(xml).toMatch('name="Red PLA"');
      expect(xml).toMatch('name="Blue PLA"');
      expect(xml).toMatch('displaycolor="#FF0000FF"');
      expect(xml).toMatch('displaycolor="#0000FFFF"');
    });

    it('validates input when validate option is true', async () => {
      const invalidScene = {
        // Missing required 'objects' field
      };

      await expect(
        generate3MF(invalidScene as any, { validate: true, strictValidation: true })
      ).rejects.toThrow('Invalid input JSON');
    });

    it('allows skipping validation', async () => {
      const scene = {
        objects: [
          {
            type: 'mesh' as const,
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>
          }
        ]
      };

      const buffer = await generate3MF(scene, { validate: false });
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('creates components from scene', async () => {
      const scene = {
        objects: [
          {
            type: 'mesh' as const,
            name: 'Base',
            vertices: [[0,0,0], [1,0,0], [0,1,0]] as Array<[number,number,number]>,
            triangles: [[0,1,2]] as Array<[number,number,number]>
          },
          {
            type: 'components' as const,
            name: 'Assembly',
            components: [
              { objectIndex: 0, transform: [1,0,0, 0,1,0, 0,0,1, 5,0,0] as [number,number,number,number,number,number,number,number,number,number,number,number] }
            ]
          }
        ]
      };

      const buffer = await generate3MF(scene);
      const xml = await JSZip.loadAsync(buffer).then(z => z.file('3D/3dmodel.model')!.async('string'));
      
      expect(xml).toMatch('<components>');
      expect(xml).toMatch('transform="1 0 0 0 1 0 0 0 1 5 0 0"');
    });
  });

  describe('External model basematerial synchronization', () => {
    it('synchronizes materials from root to external models', async () => {
      const m = new Model();
      m.enableProduction(true);
      
      // Create material in set 1
      const mat1 = m.addBaseMaterial('PLA Red', '#FF0000FF', 1);
      expect(mat1.pid).toBe(1);
      expect(mat1.pindex).toBe(0);
      
      // Add external mesh using material from set 1
      const ext = m.addExternalMesh(
        '3D/parts/part1.model',
        'Part 1',
        [[0,0,0], [1,0,0], [0,1,0]],
        [[0,1,2]],
        { material: mat1 }
      );
      
      const buf = await m.to3MF();
      const zip = await JSZip.loadAsync(buf);
      
      // Check root model has material
      const rootXml = await zip.file('3D/3dmodel.model')!.async('string');
      expect(rootXml).toMatch('<basematerials id="1">');
      expect(rootXml).toMatch('name="PLA Red"');
      
      // Check external model has synchronized material
      const extXml = await zip.file('3D/parts/part1.model')!.async('string');
      expect(extXml).toMatch('<basematerials id="1">');
      expect(extXml).toMatch('name="PLA Red"');
      expect(extXml).toMatch('displaycolor="#FF0000FF"');
    });

    it('synchronizes multiple material sets to external models', async () => {
      const m = new Model();
      m.enableProduction(true);
      
      // Create materials in different sets
      const mat1 = m.addBaseMaterial('Red', '#FF0000FF', 1);
      const mat2 = m.addBaseMaterial('Blue', '#0000FFFF', 2);
      
      // Add external mesh using material from set 2
      const ext = m.addExternalMesh(
        '3D/parts/part2.model',
        'Part 2',
        [[0,0,0], [1,0,0], [0,1,0]],
        [[0,1,2]],
        { material: mat2 }
      );
      
      const buf = await m.to3MF();
      const zip = await JSZip.loadAsync(buf);
      
      const extXml = await zip.file('3D/parts/part2.model')!.async('string');
      expect(extXml).toMatch('<basematerials id="2">');
      expect(extXml).toMatch('name="Blue"');
      expect(extXml).not.toMatch('name="Red"'); // Should not copy unused materials
    });
  });
});
