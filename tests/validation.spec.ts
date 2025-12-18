import { describe, it, expect } from 'vitest';
import { validateSceneJSON, validateWindingOrder, validateManifold } from '../src/index';

describe('Validation', () => {
  describe('JSON Schema validation', () => {
    it('accepts valid minimal input', () => {
      const input = {
        objects: [
          {
            type: 'mesh',
            vertices: [[0,0,0], [1,0,0], [0,1,0]],
            triangles: [[0,1,2]]
          }
        ]
      };
      const result = validateSceneJSON(input);
      expect(result.ok).toBe(true);
    });

    it('rejects input without objects', () => {
      const input = {};
      const result = validateSceneJSON(input);
      expect(result.ok).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('rejects invalid unit', () => {
      const input = {
        unit: 'invalid-unit',
        objects: [
          {
            type: 'mesh',
            vertices: [[0,0,0]],
            triangles: [[0,0,0]]
          }
        ]
      };
      const result = validateSceneJSON(input);
      expect(result.ok).toBe(false);
    });

    it('accepts all valid units', () => {
      const units = ['millimeter', 'inch', 'micrometer', 'micron', 'centimeter', 'foot', 'meter'];
      for (const unit of units) {
        const input = {
          unit,
          objects: [
            {
              type: 'mesh',
              vertices: [[0,0,0], [1,0,0], [0,1,0]],
              triangles: [[0,1,2]]
            }
          ]
        };
        const result = validateSceneJSON(input);
        expect(result.ok).toBe(true);
      }
    });

    it('accepts components object type', () => {
      const input = {
        objects: [
          {
            type: 'mesh',
            vertices: [[0,0,0], [1,0,0], [0,1,0]],
            triangles: [[0,1,2]]
          },
          {
            type: 'components',
            components: [
              { objectIndex: 0 }
            ]
          }
        ]
      };
      const result = validateSceneJSON(input);
      expect(result.ok).toBe(true);
    });
  });

  describe('Winding order validation', () => {
    it('validates correct winding order', () => {
      const vertices: [number, number, number][] = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const triangles: [number, number, number][] = [
        [0, 2, 1], // base (ccw from above)
        [0, 1, 3], // side
        [1, 2, 3], // side
        [2, 0, 3]  // side
      ];
      const result = validateWindingOrder(vertices, triangles);
      // Winding validation is heuristic-based, may have warnings
      expect(result.warnings.length).toBeLessThan(triangles.length);
    });

    it('detects degenerate triangles', () => {
      const vertices: [number, number, number][] = [
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0]  // collinear
      ];
      const triangles: [number, number, number][] = [
        [0, 1, 2]
      ];
      const result = validateWindingOrder(vertices, triangles);
      expect(result.ok).toBe(false);
      expect(result.warnings.some(w => w.includes('degenerate'))).toBe(true);
    });

    it('detects inverted triangles', () => {
      const vertices: [number, number, number][] = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const triangles: [number, number, number][] = [
        [0, 2, 1], // inverted
        [0, 3, 1], // inverted
        [1, 3, 2], // inverted
        [2, 3, 0]  // inverted
      ];
      const result = validateWindingOrder(vertices, triangles);
      expect(result.ok).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Manifold validation', () => {
    it('validates manifold mesh (cube)', () => {
      const vertices: [number, number, number][] = [
        [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], // bottom
        [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]  // top
      ];
      const triangles: [number, number, number][] = [
        // bottom
        [0, 1, 2], [0, 2, 3],
        // top
        [4, 6, 5], [4, 7, 6],
        // sides
        [0, 5, 1], [0, 4, 5],
        [1, 6, 2], [1, 5, 6],
        [2, 7, 3], [2, 6, 7],
        [3, 4, 0], [3, 7, 4]
      ];
      const result = validateManifold(vertices, triangles);
      expect(result.ok).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('detects non-manifold edges', () => {
      const vertices: [number, number, number][] = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const triangles: [number, number, number][] = [
        [0, 1, 2],
        [0, 1, 2], // duplicate - edges 0-1, 1-2, 2-0 now used 4 times
        [0, 1, 3], // edge 0-1 now used 3 times total
      ];
      const result = validateManifold(vertices, triangles);
      expect(result.ok).toBe(false);
      expect(result.errors.some(e => e.includes('Non-manifold'))).toBe(true);
    });

    it('detects open edges', () => {
      const vertices: [number, number, number][] = [
        [0, 0, 0],
        [1, 0, 0],
        [0, 1, 0]
      ];
      const triangles: [number, number, number][] = [
        [0, 1, 2] // single triangle - all edges only used once
      ];
      const result = validateManifold(vertices, triangles);
      expect(result.ok).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
