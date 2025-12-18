import { Model, Vec3, Triangle, Transform } from './model.js';
import { validateSceneJSON, SceneJSON } from './validate.js';

export interface Generate3MFOptions {
  /** Enable Production extension (UUIDs, multifile support) */
  production?: boolean;
  /** Validate input JSON before processing */
  validate?: boolean;
  /** Throw error if validation fails (default: true) */
  strictValidation?: boolean;
  /** Pretty-print XML (adds whitespace, larger files) */
  prettyPrint?: boolean;
}

export interface ValidationError extends Error {
  validationErrors?: string[];
}

/**
 * Generate a 3MF file from a SceneJSON input.
 * High-level convenience function that creates a Model, populates it, and returns the buffer.
 * 
 * @param scene - Scene description following the SceneJSON schema
 * @param options - Generation options
 * @returns Promise resolving to 3MF file buffer
 * @throws ValidationError if validation fails and strictValidation is true
 * 
 * @example
 * ```typescript
 * const scene = {
 *   unit: 'millimeter',
 *   objects: [{
 *     type: 'mesh',
 *     vertices: [[0,0,0], [10,0,0], [0,10,0]],
 *     triangles: [[0,1,2]]
 *   }]
 * };
 * const buffer = await generate3MF(scene, { production: true });
 * await fs.writeFile('output.3mf', buffer);
 * ```
 */
export async function generate3MF(
  scene: SceneJSON,
  options: Generate3MFOptions = {}
): Promise<Buffer> {
  const {
    production = false,
    validate = true,
    strictValidation = true,
  } = options;

  // Validate input if requested
  if (validate) {
    const validation = validateSceneJSON(scene);
    if (!validation.ok) {
      const error = new Error('Invalid input JSON') as ValidationError;
      error.validationErrors = validation.errors;
      if (strictValidation) {
        throw error;
      } else {
        console.warn('Validation warnings:', validation.errors);
      }
    }
  }

  const model = new Model();
  
  // Set configuration
  if (scene.unit) model.setUnit(scene.unit);
  if (scene.lang) model.setLanguage(scene.lang);
  if (production || scene.production) model.enableProduction(true);

  // Add metadata
  if (scene.metadata) {
    for (const [key, value] of Object.entries(scene.metadata)) {
      model.addMetadata(key, value);
    }
  }

  // Add base materials
  const materialsPidIndex: Array<{ pid: number; pindex: number }> = [];
  if (scene.basematerials?.length) {
    for (const bm of scene.basematerials) {
      const m = model.addBaseMaterial(bm.name, bm.displaycolor);
      materialsPidIndex.push(m);
    }
  }

  // Add objects
  const objectIds: number[] = [];
  for (const obj of scene.objects ?? []) {
    if (obj.type === 'mesh') {
      const material = obj.materialIndex !== undefined 
        ? materialsPidIndex[obj.materialIndex] 
        : undefined;
      const id = model.addMesh(
        obj.vertices as Vec3[], 
        obj.triangles as Triangle[], 
        { name: obj.name, material }
      );
      objectIds.push(id);
      
      // Apply per-triangle materials if provided
      if (obj.triangleMaterials && obj.triangleMaterials.length > 0) {
        const assignments = obj.triangleMaterials.map((matIdx, triIdx) => {
          const mat = materialsPidIndex[matIdx];
          return {
            index: triIdx,
            pid: mat?.pid,
            p1: mat?.pindex,
            p2: mat?.pindex,
            p3: mat?.pindex
          };
        });
        model.setTriangleMaterials(id, assignments);
      }
    } else if (obj.type === 'components') {
      const comps = obj.components.map(c => ({
        objectid: objectIds[c.objectIndex],
        transform: c.transform as Transform | undefined,
        path: c.path
      }));
      const id = model.addComponentObject(obj.name ?? 'Components', comps);
      objectIds.push(id);
    }
  }

  // Add build items (if not specified, Model already added defaults)
  if (scene.build && scene.build.length > 0) {
    // Clear default build items that were automatically added by addMesh/addComponentObject
    model.clearBuildItems();
    
    // Add explicit build items from scene
    for (const item of scene.build) {
      model.addBuildItem(
        objectIds[item.objectIndex],
        item.transform as Transform | undefined
      );
    }
  }

  // Add external models
  for (const ext of scene.external ?? []) {
    const material = ext.materialIndex !== undefined 
      ? materialsPidIndex[ext.materialIndex] 
      : undefined;
    const ref = model.addExternalMesh(
      ext.path, 
      ext.name, 
      ext.vertices as Vec3[], 
      ext.triangles as Triangle[], 
      { material }
    );
    model.addExternalBuildItem(
      ref.objectid, 
      ref.path, 
      ext.buildItem?.transform as Transform | undefined
    );
  }

  return model.to3MF();
}
