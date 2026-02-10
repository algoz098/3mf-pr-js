import JSZip from 'jszip';
import { create } from 'xmlbuilder2';

export interface InspectionResult {
  fileSize: number;
  metadata: Record<string, string>;
  resources: {
    objects: number;
    baseMaterials: number;
    textures: number;
  };
  meshStats: {
    vertices: number;
    triangles: number;
  };
  extensions: string[];
  warnings: string[];
}

/**
 * Inspect a 3MF file buffer and return structural information.
 * This function extracts the 3D model XML and analyzes it.
 */
export async function inspect3MF(buffer: Buffer): Promise<InspectionResult> {
  const result: InspectionResult = {
    fileSize: buffer.length,
    metadata: {},
    resources: { objects: 0, baseMaterials: 0, textures: 0 },
    meshStats: { vertices: 0, triangles: 0 },
    extensions: [],
    warnings: []
  };

  try {
    const zip = new JSZip();
    await zip.loadAsync(buffer);

    // TODO: Ideally resolve model path via _rels/.rels, but 3D/3dmodel.model is standard
    const modelFile = zip.file('3D/3dmodel.model');
    if (!modelFile) {
      throw new Error('Invalid 3MF: 3D/3dmodel.model not found');
    }

    const xmlContent = await modelFile.async('string');

    // Parse XML to JS object
    // xmlbuilder2 converts attributes to keys starting with '@'
    const doc = create(xmlContent).end({ format: 'object' }) as any;

    // Root element is <model>
    const model = doc.model || doc['model'];
    if (!model) {
      throw new Error('Invalid 3MF XML: <model> root element missing');
    }

    // Extensions
    const reqExt = model['@requiredextensions'];
    if (reqExt) result.extensions.push(...reqExt.split(' '));

    const recExt = model['@recommendedextensions'];
    if (recExt) result.extensions.push(...recExt.split(' '));

    // Metadata
    const metadataNode = model.metadata;
    if (metadataNode) {
      const metadataList = Array.isArray(metadataNode) ? metadataNode : [metadataNode];
      for (const m of metadataList) {
        const name = m['@name'];
        const value = m['#text'] || m['#'] || '';
        if (name) {
          result.metadata[name] = String(value);
        }
      }
    }

    // Resources
    const resources = model.resources;
    if (resources) {
      // Objects
      const objectsNode = resources.object;
      if (objectsNode) {
        const objectList = Array.isArray(objectsNode) ? objectsNode : [objectsNode];
        result.resources.objects = objectList.length;

        for (const obj of objectList) {
          if (obj.mesh) {
            // Count vertices
            const verticesNode = obj.mesh.vertices?.vertex;
            if (verticesNode) {
              if (Array.isArray(verticesNode)) {
                result.meshStats.vertices += verticesNode.length;
              } else {
                result.meshStats.vertices += 1;
              }
            }

            // Count triangles
            const trianglesNode = obj.mesh.triangles?.triangle;
            if (trianglesNode) {
              if (Array.isArray(trianglesNode)) {
                result.meshStats.triangles += trianglesNode.length;
              } else {
                result.meshStats.triangles += 1;
              }
            }
          }
        }
      }

      // Base Materials
      const basematerialsNode = resources.basematerials;
      if (basematerialsNode) {
        const bmList = Array.isArray(basematerialsNode) ? basematerialsNode : [basematerialsNode];
        result.resources.baseMaterials = bmList.length;
      }

      // Textures (look for keys like 'm:texture2d' or 'texture2d')
      for (const key of Object.keys(resources)) {
        if (key.toLowerCase().includes('texture2d') && !key.toLowerCase().includes('group')) {
          const texturesNode = resources[key];
          const textureList = Array.isArray(texturesNode) ? texturesNode : [texturesNode];
          result.resources.textures += textureList.length;
        }
      }
    }

  } catch (e: any) {
    result.warnings.push(`Inspection incomplete: ${e.message}`);
  }

  return result;
}
