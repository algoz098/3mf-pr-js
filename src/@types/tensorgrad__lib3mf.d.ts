/**
 * Type declarations for @tensorgrad/lib3mf (WASM module)
 * Based on lib3mf 2.4.1 API
 */

declare module '@tensorgrad/lib3mf' {
  export interface Lib3MFVersion {
    Major: number;
    Minor: number;
    Micro: number;
  }

  export interface Transform {
    Fields: number[];
  }

  export interface Triangle {
    Indices: [number, number, number];
  }

  export interface Lib3MFModel {
    QueryReader(extension: string): Lib3MFReader;
    QueryWriter(extension: string): Lib3MFWriter;
    GetResources(): Lib3MFResourceIterator; // Returns iterator directly
    GetBuildItems(): Lib3MFBuildItemIterator; // Returns iterator directly
    Release(): void;
  }

  export interface Lib3MFReader {
    ReadFromFile(filename: string): void;
    Release(): void;
  }

  export interface Lib3MFWriter {
    WriteToFile(filename: string): void;
    Release(): void;
  }

  export interface Lib3MFResourceIterator {
    MoveNext(): boolean;
    Clone(): Lib3MFResourceIterator;
    GetCurrent(): Lib3MFResource;
    Release(): void;
  }

  export interface Lib3MFResource {
    IsMeshObject(): boolean;
    IsComponentsObject(): boolean;
    IsTexture2DObject(): boolean;
    IsBaseMaterialGroup(): boolean;
    GetResourceID(): number;
    AsMeshObject(): Lib3MFMeshObject;
    Release(): void;
  }

  export interface Lib3MFMeshObject extends Lib3MFResource {
    GetMesh(): Lib3MFMesh;
  }

  export interface Lib3MFMesh {
    GetVertexCount(): number;
    GetTriangleCount(): number;
    GetTriangle(index: number): Triangle;
    GetVertex(index: number): { Coordinates: [number, number, number] };
    Release(): void;
  }

  export interface Lib3MFBuildItemIterator {
    MoveNext(): boolean;
    Clone(): Lib3MFBuildItemIterator;
    GetCurrent(): Lib3MFBuildItem;
    Release(): void;
  }

  export interface Lib3MFBuildItem {
    GetObjectResource(): Lib3MFResource;
    GetHandle(): number;
    Release(): void;
  }

  export interface CWrapper {
    GetLibraryVersion(): Lib3MFVersion;
    GetPrereleaseInformation(): string;
    GetBuildInformation(): string;
    GetSpecificationVersion(): Lib3MFVersion;
    CreateModel(): Lib3MFModel;
    Release(): void;
  }

  export interface Lib3MFModule extends EmscriptenModule {
    CWrapper: new () => CWrapper;
  }

  export interface EmscriptenModule {
    FS: EmscriptenFS;
  }

  export interface EmscriptenFS {
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string): Uint8Array;
    unlink(path: string): void;
  }

  export default function lib3mfFactory(): Promise<Lib3MFModule>;
}
