import JSZip from 'jszip';
import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import { hashGeometry, deduplicateVertices } from './geometry-utils.js';
export class Model {
    constructor() {
        this.unit = 'millimeter';
        this.lang = 'en-US';
        this.useProduction = false;
        this.metadata = [];
        this.nextResourceId = 1; // Global resource ID counter
        this.baseMaterials = [];
        this.colorGroups = [];
        this.textures = [];
        this.textureGroups = [];
        this.compositeMaterials = [];
        this.multiMaterials = [];
        this.objects = [];
        this.buildItems = [];
        this.thumbnailExt = 'png';
        this.thumbnailDir = 'Thumbnails';
        this.externalModels = [];
        this.objectThumbnails = new Map();
        this.extraContentTypes = new Map(); // ext -> contentType
        this.preserveParts = [];
        this.geometryPool = new Map();
    }
    setUnit(unit) {
        // Normalize to spec-preferred value
        this.unit = unit === 'micrometer' ? 'micron' : unit;
    }
    setLanguage(lang) {
        this.lang = lang;
    }
    enableProduction(enable = true) {
        this.useProduction = enable;
    }
    addMetadata(name, value) {
        this.metadata.push({ name, value });
    }
    // Metadata helpers (well-known names per 3MF spec)
    setTitle(title) { this.addMetadata('Title', title); }
    setDesigner(designer) { this.addMetadata('Designer', designer); }
    setAuthor(author) { this.addMetadata('Author', author); }
    setApplication(app) { this.addMetadata('Application', app); }
    setCreationDate(isoDate) { this.addMetadata('CreationDate', isoDate); }
    setModificationDate(isoDate) { this.addMetadata('ModificationDate', isoDate); }
    setDescription(desc) { this.addMetadata('Description', desc); }
    /**
     * Create a new basematerials set with a specific ID.
     * Returns the set ID.
     */
    createBaseMaterialsSet(id) {
        const setId = id ?? this.nextResourceId++;
        if (this.baseMaterials.some(s => s.id === setId)) {
            throw new Error(`BaseMaterials set with id ${setId} already exists`);
            // Ensure nextResourceId is ahead of manual IDs
            if (setId >= this.nextResourceId) {
                this.nextResourceId = setId + 1;
            }
        }
        this.baseMaterials.push({ id: setId, bases: [] });
        return setId;
    }
    /**
     * Add a base material to a specific set (or auto-assign a set).
     * Returns pid/pindex mapping to apply to objects.
     */
    addBaseMaterial(name, displaycolor, setId) {
        if (!/^#([0-9a-fA-F]{8})$/.test(displaycolor)) {
            throw new Error('displaycolor must be in #RRGGBBAA format');
        }
        // If no setId provided, use the first existing set or create a new one
        if (setId === undefined) {
            const firstSet = this.baseMaterials[0];
            setId = firstSet ? firstSet.id : this.createBaseMaterialsSet();
        }
        // Find or create the set
        let set = this.baseMaterials.find(s => s.id === setId);
        if (!set) {
            // Create the set properly using createBaseMaterialsSet
            this.createBaseMaterialsSet(setId);
            set = this.baseMaterials.find(s => s.id === setId);
        }
        set.bases.push({ name, displaycolor });
        const pid = set.id;
        const pindex = set.bases.length - 1;
        return { pid, pindex };
    }
    /** Materials Extension: create a color group. Returns the group id. */
    createColorGroup(id) {
        const groupId = id ?? this.nextResourceId++;
        if (this.colorGroups.some(g => g.id === groupId)) {
            throw new Error(`ColorGroup with id ${groupId} already exists`);
        }
        this.colorGroups.push({ id: groupId, colors: [] });
        return groupId;
    }
    /** Materials/Textures: add a Texture2D resource (PNG/JPEG). Returns the texture id. */
    addTexture(data, ext = 'png', id) {
        const texId = id ?? this.nextResourceId++;
        const normalizedExt = ext === 'jpeg' ? 'jpg' : ext;
        const contentType = normalizedExt === 'png' ? 'image/png' : 'image/jpeg';
        const path = `/3D/Textures/texture-${texId}.${normalizedExt}`;
        if (this.textures.some(t => t.id === texId)) {
            throw new Error(`Texture2D with id ${texId} already exists`);
        }
        this.textures.push({ id: texId, path, contentType, data });
        return texId;
    }
    /** Materials/Textures: create a Texture2DGroup linked to a texture id. Returns group id. */
    createTextureGroup(texid, opts, id) {
        if (!this.textures.find(t => t.id === texid)) {
            throw new Error(`Texture id ${texid} not found`);
        }
        const groupId = id ?? this.nextResourceId++;
        if (this.textureGroups.some(g => g.id === groupId)) {
            throw new Error(`Texture2DGroup with id ${groupId} already exists`);
        }
        this.textureGroups.push({ id: groupId, texid, coords: [], tilestyleu: opts?.tilestyleu, tilestylev: opts?.tilestylev, filter: opts?.filter });
        return groupId;
    }
    /** Materials/Textures: add UV coordinate to a Texture2DGroup. Returns coordinate index. */
    addTexCoord(groupId, u, v) {
        const g = this.textureGroups.find(gr => gr.id === groupId);
        if (!g)
            throw new Error(`Texture2DGroup ${groupId} not found`);
        if (!Number.isFinite(u) || !Number.isFinite(v))
            throw new Error('u/v must be finite numbers');
        g.coords.push({ u, v });
        return g.coords.length - 1;
    }
    /** Materials/Property: create a CompositeMaterials resource bound to a basematerials pid. */
    createCompositeMaterials(pid, id) {
        if (!this.baseMaterials.find(b => b.id === pid)) {
            throw new Error(`BaseMaterials pid ${pid} not found`);
        }
        const compId = id ?? this.nextResourceId++;
        if (this.compositeMaterials.some(c => c.id === compId)) {
            throw new Error(`CompositeMaterials with id ${compId} already exists`);
        }
        this.compositeMaterials.push({ id: compId, pid, composites: [] });
        return compId;
    }
    /** Materials/Property: add a composite vector of weights (sum ~ 1.0). Returns index. */
    addComposite(compId, values) {
        const cm = this.compositeMaterials.find(c => c.id === compId);
        if (!cm)
            throw new Error(`CompositeMaterials ${compId} not found`);
        if (!Array.isArray(values) || values.length === 0)
            throw new Error('Composite values must be a non-empty array');
        let sum = 0;
        for (const v of values) {
            if (!Number.isFinite(v) || v < 0)
                throw new Error('Composite values must be finite non-negative numbers');
            sum += v;
        }
        // Allow small tolerance around 1.0
        if (Math.abs(sum - 1.0) > 1e-6)
            throw new Error('Composite values must sum to 1.0');
        cm.composites.push({ values });
        return cm.composites.length - 1;
    }
    /** Materials/Property: create a MultiMaterials resource bound to a list of property resource ids (pids). */
    createMultiMaterials(pids, id) {
        if (!Array.isArray(pids) || pids.length < 2)
            throw new Error('MultiMaterials requires at least two pids');
        for (const pid of pids) {
            const isValid = this.baseMaterials.some(b => b.id === pid) || this.colorGroups.some(g => g.id === pid) || this.textureGroups.some(tg => tg.id === pid) || this.compositeMaterials.some(cm => cm.id === pid);
            if (!isValid)
                throw new Error(`Property resource pid ${pid} not found`);
        }
        const mmId = id ?? this.nextResourceId++;
        if (this.multiMaterials.some(m => m.id === mmId))
            throw new Error(`MultiMaterials with id ${mmId} already exists`);
        this.multiMaterials.push({ id: mmId, pids, entries: [] });
        return mmId;
    }
    /** Materials/Property: add a multi-material entry mapping indices per pid in the MultiMaterials. Returns index. */
    addMultiMaterial(mmId, pindices) {
        const mm = this.multiMaterials.find(m => m.id === mmId);
        if (!mm)
            throw new Error(`MultiMaterials ${mmId} not found`);
        if (!Array.isArray(pindices) || pindices.length !== mm.pids.length)
            throw new Error('pindices length must match number of pids');
        for (let i = 0; i < pindices.length; i++) {
            const pid = mm.pids[i];
            // Validate index exists within resource
            if (this.baseMaterials.some(b => b.id === pid)) {
                const set = this.baseMaterials.find(b => b.id === pid);
                if (pindices[i] < 0 || pindices[i] >= set.bases.length)
                    throw new Error(`pindex ${pindices[i]} out of range for basematerials pid ${pid}`);
            }
            if (this.colorGroups.some(g => g.id === pid)) {
                const group = this.colorGroups.find(g => g.id === pid);
                if (pindices[i] < 0 || pindices[i] >= group.colors.length)
                    throw new Error(`pindex ${pindices[i]} out of range for colorgroup pid ${pid}`);
            }
            if (this.textureGroups.some(tg => tg.id === pid)) {
                const tg = this.textureGroups.find(t => t.id === pid);
                if (pindices[i] < 0 || pindices[i] >= tg.coords.length)
                    throw new Error(`pindex ${pindices[i]} out of range for texture2dgroup pid ${pid}`);
            }
            if (this.compositeMaterials.some(cm => cm.id === pid)) {
                const cm = this.compositeMaterials.find(c => c.id === pid);
                if (pindices[i] < 0 || pindices[i] >= cm.composites.length)
                    throw new Error(`pindex ${pindices[i]} out of range for compositematerials pid ${pid}`);
            }
        }
        mm.entries.push({ pindices });
        return mm.entries.length - 1;
    }
    /** Materials Extension: add a color to a color group. Returns pid/pindex mapping. */
    addColorToGroup(value, name, groupId) {
        if (!/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) {
            throw new Error('color value must be #RRGGBB or #RRGGBBAA');
        }
        if (groupId === undefined) {
            const first = this.colorGroups[0];
            groupId = first ? first.id : this.createColorGroup();
        }
        let group = this.colorGroups.find(g => g.id === groupId);
        if (!group) {
            this.createColorGroup(groupId);
            group = this.colorGroups.find(g => g.id === groupId);
        }
        group.colors.push({ name, value });
        const pid = group.id;
        const pindex = group.colors.length - 1;
        return { pid, pindex };
    }
    addMesh(vertices, triangles, opts) {
        if (vertices.length === 0)
            throw new Error('vertices must not be empty');
        if (triangles.length === 0)
            throw new Error('triangles must not be empty');
        // Basic numeric validation
        for (const v of vertices) {
            for (const c of v) {
                if (!Number.isFinite(c))
                    throw new Error('vertex coordinates must be finite numbers');
            }
        }
        const vCount = vertices.length;
        for (const t of triangles) {
            for (const idx of t) {
                if (!Number.isInteger(idx))
                    throw new Error('triangle indices must be integers');
                if (idx < 0 || idx >= vCount)
                    throw new Error(`triangle index out of range: ${idx}`);
            }
        }
        const id = this.nextResourceId++;
        const uuid = this.useProduction ? uuidv4() : undefined;
        const obj = {
            id,
            type: 'model',
            name: opts?.name,
            mesh: { vertices, triangles },
            pid: opts?.material?.pid,
            pindex: opts?.material?.pindex,
            uuid,
            triangleMaterials: new Map(),
        };
        this.objects.push(obj);
        // default build item (identity)
        this.addBuildItem(id);
        return id;
    }
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
    addMeshOptimized(vertices, triangles, opts) {
        // Convert TypedArrays to Vec3[]/Triangle[] for internal processing
        let verts = vertices instanceof Float32Array
            ? Array.from({ length: vertices.length / 3 }, (_, i) => [
                vertices[i * 3],
                vertices[i * 3 + 1],
                vertices[i * 3 + 2],
            ])
            : vertices;
        let tris = triangles instanceof Uint32Array
            ? Array.from({ length: triangles.length / 3 }, (_, i) => [
                triangles[i * 3],
                triangles[i * 3 + 1],
                triangles[i * 3 + 2],
            ])
            : triangles;
        // Deduplicate vertices if requested
        if (opts?.deduplicate) {
            const deduped = deduplicateVertices(verts, tris);
            verts = deduped.vertices;
            tris = deduped.triangles;
            // Optional: log stats
            if (deduped.stats.reduction !== '0.0%') {
                console.log(`[3mf-pr-js] Deduplicated vertices: ${deduped.stats.original} → ${deduped.stats.deduplicated} (${deduped.stats.reduction} reduction)`);
            }
        }
        // Check geometry pool for reuse
        if (opts?.reuseGeometry) {
            const hash = hashGeometry(verts, tris);
            const pooled = this.geometryPool.get(hash);
            if (pooled) {
                pooled.refCount++;
                console.log(`[3mf-pr-js] Reusing geometry from pool: object ${pooled.id} (ref count: ${pooled.refCount})`);
                return pooled.id;
            }
            // Add new geometry to pool
            const id = this.addMesh(verts, tris, opts);
            this.geometryPool.set(hash, { id, refCount: 1, hash });
            return id;
        }
        // Standard addMesh without pooling
        return this.addMesh(verts, tris, opts);
    }
    /**
     * Get statistics about geometry pool usage
     */
    getGeometryPoolStats() {
        let totalRefs = 0;
        for (const entry of this.geometryPool.values()) {
            totalRefs += entry.refCount;
        }
        return {
            poolSize: this.geometryPool.size,
            totalRefs,
            avgRefsPerGeometry: this.geometryPool.size > 0 ? totalRefs / this.geometryPool.size : 0,
        };
    }
    /**
     * Clear the geometry pool (useful for batch processing)
     */
    clearGeometryPool() {
        this.geometryPool.clear();
    }
    addComponentObject(name, components) {
        const id = this.nextResourceId++;
        const uuid = this.useProduction ? uuidv4() : undefined;
        const compRefs = components.map((c) => ({
            objectid: c.objectid,
            transform: c.transform,
            uuid: this.useProduction ? uuidv4() : undefined,
            path: c.path,
        }));
        const obj = {
            id,
            type: 'model',
            name,
            components: compRefs,
            uuid,
        };
        this.objects.push(obj);
        this.addBuildItem(id);
        return id;
    }
    setTriangleMaterials(objectid, assignments) {
        const obj = this.objects.find(o => 'mesh' in o && o.id === objectid);
        if (!obj)
            throw new Error(`Object ${objectid} not found or not a mesh object`);
        if (!obj.triangleMaterials)
            obj.triangleMaterials = new Map();
        for (const a of assignments) {
            if (a.index < 0 || a.index >= obj.mesh.triangles.length)
                throw new Error(`Triangle index out of range: ${a.index}`);
            obj.triangleMaterials.set(a.index, { pid: a.pid, p1: a.p1, p2: a.p2, p3: a.p3 });
        }
    }
    /** Triangle Sets extension: create a triangle set for a mesh object. Returns the set index. */
    addTriangleSet(objectid, name, identifier) {
        const obj = this.objects.find(o => 'mesh' in o && o.id === objectid);
        if (!obj)
            throw new Error(`Object ${objectid} not found or not a mesh object`);
        if (!name)
            throw new Error('Triangle set name must not be empty');
        if (!identifier)
            throw new Error('Triangle set identifier must not be empty');
        if (!obj.triangleSets)
            obj.triangleSets = [];
        obj.triangleSets.push({ name, identifier, refs: [] });
        return obj.triangleSets.length - 1;
    }
    /** Triangle Sets extension: add references to a triangle set. */
    addTriangleSetRefs(objectid, setIndex, refs) {
        const obj = this.objects.find(o => 'mesh' in o && o.id === objectid);
        if (!obj || !obj.triangleSets || !obj.triangleSets[setIndex])
            throw new Error(`Triangle set ${setIndex} not found in object ${objectid}`);
        const set = obj.triangleSets[setIndex];
        for (const r of refs) {
            if (typeof r === 'number') {
                if (!Number.isInteger(r) || r < 0 || r >= obj.mesh.triangles.length)
                    throw new Error(`Triangle ref index out of range: ${r}`);
                set.refs.push(r);
            }
            else {
                const { startindex, endindex } = r;
                if (!Number.isInteger(startindex) || !Number.isInteger(endindex))
                    throw new Error('startindex/endindex must be integers');
                if (startindex < 0 || endindex < 0 || startindex >= obj.mesh.triangles.length || endindex >= obj.mesh.triangles.length) {
                    throw new Error('Triangle refrange indices out of range');
                }
                if (endindex < startindex)
                    throw new Error('endindex must be >= startindex');
                set.refs.push({ startindex, endindex });
            }
        }
    }
    addBuildItem(objectid, transform, opts) {
        const uuid = this.useProduction ? uuidv4() : undefined;
        this.buildItems.push({ objectid, transform, uuid, partnumber: opts?.partnumber });
    }
    /**
     * Clear all build items. Useful when you want to specify custom build items
     * without the default ones added by addMesh/addComponentObject.
     */
    clearBuildItems() {
        this.buildItems = [];
    }
    setThumbnail(data, ext = 'png', dir = 'Thumbnails') {
        this.thumbnail = data;
        this.thumbnailExt = ext;
        this.thumbnailDir = dir;
    }
    /** Set per-object thumbnail. Writes under provided directory; updates object attribute and relationships. */
    setObjectThumbnail(objectid, data, ext = 'png', dir = 'Metadata') {
        const obj = this.objects.find(o => o.id === objectid);
        if (!obj)
            throw new Error(`Object ${objectid} not found`);
        const path = `/${dir}/object-${objectid}.${ext}`;
        if ('mesh' in obj) {
            obj.thumbnailPath = path;
        }
        else {
            obj.thumbnailPath = path;
        }
        this.objectThumbnails.set(objectid, { data, ext, path });
    }
    /** Set object partnumber attribute */
    setObjectPartNumber(objectid, partnumber) {
        const obj = this.objects.find(o => o.id === objectid);
        if (!obj)
            throw new Error(`Object ${objectid} not found`);
        if ('mesh' in obj)
            obj.partnumber = partnumber;
        else
            obj.partnumber = partnumber;
    }
    /** Add a custom part and MustPreserve relationship from package root */
    addPreservePart(path, data, contentType) {
        if (!path.startsWith('/'))
            throw new Error('Preserve part path must start with "/"');
        const extMatch = path.match(/\.([A-Za-z0-9]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : undefined;
        let ct = contentType;
        if (!ct) {
            if (ext === 'txt')
                ct = 'text/plain';
            else if (ext === 'json')
                ct = 'application/json';
            else {
                throw new Error('contentType required for custom part with unknown extension');
            }
        }
        if (ext)
            this.extraContentTypes.set(ext, ct);
        const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        this.preserveParts.push({ path, data: bytes, contentType: ct });
    }
    /**
     * Create an external model part with a single mesh object.
     * Returns the external object reference to be used with addExternalBuildItem.
     */
    addExternalMesh(path, name, vertices, triangles, opts) {
        if (!path.startsWith('3D/'))
            throw new Error('External model path must start with "3D/"');
        const uuid = this.useProduction ? uuidv4() : undefined;
        const ext = this.externalModels.find(e => e.path === path);
        let model = ext;
        if (!model) {
            model = { path, metadata: [], baseMaterials: [], objects: [] };
            this.externalModels.push(model);
        }
        // Synchronize basematerials from root to external model
        if (opts?.material) {
            const rootSet = this.baseMaterials.find(s => s.id === opts.material.pid);
            if (rootSet) {
                // Find or create matching set in external model
                let extSet = model.baseMaterials.find(s => s.id === opts.material.pid);
                if (!extSet) {
                    extSet = { id: opts.material.pid, bases: [] };
                    model.baseMaterials.push(extSet);
                }
                // Ensure the specific material index exists in external set
                const rootBase = rootSet.bases[opts.material.pindex];
                if (rootBase) {
                    // Fill gaps if needed (sparse array)
                    while (extSet.bases.length <= opts.material.pindex) {
                        extSet.bases.push({ name: '', displaycolor: '#000000FF' });
                    }
                    // Copy material from root if not already present
                    if (!extSet.bases[opts.material.pindex]?.name) {
                        extSet.bases[opts.material.pindex] = {
                            name: rootBase.name,
                            displaycolor: rootBase.displaycolor
                        };
                    }
                }
            }
        }
        const id = model.objects.length + 1;
        const obj = {
            id,
            type: 'model',
            name,
            mesh: { vertices, triangles },
            pid: opts?.material?.pid,
            pindex: opts?.material?.pindex,
            uuid,
        };
        model.objects.push(obj);
        return { path, objectid: id };
    }
    addExternalBuildItem(objectid, path, transform) {
        if (!this.useProduction)
            throw new Error('External build items require Production extension');
        const uuid = uuidv4();
        this.buildItems.push({ objectid, transform, uuid, path: `/${path}` });
    }
    buildModelXml() {
        const rootAttrs = {
            xmlns: 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02',
            'xml:lang': this.lang,
            unit: this.unit,
        };
        if (this.useProduction) {
            rootAttrs['xmlns:p'] = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';
            rootAttrs['requiredextensions'] = 'p';
        }
        // If Triangle Sets are used, declare namespace and recommend extension
        const usesTriangleSets = this.objects.some(o => 'mesh' in o && o.triangleSets && o.triangleSets.length > 0);
        if (usesTriangleSets) {
            rootAttrs['xmlns:t'] = 'http://schemas.microsoft.com/3dmanufacturing/trianglesets/2021/07';
            // recommendedextensions: add 't' (do not duplicate)
            const current = rootAttrs['recommendedextensions'];
            const rec = current ? `${current} t` : 't';
            rootAttrs['recommendedextensions'] = rec;
        }
        // If Materials extension (color groups or textures) are used, declare namespace and recommend extension
        const usesMaterials = (this.colorGroups.length > 0) || (this.textures.length > 0) || (this.textureGroups.length > 0) || (this.compositeMaterials.length > 0) || (this.multiMaterials.length > 0);
        if (usesMaterials) {
            rootAttrs['xmlns:m'] = 'http://schemas.microsoft.com/3dmanufacturing/material/2015/02';
            const current = rootAttrs['recommendedextensions'];
            const rec = current ? `${current} m` : 'm';
            rootAttrs['recommendedextensions'] = rec;
        }
        const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele('model', rootAttrs);
        // metadata
        for (const m of this.metadata) {
            const meta = doc.ele('metadata', { name: m.name });
            meta.txt(m.value);
        }
        const resources = doc.ele('resources');
        // basematerials
        for (const bm of this.baseMaterials) {
            const bmEl = resources.ele('basematerials', { id: bm.id });
            for (const base of bm.bases) {
                bmEl.ele('base', { name: base.name, displaycolor: base.displaycolor });
            }
        }
        // Materials extension: color groups
        if (usesMaterials && this.colorGroups.length > 0) {
            for (const g of this.colorGroups) {
                const cgEl = resources.ele('m:colorgroup', { id: g.id });
                for (const c of g.colors) {
                    const attrs = { value: c.value };
                    if (c.name)
                        attrs['name'] = c.name;
                    cgEl.ele('m:color', attrs);
                }
            }
        }
        // Materials/Textures extension: texture2d resources
        if (usesMaterials && this.textures.length > 0) {
            for (const t of this.textures) {
                resources.ele('m:texture2d', { id: t.id, path: t.path, contenttype: t.contentType });
            }
        }
        // Materials/Textures extension: texture2dgroup with UV coords
        if (usesMaterials && this.textureGroups.length > 0) {
            for (const g of this.textureGroups) {
                const attrs = { id: g.id, texid: g.texid };
                if (g.tilestyleu)
                    attrs['tilestyleu'] = g.tilestyleu;
                if (g.tilestylev)
                    attrs['tilestylev'] = g.tilestylev;
                if (g.filter)
                    attrs['filter'] = g.filter;
                const ge = resources.ele('m:texture2dgroup', attrs);
                for (const c of g.coords) {
                    ge.ele('m:tex2coord', { u: c.u, v: c.v });
                }
            }
        }
        // Materials/Property resources: compositematerials
        if (usesMaterials && this.compositeMaterials.length > 0) {
            for (const cm of this.compositeMaterials) {
                const cme = resources.ele('m:compositematerials', { id: cm.id, pid: cm.pid });
                for (const comp of cm.composites) {
                    cme.ele('m:composite', { values: comp.values.join(' ') });
                }
            }
        }
        // Materials/Property resources: multimaterials
        if (usesMaterials && this.multiMaterials.length > 0) {
            for (const mm of this.multiMaterials) {
                const attrs = { id: mm.id, pids: mm.pids.join(' ') };
                const mme = resources.ele('m:multimaterials', attrs);
                for (const entry of mm.entries) {
                    mme.ele('m:multimaterial', { pindices: entry.pindices.join(' ') });
                }
            }
        }
        // objects
        for (const obj of this.objects) {
            const commonAttrs = { id: obj.id, type: obj.type };
            if ('name' in obj && obj.name)
                commonAttrs['name'] = obj.name;
            if ('pid' in obj && obj.pid !== undefined)
                commonAttrs['pid'] = obj.pid;
            if ('pindex' in obj && obj.pindex !== undefined)
                commonAttrs['pindex'] = obj.pindex;
            if (this.useProduction && obj.uuid)
                commonAttrs['p:UUID'] = obj.uuid;
            const objectEl = resources.ele('object', commonAttrs);
            if ('mesh' in obj) {
                const meshEl = objectEl.ele('mesh');
                const verticesEl = meshEl.ele('vertices');
                for (const [x, y, z] of obj.mesh.vertices) {
                    verticesEl.ele('vertex', { x, y, z });
                }
                const trianglesEl = meshEl.ele('triangles');
                for (let i = 0; i < obj.mesh.triangles.length; i++) {
                    const [v1, v2, v3] = obj.mesh.triangles[i];
                    const triAttrs = { v1, v2, v3 };
                    const mat = obj.triangleMaterials?.get(i);
                    if (mat) {
                        if (mat.pid !== undefined)
                            triAttrs['pid'] = mat.pid;
                        if (mat.p1 !== undefined)
                            triAttrs['p1'] = mat.p1;
                        if (mat.p2 !== undefined)
                            triAttrs['p2'] = mat.p2;
                        if (mat.p3 !== undefined)
                            triAttrs['p3'] = mat.p3;
                    }
                    trianglesEl.ele('triangle', triAttrs);
                }
                // Triangle Sets extension
                if (obj.triangleSets && obj.triangleSets.length > 0) {
                    const setsEl = meshEl.ele('t:trianglesets');
                    for (const set of obj.triangleSets) {
                        const setEl = setsEl.ele('t:triangleset', { name: set.name, identifier: set.identifier });
                        for (const r of set.refs) {
                            if (typeof r === 'number') {
                                setEl.ele('t:ref', { index: r });
                            }
                            else {
                                setEl.ele('t:refrange', { startindex: r.startindex, endindex: r.endindex });
                            }
                        }
                    }
                }
            }
            else {
                const compsEl = objectEl.ele('components');
                for (const c of obj.components) {
                    const cAttrs = { objectid: c.objectid };
                    if (c.transform)
                        cAttrs['transform'] = c.transform.join(' ');
                    if (this.useProduction && c.uuid)
                        cAttrs['p:UUID'] = c.uuid;
                    if (this.useProduction && c.path)
                        cAttrs['p:path'] = c.path.startsWith('/') ? c.path : `/${c.path}`;
                    compsEl.ele('component', cAttrs);
                }
            }
            // Object-level thumbnail attribute
            if ('thumbnailPath' in obj && obj.thumbnailPath) {
                objectEl.att('thumbnail', obj.thumbnailPath);
            }
            // Object partnumber
            if ('partnumber' in obj && obj.partnumber) {
                objectEl.att('partnumber', obj.partnumber);
            }
        }
        const buildAttrs = {};
        const buildEl = doc.ele('build', buildAttrs);
        if (this.useProduction)
            buildEl.att('p:UUID', uuidv4());
        for (const item of this.buildItems) {
            const itemAttrs = { objectid: item.objectid };
            if (item.transform)
                itemAttrs['transform'] = item.transform.join(' ');
            if (item.path)
                itemAttrs['p:path'] = item.path;
            if (this.useProduction && item.uuid)
                itemAttrs['p:UUID'] = item.uuid;
            if (item.partnumber)
                itemAttrs['partnumber'] = item.partnumber;
            buildEl.ele('item', itemAttrs);
        }
        return doc.end({ prettyPrint: true });
    }
    buildContentTypesXml() {
        const doc = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('Types', {
            xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types',
        });
        doc.ele('Default', {
            Extension: 'rels',
            ContentType: 'application/vnd.openxmlformats-package.relationships+xml',
        });
        doc.ele('Default', {
            Extension: 'model',
            ContentType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
        });
        doc.ele('Default', { Extension: 'png', ContentType: 'image/png' });
        doc.ele('Default', { Extension: 'jpg', ContentType: 'image/jpeg' });
        // Extra content types for custom parts
        for (const [ext, ct] of this.extraContentTypes) {
            doc.ele('Default', { Extension: ext, ContentType: ct });
        }
        // Overrides for model parts (root and externals)
        doc.ele('Override', {
            PartName: '/3D/3dmodel.model',
            ContentType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
        });
        for (const ext of this.externalModels) {
            doc.ele('Override', {
                PartName: `/${ext.path}`,
                ContentType: 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
            });
        }
        return doc.end({ prettyPrint: true });
    }
    buildRootRelsXml() {
        const doc = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('Relationships', {
            xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
        });
        doc.ele('Relationship', {
            Id: 'rel-model',
            Type: 'http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel',
            Target: '/3D/3dmodel.model',
        });
        if (this.thumbnail) {
            doc.ele('Relationship', {
                Id: 'rel-thumb',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail',
                Target: `/${this.thumbnailDir}/thumbnail.${this.thumbnailExt}`,
            });
        }
        // MustPreserve relationships
        let m = 1;
        for (const p of this.preserveParts) {
            doc.ele('Relationship', {
                Id: `rel-preserve-${m++}`,
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/mustpreserve',
                Target: p.path,
            });
        }
        return doc.end({ prettyPrint: true });
    }
    buildModelRelsXml() {
        const hasObjectThumbs = this.objectThumbnails.size > 0;
        if (this.externalModels.length === 0 && !hasObjectThumbs)
            return undefined;
        const doc = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('Relationships', {
            xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
        });
        let i = 1;
        for (const ext of this.externalModels) {
            doc.ele('Relationship', {
                Id: `rel-ext-${i++}`,
                Type: 'http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel',
                Target: `/${ext.path}`,
            });
        }
        // Object thumbnails relationships (from model part)
        let t = 1;
        for (const [objId, thumb] of this.objectThumbnails) {
            doc.ele('Relationship', {
                Id: `rel-thumb-obj-${t++}`,
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail',
                Target: thumb.path,
            });
        }
        return doc.end({ prettyPrint: true });
    }
    async to3MF() {
        const zip = new JSZip();
        zip.file('[Content_Types].xml', this.buildContentTypesXml());
        zip.folder('_rels').file('.rels', this.buildRootRelsXml());
        zip.folder('3D').file('3dmodel.model', this.buildModelXml());
        const modelRels = this.buildModelRelsXml();
        if (modelRels) {
            zip.folder('3D/_rels').file('3dmodel.model.rels', modelRels);
        }
        // external models
        for (const ext of this.externalModels) {
            const rootAttrs = {
                xmlns: 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02',
            };
            if (this.useProduction) {
                rootAttrs['xmlns:p'] = 'http://schemas.microsoft.com/3dmanufacturing/production/2015/06';
            }
            const doc = create({ version: '1.0', encoding: 'UTF-8' }).ele('model', rootAttrs);
            const resources = doc.ele('resources');
            for (const bm of ext.baseMaterials) {
                const bmEl = resources.ele('basematerials', { id: bm.id });
                for (const base of bm.bases) {
                    if (!base)
                        continue;
                    bmEl.ele('base', { name: base.name, displaycolor: base.displaycolor });
                }
            }
            for (const obj of ext.objects) {
                const attrs = { id: obj.id, type: obj.type };
                if ('name' in obj && obj.name)
                    attrs['name'] = obj.name;
                if ('pid' in obj && obj.pid !== undefined)
                    attrs['pid'] = obj.pid;
                if ('pindex' in obj && obj.pindex !== undefined)
                    attrs['pindex'] = obj.pindex;
                if (this.useProduction && obj.uuid)
                    attrs['p:UUID'] = obj.uuid;
                const objectEl = resources.ele('object', attrs);
                const meshEl = objectEl.ele('mesh');
                const verticesEl = meshEl.ele('vertices');
                for (const [x, y, z] of obj.mesh.vertices) {
                    verticesEl.ele('vertex', { x, y, z });
                }
                const trianglesEl = meshEl.ele('triangles');
                for (const [v1, v2, v3] of obj.mesh.triangles) {
                    trianglesEl.ele('triangle', { v1, v2, v3 });
                }
            }
            // build empty per guidance
            doc.ele('build');
            const xml = doc.end({ prettyPrint: true });
            zip.file(ext.path, xml);
        }
        if (this.thumbnail) {
            zip.folder(this.thumbnailDir).file(`thumbnail.${this.thumbnailExt}`, this.thumbnail);
        }
        // Write textures
        for (const t of this.textures) {
            const targetPath = t.path.startsWith('/') ? t.path.substring(1) : t.path;
            const parts = targetPath.split('/');
            const fname = parts.pop();
            const dir = parts.join('/') || '';
            zip.folder(dir).file(fname, t.data);
        }
        // Write object thumbnails
        for (const [, thumb] of this.objectThumbnails) {
            const targetPath = thumb.path.startsWith('/') ? thumb.path.substring(1) : thumb.path;
            const [dir, file] = (() => {
                const parts = targetPath.split('/');
                const fname = parts.pop();
                const d = parts.join('/') || '';
                return [d, fname];
            })();
            zip.folder(dir).file(file, thumb.data);
        }
        // Write preserve parts
        for (const p of this.preserveParts) {
            const targetPath = p.path.startsWith('/') ? p.path.substring(1) : p.path;
            const parts = targetPath.split('/');
            const fname = parts.pop();
            const dir = parts.join('/') || '';
            zip.folder(dir).file(fname, p.data);
        }
        // Use uint8array for browser compatibility, nodebuffer for Node.js
        const isBrowser = typeof Buffer === 'undefined';
        const buf = await zip.generateAsync({
            type: isBrowser ? 'uint8array' : 'nodebuffer'
        });
        // Convert Uint8Array to Buffer in Node.js, or return as-is for browser
        if (isBrowser) {
            // In browser, create a Buffer polyfill from Uint8Array
            return buf;
        }
        return buf;
    }
    async writeToFile(path) {
        const buffer = await this.to3MF();
        const fs = await import('node:fs/promises');
        await fs.writeFile(path, buffer);
    }
}
