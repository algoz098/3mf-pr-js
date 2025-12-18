export type Vec3 = [number, number, number];
export type Triangle = [number, number, number];
export type Transform = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];
export type Vec3Input = Vec3[] | Float32Array;
export type TriangleInput = Triangle[] | Uint32Array;
export declare class Model {
    private unit;
    private lang;
    private useProduction;
    private metadata;
    private nextResourceId;
    private baseMaterials;
    private colorGroups;
    private textures;
    private textureGroups;
    private compositeMaterials;
    private multiMaterials;
    private objects;
    private buildItems;
    private thumbnail?;
    private thumbnailExt;
    private thumbnailDir;
    private externalModels;
    private objectThumbnails;
    private extraContentTypes;
    private preserveParts;
    private geometryPool;
    setUnit(unit: Model['unit']): void;
    setLanguage(lang: string): void;
    enableProduction(enable?: boolean): void;
    addMetadata(name: string, value: string): void;
    setTitle(title: string): void;
    setDesigner(designer: string): void;
    setAuthor(author: string): void;
    setApplication(app: string): void;
    setCreationDate(isoDate: string): void;
    setModificationDate(isoDate: string): void;
    setDescription(desc: string): void;
    /**
     * Create a new basematerials set with a specific ID.
     * Returns the set ID.
     */
    createBaseMaterialsSet(id?: number): number;
    /**
     * Add a base material to a specific set (or auto-assign a set).
     * Returns pid/pindex mapping to apply to objects.
     */
    addBaseMaterial(name: string, displaycolor: string, setId?: number): {
        pid: number;
        pindex: number;
    };
    /** Materials Extension: create a color group. Returns the group id. */
    createColorGroup(id?: number): number;
    /** Materials/Textures: add a Texture2D resource (PNG/JPEG). Returns the texture id. */
    addTexture(data: Uint8Array, ext?: 'png' | 'jpg' | 'jpeg', id?: number): number;
    /** Materials/Textures: create a Texture2DGroup linked to a texture id. Returns group id. */
    createTextureGroup(texid: number, opts?: {
        tilestyleu?: 'wrap' | 'mirror' | 'clamp';
        tilestylev?: 'wrap' | 'mirror' | 'clamp';
        filter?: 'auto' | 'nearest' | 'linear';
    }, id?: number): number;
    /** Materials/Textures: add UV coordinate to a Texture2DGroup. Returns coordinate index. */
    addTexCoord(groupId: number, u: number, v: number): number;
    /** Materials/Property: create a CompositeMaterials resource bound to a basematerials pid. */
    createCompositeMaterials(pid: number, id?: number): number;
    /** Materials/Property: add a composite vector of weights (sum ~ 1.0). Returns index. */
    addComposite(compId: number, values: number[]): number;
    /** Materials/Property: create a MultiMaterials resource bound to a list of property resource ids (pids). */
    createMultiMaterials(pids: number[], id?: number): number;
    /** Materials/Property: add a multi-material entry mapping indices per pid in the MultiMaterials. Returns index. */
    addMultiMaterial(mmId: number, pindices: number[]): number;
    /** Materials Extension: add a color to a color group. Returns pid/pindex mapping. */
    addColorToGroup(value: string, name?: string, groupId?: number): {
        pid: number;
        pindex: number;
    };
    addMesh(vertices: Vec3[], triangles: Triangle[], opts?: {
        name?: string;
        material?: {
            pid: number;
            pindex: number;
        };
    }): number;
    /**
     * Add mesh with memory optimizations:
     * - Automatic vertex deduplication
     * - Geometry pooling to reuse identical meshes
     * - Support for TypedArrays (Float32Array/Uint32Array)
     *
     * @param vertices - Vertices as Vec3[] or Float32Array
     * @param triangles - Triangles as Triangle[] or Uint32Array
     * @param opts - Options including deduplicate and reuseGeometry flags
     * @returns Object ID
     */
    addMeshOptimized(vertices: Vec3Input, triangles: TriangleInput, opts?: {
        name?: string;
        material?: {
            pid: number;
            pindex: number;
        };
        deduplicate?: boolean;
        reuseGeometry?: boolean;
    }): number;
    /**
     * Get statistics about geometry pool usage
     */
    getGeometryPoolStats(): {
        poolSize: number;
        totalRefs: number;
        avgRefsPerGeometry: number;
    };
    /**
     * Clear the geometry pool (useful for batch processing)
     */
    clearGeometryPool(): void;
    addComponentObject(name: string, components: {
        objectid: number;
        transform?: Transform;
        path?: string;
    }[]): number;
    setTriangleMaterials(objectid: number, assignments: Array<{
        index: number;
        pid?: number;
        p1?: number;
        p2?: number;
        p3?: number;
    }>): void;
    /** Triangle Sets extension: create a triangle set for a mesh object. Returns the set index. */
    addTriangleSet(objectid: number, name: string, identifier: string): number;
    /** Triangle Sets extension: add references to a triangle set. */
    addTriangleSetRefs(objectid: number, setIndex: number, refs: Array<number | {
        startindex: number;
        endindex: number;
    }>): void;
    addBuildItem(objectid: number, transform?: Transform, opts?: {
        partnumber?: string;
    }): void;
    /**
     * Clear all build items. Useful when you want to specify custom build items
     * without the default ones added by addMesh/addComponentObject.
     */
    clearBuildItems(): void;
    setThumbnail(data: Uint8Array, ext?: 'png' | 'jpg', dir?: 'Thumbnails' | 'Metadata'): void;
    /** Set per-object thumbnail. Writes under provided directory; updates object attribute and relationships. */
    setObjectThumbnail(objectid: number, data: Uint8Array, ext?: 'png' | 'jpg', dir?: 'Thumbnails' | 'Metadata'): void;
    /** Set object partnumber attribute */
    setObjectPartNumber(objectid: number, partnumber: string): void;
    /** Add a custom part and MustPreserve relationship from package root */
    addPreservePart(path: string, data: Uint8Array | string, contentType?: string): void;
    /**
     * Create an external model part with a single mesh object.
     * Returns the external object reference to be used with addExternalBuildItem.
     */
    addExternalMesh(path: string, name: string, vertices: Vec3[], triangles: Triangle[], opts?: {
        material?: {
            pid: number;
            pindex: number;
        };
    }): {
        path: string;
        objectid: number;
    };
    addExternalBuildItem(objectid: number, path: string, transform?: Transform): void;
    private buildModelXml;
    private buildContentTypesXml;
    private buildRootRelsXml;
    private buildModelRelsXml;
    to3MF(): Promise<Buffer>;
    writeToFile(path: string): Promise<void>;
}
