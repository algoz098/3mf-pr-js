import { Model } from '../dist/index.js';
import { PNG } from 'pngjs';

async function main() {
  const model = new Model();
  model.setUnit('millimeter');
  model.addMetadata('Title', 'Materials & Textures Demo');
  model.addMetadata('Application', '3mf-pr-js');

  // 1) Color Group with per-triangle override
  const cgId = model.createColorGroup();
  const colorRed = model.addColorToGroup('#FF0000FF', 'Red', cgId);
  const colorGreen = model.addColorToGroup('#00FF00FF', 'Green', cgId);

  const colored = model.addMesh(
    [ [0,0,0], [10,0,0], [0,10,0], [10,10,0] ],
    [ [0,1,2], [2,1,3] ],
    { name: 'Colored', material: colorRed }
  );
  model.setTriangleMaterials(colored, [
    { index: 0, pid: cgId, p1: colorRed.pindex, p2: colorRed.pindex, p3: colorRed.pindex },
    { index: 1, pid: cgId, p1: colorGreen.pindex, p2: colorGreen.pindex, p3: colorGreen.pindex },
  ]);

  // 2) Textures: generate a small 2x2 PNG and use UVs
  const png = new PNG({ width: 2, height: 2 });
  // RGBA pixels: [r,g,b,a]
  const px = [
    [255, 0, 0, 255],   // red
    [0, 255, 0, 255],   // green
    [0, 0, 255, 255],   // blue
    [255, 255, 255, 255]// white
  ];
  for (let i = 0; i < 4; i++) {
    const off = i * 4;
    png.data[off + 0] = px[i][0];
    png.data[off + 1] = px[i][1];
    png.data[off + 2] = px[i][2];
    png.data[off + 3] = px[i][3];
  }
  const pngBuf = PNG.sync.write(png);
  const texId = model.addTexture(new Uint8Array(pngBuf), 'png');
  const tgroup = model.createTextureGroup(texId, { tilestyleu: 'wrap', tilestylev: 'wrap', filter: 'auto' });
  const uv0 = model.addTexCoord(tgroup, 0.0, 0.0);
  const uv1 = model.addTexCoord(tgroup, 1.0, 0.0);
  const uv2 = model.addTexCoord(tgroup, 0.0, 1.0);
  const uv3 = model.addTexCoord(tgroup, 1.0, 1.0);

  const textured = model.addMesh(
    [ [0,0,0], [10,0,0], [0,10,0], [10,10,0] ],
    [ [0,1,2], [2,1,3] ],
    { name: 'Textured' }
  );
  model.setTriangleMaterials(textured, [
    { index: 0, pid: tgroup, p1: uv0, p2: uv1, p3: uv2 },
    { index: 1, pid: tgroup, p1: uv2, p2: uv1, p3: uv3 },
  ]);

  // 3) CompositeMaterials: blend base materials
  const baseSet = model.createBaseMaterialsSet();
  model.addBaseMaterial('Red', '#FF0000FF', baseSet);
  model.addBaseMaterial('Blue', '#0000FFFF', baseSet);
  const compId = model.createCompositeMaterials(baseSet);
  const compIdx = model.addComposite(compId, [0.5, 0.5]);
  model.addMesh(
    [ [20,0,0], [30,0,0], [20,10,0] ],
    [ [0,1,2] ],
    { name: 'Composite', material: { pid: compId, pindex: compIdx } }
  );

  // 4) MultiMaterials: combine indices across pids
  const setA = model.createBaseMaterialsSet();
  const aMat = model.addBaseMaterial('A', '#FF0000FF', setA);
  const setB = model.createBaseMaterialsSet();
  model.addBaseMaterial('B', '#0000FFFF', setB);
  const mmId = model.createMultiMaterials([setA, setB]);
  const comboIdx = model.addMultiMaterial(mmId, [aMat.pindex, 0]);
  model.addMesh(
    [ [20,20,0], [30,20,0], [20,30,0] ],
    [ [0,1,2] ],
    { name: 'Multi', material: { pid: mmId, pindex: comboIdx } }
  );

  await model.writeToFile('out-materials.3mf');
  console.log('Wrote out-materials.3mf');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
