import { Vec3, Triangle } from './model.js';

/**
 * Validates that a triangle has counter-clockwise winding when viewed from outside.
 * Returns the normal vector of the triangle.
 */
export function computeTriangleNormal(v0: Vec3, v1: Vec3, v2: Vec3): Vec3 {
  // Edge vectors
  const e1: Vec3 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
  const e2: Vec3 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
  
  // Cross product e1 × e2 gives normal
  const nx = e1[1] * e2[2] - e1[2] * e2[1];
  const ny = e1[2] * e2[0] - e1[0] * e2[2];
  const nz = e1[0] * e2[1] - e1[1] * e2[0];
  
  return [nx, ny, nz];
}

/**
 * Validates the winding order of all triangles in a mesh.
 * For a valid manifold mesh, all triangles should be consistently oriented.
 * This function checks that normals generally point outward (assuming centroid is interior).
 */
export function validateWindingOrder(
  vertices: Vec3[],
  triangles: Triangle[]
): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Compute mesh centroid
  let cx = 0, cy = 0, cz = 0;
  for (const v of vertices) {
    cx += v[0];
    cy += v[1];
    cz += v[2];
  }
  const count = vertices.length;
  cx /= count;
  cy /= count;
  cz /= count;
  
  let outwardCount = 0;
  let inwardCount = 0;
  
  for (let i = 0; i < triangles.length; i++) {
    const tri = triangles[i];
    const v0 = vertices[tri[0]];
    const v1 = vertices[tri[1]];
    const v2 = vertices[tri[2]];
    
    if (!v0 || !v1 || !v2) {
      warnings.push(`Triangle ${i}: invalid vertex indices`);
      continue;
    }
    
    const normal = computeTriangleNormal(v0, v1, v2);
    
    // Check if normal is degenerate (zero length)
    const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
    if (len < 1e-9) {
      warnings.push(`Triangle ${i}: degenerate (zero area)`);
      continue;
    }
    
    // Triangle centroid
    const tcx = (v0[0] + v1[0] + v2[0]) / 3;
    const tcy = (v0[1] + v1[1] + v2[1]) / 3;
    const tcz = (v0[2] + v1[2] + v2[2]) / 3;
    
    // Vector from mesh centroid to triangle centroid
    const dx = tcx - cx;
    const dy = tcy - cy;
    const dz = tcz - cz;
    
    // Dot product: if positive, normal points away from centroid (outward)
    const dot = normal[0] * dx + normal[1] * dy + normal[2] * dz;
    
    if (dot > 0) {
      outwardCount++;
    } else if (dot < 0) {
      inwardCount++;
      warnings.push(`Triangle ${i}: appears to have inverted winding`);
    }
  }
  
  // If most triangles point inward, the whole mesh might be inverted
  if (inwardCount > outwardCount && triangles.length > 0) {
    warnings.push('Warning: Most triangles appear inverted. Consider reversing winding order.');
  }
  
  return { ok: warnings.length === 0, warnings };
}

/**
 * Validates basic manifold properties: each edge should be shared by exactly 2 triangles.
 */
export function validateManifold(
  vertices: Vec3[],
  triangles: Triangle[]
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const edgeMap = new Map<string, number>();
  
  const edgeKey = (a: number, b: number) => {
    return a < b ? `${a}-${b}` : `${b}-${a}`;
  };
  
  for (const tri of triangles) {
    const edges = [
      edgeKey(tri[0], tri[1]),
      edgeKey(tri[1], tri[2]),
      edgeKey(tri[2], tri[0]),
    ];
    
    for (const edge of edges) {
      edgeMap.set(edge, (edgeMap.get(edge) || 0) + 1);
    }
  }
  
  let nonManifoldEdges = 0;
  for (const [edge, count] of edgeMap.entries()) {
    if (count !== 2) {
      nonManifoldEdges++;
      if (nonManifoldEdges <= 5) { // Limit error output
        errors.push(`Non-manifold edge ${edge}: used by ${count} triangles (expected 2)`);
      }
    }
  }
  
  if (nonManifoldEdges > 5) {
    errors.push(`... and ${nonManifoldEdges - 5} more non-manifold edges`);
  }
  
  return { ok: errors.length === 0, errors };
}
