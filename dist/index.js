export { Model } from './model.js';
export { validateSceneJSON } from './validate.js';
export { validateWindingOrder, validateManifold, computeTriangleNormal } from './geometry-validator.js';
export { generate3MF } from './generator.js';
export { validate3MF, formatValidationResult } from './lib3mf-validator.js';
export { deduplicateVertices, hashGeometry, estimateMemoryUsage, verticesToTypedArray, typedArrayToVertices, trianglesToTypedArray, typedArrayToTriangles, } from './geometry-utils.js';
