export interface SceneJSON {
    unit?: 'millimeter' | 'inch' | 'micrometer' | 'micron' | 'centimeter' | 'foot' | 'meter';
    lang?: string;
    production?: boolean;
    metadata?: Record<string, string>;
    thumbnailPath?: string;
    basematerials?: Array<{
        name: string;
        displaycolor: string;
    }>;
    objects?: Array<{
        type: 'mesh';
        name?: string;
        vertices: Array<[number, number, number]>;
        triangles: Array<[number, number, number]>;
        materialIndex?: number;
        triangleMaterials?: Array<number>;
    } | {
        type: 'components';
        name?: string;
        components: Array<{
            objectIndex: number;
            transform?: [number, number, number, number, number, number, number, number, number, number, number, number];
            path?: string;
        }>;
    }>;
    build?: Array<{
        objectIndex: number;
        transform?: [number, number, number, number, number, number, number, number, number, number, number, number];
    }>;
    external?: Array<{
        path: string;
        name: string;
        vertices: Array<[number, number, number]>;
        triangles: Array<[number, number, number]>;
        materialIndex?: number;
        buildItem?: {
            transform?: [number, number, number, number, number, number, number, number, number, number, number, number];
        };
    }>;
}
export declare function validateSceneJSON(obj: unknown): {
    ok: boolean;
    errors?: string[];
};
