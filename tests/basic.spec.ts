import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { Model } from '../src/model';

describe('3MF generation', () => {
  it('creates a minimal 3MF with core files', async () => {
    const m = new Model();
    m.addMetadata('Title', 'Teste Minimal');
    const mat = m.addBaseMaterial('PLA Branco', '#FFFFFFFF');
    const vertices: [number, number, number][] = [
      [0, 0, 0],
      [10, 0, 0],
      [0, 10, 0],
      [0, 0, 10],
    ];
    const triangles: [number, number, number][] = [
      [0, 1, 2],
      [0, 1, 3],
      [1, 2, 3],
      [2, 0, 3],
    ];

    m.addMesh(vertices, triangles, { material: mat });
    const buf = await m.to3MF();

    const zip = await JSZip.loadAsync(buf);
    const names = Object.keys(zip.files).sort();

    expect(names).toContain('[Content_Types].xml');
    expect(names).toContain('_rels/.rels');
    expect(names).toContain('3D/3dmodel.model');

    const modelXml = await zip.file('3D/3dmodel.model')!.async('string');
    expect(modelXml).toMatch('<model');
    expect(modelXml).toMatch('<resources>');
    expect(modelXml).toMatch('<build>');
    expect(modelXml).toMatch('<metadata name="Title">Teste Minimal</metadata>');
    expect(modelXml).toMatch('<basematerials id="1">');
  });
  
  it('enables Production and adds UUIDs', async () => {
    const m = new Model();
    m.enableProduction(true);
    const id = m.addMesh(
      [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
      ],
      [[0, 1, 2]],
      { name: 'Tri', material: m.addBaseMaterial('PLA Azul', '#0000FFFF') }
    );
    m.addBuildItem(id, [1,0,0, 0,1,0, 0,0,1, 5,5,0]);
    const buf = await m.to3MF();
    const modelXml = await JSZip.loadAsync(buf).then(z => z.file('3D/3dmodel.model')!.async('string'));
    expect(modelXml).toMatch('xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"');
    expect(modelXml).toMatch('requiredextensions="p"');
    expect(modelXml).toMatch(/p:UUID="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/);
    expect(modelXml).toMatch('transform="1 0 0 0 1 0 0 0 1 5 5 0"');
  });

  it('creates object with components and transforms', async () => {
    const m = new Model();
    const mat = m.addBaseMaterial('PLA Cinza', '#808080FF');
    const wheel = m.addMesh(
      [
        [0, 0, 0],
        [10, 0, 0],
        [5, 8.66, 0],
        [5, 4, 5],
      ],
      [
        [0, 1, 2],
        [0, 1, 3],
        [1, 2, 3],
        [2, 0, 3],
      ],
      { name: 'Roda', material: mat }
    );
    const car = m.addComponentObject('Carro', [
      { objectid: wheel, transform: [1,0,0, 0,1,0, 0,0,1, 10,10,0] },
      { objectid: wheel, transform: [1,0,0, 0,1,0, 0,0,1, 10,30,0] },
    ]);
    const buf = await m.to3MF();
    const xml = await JSZip.loadAsync(buf).then(z => z.file('3D/3dmodel.model')!.async('string'));
    expect(xml).toMatch('<components>');
    expect(xml).toMatch('objectid="'+wheel+'"');
    expect(xml).toMatch('transform="1 0 0 0 1 0 0 0 1 10 10 0"');
    expect(xml).toMatch('<item objectid="'+car+'"');
  });

  it('sets per-triangle materials', async () => {
    const m = new Model();
    const mat = m.addBaseMaterial('PLA Branco', '#FFFFFFFF');
    const id = m.addMesh(
      [[0,0,0],[10,0,0],[0,10,0],[0,0,10]],
      [[0,1,2],[0,1,3],[1,2,3],[2,0,3]],
      { material: mat }
    );
    // Set different base indices per triangle corners
    m.setTriangleMaterials(id, [
      { index: 0, pid: 1, p1: 0, p2: 0, p3: 0 },
      { index: 1, pid: 1, p1: 0, p2: 0, p3: 0 },
    ]);
    const buf = await m.to3MF();
    const xml = await JSZip.loadAsync(buf).then(z => z.file('3D/3dmodel.model')!.async('string'));
    expect(xml).toMatch('<triangle v1="0" v2="1" v3="2" pid="1" p1="0" p2="0" p3="0"');
    expect(xml).toMatch('<triangle v1="0" v2="1" v3="3" pid="1" p1="0" p2="0" p3="0"');
  });

  it('adds thumbnail and root relationship', async () => {
    const m = new Model();
    // Fake PNG bytes (not a valid image, but enough for packaging test)
    const png = new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
    m.setThumbnail(png);
    m.addMesh([[0,0,0],[1,0,0],[0,1,0]], [[0,1,2]]);
    const buf = await m.to3MF();
    const zip = await JSZip.loadAsync(buf);
    expect(Object.keys(zip.files)).toContain('Thumbnails/thumbnail.png');
    const rels = await zip.file('_rels/.rels')!.async('string');
    expect(rels).toMatch('relationships/metadata/thumbnail');
    expect(rels).toMatch('/Thumbnails/thumbnail.png');
  });

  it('creates external model and references via p:path', async () => {
    const m = new Model();
    m.enableProduction(true);
    m.addBaseMaterial('PLA Azul', '#0000FFFF');
    const ext = m.addExternalMesh('3D/parts/widget.model', 'Widget',
      [[0,0,0],[5,0,0],[2.5,4,0],[2.5,2,5]],
      [[0,1,2],[0,1,3],[1,2,3],[2,0,3]],
      { material: { pid: 1, pindex: 0 } }
    );
    m.addExternalBuildItem(ext.objectid, ext.path, [1,0,0, 0,1,0, 0,0,1, 20,20,0]);
    const buf = await m.to3MF();
    const zip = await JSZip.loadAsync(buf);
    expect(Object.keys(zip.files)).toContain('3D/parts/widget.model');
    expect(Object.keys(zip.files)).toContain('3D/_rels/3dmodel.model.rels');
    const rels = await zip.file('3D/_rels/3dmodel.model.rels')!.async('string');
    expect(rels).toMatch('/3D/parts/widget.model');
    const xml = await zip.file('3D/3dmodel.model')!.async('string');
    expect(xml).toMatch('p:path="/3D/parts/widget.model"');
    expect(xml).toMatch('transform="1 0 0 0 1 0 0 0 1 20 20 0"');
  });
});
