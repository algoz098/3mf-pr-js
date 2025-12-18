export { Model } from './model.js';
export type { Vec3, Triangle, Transform, Vec3Input, TriangleInput } from './model.js';
export { validateSceneJSON } from './validate.js';
export type { SceneJSON } from './validate.js';
export { validateWindingOrder, validateManifold, computeTriangleNormal } from './geometry-validator.js';
export { generate3MF } from './generator.js';
export type { Generate3MFOptions } from './generator.js';
export { validate3MF, formatValidationResult } from './lib3mf-validator.js';
export type { ValidationResult, ValidationError } from './lib3mf-validator.js';
export {
  deduplicateVertices,
  hashGeometry,
  estimateMemoryUsage,
  verticesToTypedArray,
  typedArrayToVertices,
  trianglesToTypedArray,
  typedArrayToTriangles,
} from './geometry-utils.js';
