import { SceneJSON } from './validate.js';
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
export declare function generate3MF(scene: SceneJSON, options?: Generate3MFOptions): Promise<Buffer>;
