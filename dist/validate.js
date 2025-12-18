import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true });
const schema = {
    type: 'object',
    properties: {
        unit: { type: 'string', nullable: true, enum: ['millimeter', 'inch', 'micrometer', 'micron', 'centimeter', 'foot', 'meter'] },
        lang: { type: 'string', nullable: true },
        production: { type: 'boolean', nullable: true },
        metadata: { type: 'object', additionalProperties: { type: 'string' }, nullable: true },
        thumbnailPath: { type: 'string', nullable: true },
        basematerials: {
            type: 'array', nullable: true,
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    displaycolor: { type: 'string' }
                },
                required: ['name', 'displaycolor'],
                additionalProperties: false
            }
        },
        objects: {
            type: 'array', nullable: true,
            items: {
                type: 'object',
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            type: { const: 'mesh' },
                            name: { type: 'string', nullable: true },
                            vertices: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 } },
                            triangles: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 } },
                            materialIndex: { type: 'integer', nullable: true, minimum: 0 },
                            triangleMaterials: { type: 'array', items: { type: 'integer', minimum: 0 }, nullable: true }
                        },
                        required: ['type', 'vertices', 'triangles'],
                        additionalProperties: false
                    },
                    {
                        type: 'object',
                        properties: {
                            type: { const: 'components' },
                            name: { type: 'string', nullable: true },
                            components: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        objectIndex: { type: 'integer', minimum: 0 },
                                        transform: { type: 'array', items: { type: 'number' }, minItems: 12, maxItems: 12, nullable: true },
                                        path: { type: 'string', nullable: true }
                                    },
                                    required: ['objectIndex'],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ['type', 'components'],
                        additionalProperties: false
                    }
                ]
            }
        },
        build: {
            type: 'array', nullable: true,
            items: {
                type: 'object',
                properties: {
                    objectIndex: { type: 'integer', minimum: 0 },
                    transform: { type: 'array', items: { type: 'number' }, minItems: 12, maxItems: 12, nullable: true }
                },
                required: ['objectIndex'],
                additionalProperties: false
            }
        },
        external: {
            type: 'array', nullable: true,
            items: {
                type: 'object',
                properties: {
                    path: { type: 'string' },
                    name: { type: 'string' },
                    vertices: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 } },
                    triangles: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 } },
                    materialIndex: { type: 'integer', nullable: true, minimum: 0 },
                    buildItem: {
                        type: 'object', nullable: true,
                        properties: {
                            transform: { type: 'array', items: { type: 'number' }, minItems: 12, maxItems: 12, nullable: true }
                        },
                        additionalProperties: false
                    }
                },
                required: ['path', 'name', 'vertices', 'triangles'],
                additionalProperties: false
            }
        }
    },
    required: ['objects'],
    additionalProperties: false
};
const validateFn = ajv.compile(schema);
export function validateSceneJSON(obj) {
    const ok = validateFn(obj);
    if (ok)
        return { ok: true };
    const errors = (validateFn.errors || []).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
    return { ok: false, errors };
}
