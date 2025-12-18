/**
 * lib3mf-validator.ts
 * Wrapper for validating 3MF files using the official lib3mf (via @tensorgrad/lib3mf WASM)
 */
import lib3mfFactory from '@tensorgrad/lib3mf';
/**
 * Validate a 3MF file buffer using lib3mf
 * Checks structure, references, indices, and conformance to 3MF spec
 */
export async function validate3MF(buffer) {
    const Module = await lib3mfFactory();
    const wrapper = new Module.CWrapper();
    const errors = [];
    const warnings = [];
    let model;
    try {
        // Create a model instance
        model = wrapper.CreateModel();
        // Write buffer to lib3mf's virtual filesystem
        const filename = '/temp.3mf';
        Module.FS.writeFile(filename, new Uint8Array(buffer));
        let reader;
        try {
            // Create a reader
            reader = model.QueryReader('3mf');
            // Read and parse the 3MF file
            // This will validate the structure internally
            reader.ReadFromFile(filename);
            // If we got here without exceptions, lib3mf validated the file successfully
            // lib3mf checks:
            // - XML structure conformance
            // - Resource ID uniqueness
            // - Valid references (objectid, pid/pindex)
            // - Triangle vertex indices in bounds
            // - Required relationships exist
            // - Proper ZIP/OPC structure
            warnings.push('File passed lib3mf structural validation');
        }
        catch (readError) {
            // lib3mf throws exceptions on invalid files
            errors.push({
                code: 100,
                message: readError.message || String(readError),
                context: 'Failed to read/parse 3MF file'
            });
        }
        finally {
            // Ensure reader instance is deleted to avoid Embind leak warnings
            try {
                if (reader && typeof reader.delete === 'function')
                    reader.delete();
            }
            catch { }
            // Cleanup virtual filesystem
            try {
                Module.FS.unlink(filename);
            }
            catch { }
        }
    }
    catch (err) {
        errors.push({
            code: 999,
            message: err.message || String(err),
            context: 'lib3mf initialization or runtime error'
        });
    }
    finally {
        // Ensure model instance is deleted to avoid Embind leak warnings
        try {
            if (model && typeof model.delete === 'function')
                model.delete();
        }
        catch { }
    }
    return {
        ok: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Format validation result as human-readable text
 */
export function formatValidationResult(result) {
    const lines = [];
    if (result.ok) {
        lines.push('✓ 3MF file is valid');
    }
    else {
        lines.push('✗ 3MF validation failed');
    }
    if (result.errors.length > 0) {
        lines.push('\nErrors:');
        for (const error of result.errors) {
            lines.push(`  [${error.code}] ${error.message}`);
            if (error.context) {
                lines.push(`       ${error.context}`);
            }
        }
    }
    if (result.warnings.length > 0) {
        lines.push('\nWarnings:');
        for (const warning of result.warnings) {
            lines.push(`  - ${warning}`);
        }
    }
    return lines.join('\n');
}
