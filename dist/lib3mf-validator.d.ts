/**
 * lib3mf-validator.ts
 * Wrapper for validating 3MF files using the official lib3mf (via @tensorgrad/lib3mf WASM)
 */
export interface ValidationResult {
    ok: boolean;
    errors: ValidationError[];
    warnings: string[];
}
export interface ValidationError {
    code: number;
    message: string;
    context?: string;
}
/**
 * Validate a 3MF file buffer using lib3mf
 * Checks structure, references, indices, and conformance to 3MF spec
 */
export declare function validate3MF(buffer: Buffer): Promise<ValidationResult>;
/**
 * Format validation result as human-readable text
 */
export declare function formatValidationResult(result: ValidationResult): string;
