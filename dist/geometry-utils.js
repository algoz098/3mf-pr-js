/**
 * Geometry utilities for memory-efficient mesh processing
 */
/**
 * Convert Vec3[] to Float32Array for memory efficiency
 */
export function verticesToTypedArray(vertices) {
    const flat = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
        flat[i * 3] = vertices[i][0];
        flat[i * 3 + 1] = vertices[i][1];
        flat[i * 3 + 2] = vertices[i][2];
    }
    return flat;
}
/**
 * Convert Float32Array back to Vec3[] for compatibility
 */
export function typedArrayToVertices(flat) {
    const vertices = [];
    for (let i = 0; i < flat.length; i += 3) {
        vertices.push([flat[i], flat[i + 1], flat[i + 2]]);
    }
    return vertices;
}
/**
 * Convert Triangle[] to Uint32Array for memory efficiency
 */
export function trianglesToTypedArray(triangles) {
    const flat = new Uint32Array(triangles.length * 3);
    for (let i = 0; i < triangles.length; i++) {
        flat[i * 3] = triangles[i][0];
        flat[i * 3 + 1] = triangles[i][1];
        flat[i * 3 + 2] = triangles[i][2];
    }
    return flat;
}
/**
 * Convert Uint32Array back to Triangle[] for compatibility
 */
export function typedArrayToTriangles(flat) {
    const triangles = [];
    for (let i = 0; i < flat.length; i += 3) {
        triangles.push([flat[i], flat[i + 1], flat[i + 2]]);
    }
    return triangles;
}
/**
 * Deduplicate vertices and remap triangle indices
 * Reduces memory usage by removing duplicate vertices
 *
 * @param vertices - Input vertices (array or typed array)
 * @param triangles - Input triangles (array or typed array)
 * @param epsilon - Tolerance for vertex comparison (default: 1e-6)
 * @returns Deduplicated geometry with remapped indices
 */
export function deduplicateVertices(vertices, triangles, epsilon = 1e-6) {
    // Convert to flat arrays if needed
    const verticesFlat = vertices instanceof Float32Array
        ? vertices
        : verticesToTypedArray(vertices);
    const trianglesFlat = triangles instanceof Uint32Array
        ? triangles
        : trianglesToTypedArray(triangles);
    const vertexCount = verticesFlat.length / 3;
    const map = new Map();
    const newVertices = [];
    const indexMap = new Map();
    // Build vertex map with spatial hashing
    for (let i = 0; i < vertexCount; i++) {
        const x = verticesFlat[i * 3];
        const y = verticesFlat[i * 3 + 1];
        const z = verticesFlat[i * 3 + 2];
        // Create key with fixed precision
        const key = `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;
        if (!map.has(key)) {
            const newIdx = newVertices.length / 3;
            map.set(key, newIdx);
            indexMap.set(i, newIdx);
            newVertices.push(x, y, z);
        }
        else {
            indexMap.set(i, map.get(key));
        }
    }
    // Remap triangle indices
    const newTriangles = [];
    for (let i = 0; i < trianglesFlat.length; i += 3) {
        const v1 = indexMap.get(trianglesFlat[i]);
        const v2 = indexMap.get(trianglesFlat[i + 1]);
        const v3 = indexMap.get(trianglesFlat[i + 2]);
        newTriangles.push([v1, v2, v3]);
    }
    // Convert back to Vec3[]
    const deduplicatedVertices = typedArrayToVertices(new Float32Array(newVertices));
    const stats = {
        original: vertexCount,
        deduplicated: deduplicatedVertices.length,
        reduction: `${(((vertexCount - deduplicatedVertices.length) / vertexCount) * 100).toFixed(1)}%`
    };
    return { vertices: deduplicatedVertices, triangles: newTriangles, stats };
}
/**
 * Compute hash of geometry for deduplication detection
 * Uses a simple but effective hash based on vertex count and bounds
 */
export function hashGeometry(vertices, triangles) {
    const verticesFlat = vertices instanceof Float32Array
        ? vertices
        : verticesToTypedArray(vertices);
    const trianglesFlat = triangles instanceof Uint32Array
        ? triangles
        : trianglesToTypedArray(triangles);
    // Compute bounding box and other characteristics
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let sum = 0;
    for (let i = 0; i < verticesFlat.length; i += 3) {
        const x = verticesFlat[i];
        const y = verticesFlat[i + 1];
        const z = verticesFlat[i + 2];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
        sum += x + y + z;
    }
    // Create hash from geometry characteristics
    const vCount = verticesFlat.length / 3;
    const tCount = trianglesFlat.length / 3;
    return `v${vCount}t${tCount}_${minX.toFixed(3)},${minY.toFixed(3)},${minZ.toFixed(3)}_${maxX.toFixed(3)},${maxY.toFixed(3)},${maxZ.toFixed(3)}_${sum.toFixed(3)}`;
}
/**
 * Estimate memory usage of geometry
 */
export function estimateMemoryUsage(vertices, triangles) {
    const vCount = vertices instanceof Float32Array ? vertices.length / 3 : vertices.length;
    const tCount = triangles instanceof Uint32Array ? triangles.length / 3 : triangles.length;
    // JavaScript arrays have significant overhead (~200 bytes per vertex array, ~100 per triangle)
    const arrayOverhead = vertices instanceof Float32Array ? 0 : (vCount * 200 + tCount * 100);
    const currentBytes = vertices instanceof Float32Array
        ? vertices.byteLength + triangles.byteLength + arrayOverhead
        : vCount * 3 * 8 + tCount * 3 * 8 + arrayOverhead; // 8 bytes per number in JS
    const optimizedBytes = vCount * 3 * 4 + tCount * 3 * 4; // Float32 + Uint32
    return {
        vertices: {
            count: vCount,
            bytes: vertices instanceof Float32Array ? vertices.byteLength : vCount * 3 * 8 + vCount * 200,
            type: vertices instanceof Float32Array ? 'Float32Array' : 'Vec3[]'
        },
        triangles: {
            count: tCount,
            bytes: triangles instanceof Uint32Array ? triangles.byteLength : tCount * 3 * 8 + tCount * 100,
            type: triangles instanceof Uint32Array ? 'Uint32Array' : 'Triangle[]'
        },
        total: currentBytes,
        optimized: optimizedBytes,
        savings: `${(((currentBytes - optimizedBytes) / currentBytes) * 100).toFixed(1)}%`
    };
}
