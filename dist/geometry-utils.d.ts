import { Vec3, Triangle } from './model.js';
/**
 * Geometry utilities for memory-efficient mesh processing
 */
/**
 * Convert Vec3[] to Float32Array for memory efficiency
 */
export declare function verticesToTypedArray(vertices: Vec3[]): Float32Array;
/**
 * Convert Float32Array back to Vec3[] for compatibility
 */
export declare function typedArrayToVertices(flat: Float32Array): Vec3[];
/**
 * Convert Triangle[] to Uint32Array for memory efficiency
 */
export declare function trianglesToTypedArray(triangles: Triangle[]): Uint32Array;
/**
 * Convert Uint32Array back to Triangle[] for compatibility
 */
export declare function typedArrayToTriangles(flat: Uint32Array): Triangle[];
/**
 * Deduplicate vertices and remap triangle indices
 * Reduces memory usage by removing duplicate vertices
 *
 * @param vertices - Input vertices (array or typed array)
 * @param triangles - Input triangles (array or typed array)
 * @param epsilon - Tolerance for vertex comparison (default: 1e-6)
 * @returns Deduplicated geometry with remapped indices
 */
export declare function deduplicateVertices(vertices: Vec3[] | Float32Array, triangles: Triangle[] | Uint32Array, epsilon?: number): {
    vertices: Vec3[];
    triangles: Triangle[];
    stats: {
        original: number;
        deduplicated: number;
        reduction: string;
    };
};
/**
 * Compute hash of geometry for deduplication detection
 * Uses a simple but effective hash based on vertex count and bounds
 */
export declare function hashGeometry(vertices: Vec3[] | Float32Array, triangles: Triangle[] | Uint32Array): string;
/**
 * Estimate memory usage of geometry
 */
export declare function estimateMemoryUsage(vertices: Vec3[] | Float32Array, triangles: Triangle[] | Uint32Array): {
    vertices: {
        count: number;
        bytes: number;
        type: string;
    };
    triangles: {
        count: number;
        bytes: number;
        type: string;
    };
    total: number;
    optimized: number;
    savings: string;
};
