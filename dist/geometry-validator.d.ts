import { Vec3, Triangle } from './model.js';
/**
 * Validates that a triangle has counter-clockwise winding when viewed from outside.
 * Returns the normal vector of the triangle.
 */
export declare function computeTriangleNormal(v0: Vec3, v1: Vec3, v2: Vec3): Vec3;
/**
 * Validates the winding order of all triangles in a mesh.
 * For a valid manifold mesh, all triangles should be consistently oriented.
 * This function checks that normals generally point outward (assuming centroid is interior).
 */
export declare function validateWindingOrder(vertices: Vec3[], triangles: Triangle[]): {
    ok: boolean;
    warnings: string[];
};
/**
 * Validates basic manifold properties: each edge should be shared by exactly 2 triangles.
 */
export declare function validateManifold(vertices: Vec3[], triangles: Triangle[]): {
    ok: boolean;
    errors: string[];
};
