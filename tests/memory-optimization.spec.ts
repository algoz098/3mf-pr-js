import { describe, it, expect } from 'vitest';
import { Model } from '../src/model';
import { 
  deduplicateVertices, 
  hashGeometry, 
  estimateMemoryUsage,
  verticesToTypedArray,
  typedArrayToVertices,
  trianglesToTypedArray,
  typedArrayToTriangles
} from '../src/geometry-utils';
import type { Vec3, Triangle } from '../src/model';

describe('Memory Optimization', () => {
  describe('TypedArray Conversions', () => {
    it('converts Vec3[] to Float32Array and back', () => {
      const vertices: Vec3[] = [[0, 0, 0], [1, 2, 3], [4, 5, 6]];
      const typed = verticesToTypedArray(vertices);
      
      expect(typed).toBeInstanceOf(Float32Array);
      expect(typed.length).toBe(9);
      expect(typed[0]).toBe(0);
      expect(typed[3]).toBe(1);
      expect(typed[4]).toBe(2);
      
      const back = typedArrayToVertices(typed);
      expect(back).toEqual(vertices);
    });

    it('converts Triangle[] to Uint32Array and back', () => {
      const triangles: Triangle[] = [[0, 1, 2], [3, 4, 5]];
      const typed = trianglesToTypedArray(triangles);
      
      expect(typed).toBeInstanceOf(Uint32Array);
      expect(typed.length).toBe(6);
      expect(typed[0]).toBe(0);
      expect(typed[3]).toBe(3);
      
      const back = typedArrayToTriangles(typed);
      expect(back).toEqual(triangles);
    });
  });

  describe('Vertex Deduplication', () => {
    it('removes duplicate vertices and remaps triangles', () => {
      const vertices: Vec3[] = [
        [0, 0, 0], [1, 0, 0], [0, 1, 0],  // Triangle 1
        [0, 0, 0], [0, 1, 0], [0, 0, 1],  // Triangle 2 (shares 2 vertices)
      ];
      const triangles: Triangle[] = [[0, 1, 2], [3, 4, 5]];
      
      const result = deduplicateVertices(vertices, triangles);
      
      // Should deduplicate to 4 unique vertices
      expect(result.vertices.length).toBe(4);
      expect(result.triangles.length).toBe(2);
      
      // Check stats
      expect(result.stats.original).toBe(6);
      expect(result.stats.deduplicated).toBe(4);
      
      // Verify triangles are remapped correctly
      expect(result.triangles[0]).toEqual([0, 1, 2]);
      expect(result.triangles[1]).toEqual([0, 2, 3]);
    });

    it('works with TypedArrays', () => {
      const vertices = new Float32Array([
        0, 0, 0,  1, 0, 0,  0, 1, 0,  // Unique
        0, 0, 0,  1, 0, 0,             // Duplicates
      ]);
      const triangles = new Uint32Array([0, 1, 2, 3, 4, 2]);
      
      const result = deduplicateVertices(vertices, triangles);
      
      expect(result.vertices.length).toBe(3);
      expect(result.stats.reduction).not.toBe('0.0%');
    });

    it('handles meshes with no duplicates', () => {
      const vertices: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const triangles: Triangle[] = [[0, 1, 2]];
      
      const result = deduplicateVertices(vertices, triangles);
      
      expect(result.vertices.length).toBe(3);
      expect(result.stats.reduction).toBe('0.0%');
    });
  });

  describe('Geometry Hashing', () => {
    it('generates consistent hash for same geometry', () => {
      const vertices: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const triangles: Triangle[] = [[0, 1, 2]];
      
      const hash1 = hashGeometry(vertices, triangles);
      const hash2 = hashGeometry(vertices, triangles);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toContain('v3t1');
    });

    it('generates different hash for different geometry', () => {
      const vertices1: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const vertices2: Vec3[] = [[0, 0, 0], [2, 0, 0], [0, 2, 0]];
      const triangles: Triangle[] = [[0, 1, 2]];
      
      const hash1 = hashGeometry(vertices1, triangles);
      const hash2 = hashGeometry(vertices2, triangles);
      
      expect(hash1).not.toBe(hash2);
    });

    it('works with TypedArrays', () => {
      const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      const triangles = new Uint32Array([0, 1, 2]);
      
      const hash = hashGeometry(vertices, triangles);
      expect(hash).toContain('v3t1');
    });
  });

  describe('Memory Usage Estimation', () => {
    it('estimates memory for standard arrays', () => {
      const vertices: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const triangles: Triangle[] = [[0, 1, 2]];
      
      const usage = estimateMemoryUsage(vertices, triangles);
      
      expect(usage.vertices.count).toBe(3);
      expect(usage.vertices.type).toBe('Vec3[]');
      expect(usage.triangles.count).toBe(1);
      expect(usage.triangles.type).toBe('Triangle[]');
      expect(usage.total).toBeGreaterThan(usage.optimized);
    });

    it('estimates memory for TypedArrays', () => {
      const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      const triangles = new Uint32Array([0, 1, 2]);
      
      const usage = estimateMemoryUsage(vertices, triangles);
      
      expect(usage.vertices.type).toBe('Float32Array');
      expect(usage.triangles.type).toBe('Uint32Array');
      expect(usage.total).toBe(usage.optimized);
    });

    it('shows significant savings for standard arrays', () => {
      const vertices: Vec3[] = Array(1000).fill(null).map((_, i) => [i, i, i]);
      const triangles: Triangle[] = Array(1000).fill(null).map((_, i) => [i, i + 1, i + 2]);
      
      const usage = estimateMemoryUsage(vertices, triangles);
      
      expect(parseInt(usage.savings)).toBeGreaterThan(50);
    });
  });

  describe('Model.addMeshOptimized', () => {
    it('adds mesh with deduplication', () => {
      const model = new Model();
      const vertices: Vec3[] = [
        [0, 0, 0], [1, 0, 0], [0, 1, 0],
        [0, 0, 0], [0, 1, 0], [0, 0, 1], // duplicates
      ];
      const triangles: Triangle[] = [[0, 1, 2], [3, 4, 5]];
      
      const id = model.addMeshOptimized(vertices, triangles, {
        name: 'Test',
        deduplicate: true,
      });
      
      expect(id).toBeGreaterThan(0);
    });

    it('reuses geometry with reuseGeometry flag', () => {
      const model = new Model();
      const vertices: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const triangles: Triangle[] = [[0, 1, 2]];
      
      const id1 = model.addMeshOptimized(vertices, triangles, {
        name: 'First',
        reuseGeometry: true,
      });
      
      const id2 = model.addMeshOptimized(vertices, triangles, {
        name: 'Second',
        reuseGeometry: true,
      });
      
      // Should return same ID since geometry is identical
      expect(id1).toBe(id2);
      
      const stats = model.getGeometryPoolStats();
      expect(stats.poolSize).toBe(1);
      expect(stats.totalRefs).toBe(2);
    });

    it('works with TypedArrays', () => {
      const model = new Model();
      const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      const triangles = new Uint32Array([0, 1, 2]);
      
      const id = model.addMeshOptimized(vertices, triangles, {
        name: 'Typed',
      });
      
      expect(id).toBeGreaterThan(0);
    });

    it('combines deduplication and reuse', () => {
      const model = new Model();
      const vertices: Vec3[] = [
        [0, 0, 0], [1, 0, 0], [0, 1, 0],
        [0, 0, 0], [1, 0, 0], [0, 1, 0], // full duplicates
      ];
      const triangles: Triangle[] = [[0, 1, 2], [3, 4, 5]];
      
      const id1 = model.addMeshOptimized(vertices, triangles, {
        deduplicate: true,
        reuseGeometry: true,
      });
      
      const id2 = model.addMeshOptimized(vertices, triangles, {
        deduplicate: true,
        reuseGeometry: true,
      });
      
      expect(id1).toBe(id2);
    });
  });

  describe('Geometry Pool Management', () => {
    it('tracks pool statistics', () => {
      const model = new Model();
      const v1: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const v2: Vec3[] = [[0, 0, 0], [2, 0, 0], [0, 2, 0]];
      const t: Triangle[] = [[0, 1, 2]];
      
      model.addMeshOptimized(v1, t, { reuseGeometry: true });
      model.addMeshOptimized(v1, t, { reuseGeometry: true });
      model.addMeshOptimized(v2, t, { reuseGeometry: true });
      
      const stats = model.getGeometryPoolStats();
      expect(stats.poolSize).toBe(2); // 2 unique geometries
      expect(stats.totalRefs).toBe(3); // 3 references total
      expect(stats.avgRefsPerGeometry).toBe(1.5);
    });

    it('clears geometry pool', () => {
      const model = new Model();
      const vertices: Vec3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
      const triangles: Triangle[] = [[0, 1, 2]];
      
      model.addMeshOptimized(vertices, triangles, { reuseGeometry: true });
      
      expect(model.getGeometryPoolStats().poolSize).toBe(1);
      
      model.clearGeometryPool();
      
      expect(model.getGeometryPoolStats().poolSize).toBe(0);
    });
  });

  describe('Integration: Full Workflow', () => {
    it('generates 3MF with optimized meshes', async () => {
      const model = new Model();
      model.setTitle('Optimized Model');
      
      const material = model.addBaseMaterial('PLA', '#FF0000FF');
      
      // Large mesh with duplicates
      const vertices: Vec3[] = [];
      const triangles: Triangle[] = [];
      
      // Create a grid with intentional duplicates
      for (let i = 0; i < 10; i++) {
        vertices.push([i, 0, 0], [i + 1, 0, 0], [i, 1, 0]);
        triangles.push([i * 3, i * 3 + 1, i * 3 + 2]);
      }
      
      model.addMeshOptimized(vertices, triangles, {
        name: 'Optimized Mesh',
        material,
        deduplicate: true,
      });
      
      const buffer = await model.to3MF();
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
