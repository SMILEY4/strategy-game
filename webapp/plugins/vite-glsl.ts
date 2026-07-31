import path from "path";
import type {Plugin} from "vite";
import fs from "fs";
import { spawnSync } from 'node:child_process';

export function glsl(): Plugin {
    return {
        name: "vite-glsl",
        enforce: "pre",
        async transform(rawCode, id) {
            if (/\.(vsh|fsh|glsl)(\?raw)?$/.test(id)) {
                try {
                    const {code, dependencies} = await process(id.split("?")[0], rawCode);
                    dependencies.forEach(file => this.addWatchFile(file));
                    return {
                        code: `export default ${JSON.stringify(code)};`,
                        map: null,
                    };
                } catch (error) {
                    this.error(error as Error);
                }
            }
        },
    };
}

async function process(file: string, source: string): Promise<{ code: string; dependencies: Set<string>; }> {

    // process code
    const {code, dependencies} = processIncludes(file, source);

    // validate code
    const errors = await validate(file, code);
    if(errors.length > 0) {
        const errorHeader = `[glsl] Found ${errors.length} GLSL compilation error${errors.length > 1 ? 's' : ''} in ${path.basename(file)}:\n`;
        const combinedFrames = errors.map((err, idx) => {
            const header = `--- [Error ${idx + 1}/${errors.length}] Line ${err.line + 1}:${err.column} ---`;
            const msg = `${err.message}${err.symbol ? ` ('${err.symbol}')` : ''}`;
            const frame = generateCodeFrame(code, err.line, err.column);
            return `${header}\n${msg}\n\n${frame}`;
        }).join('\n\n');

        const viteError = new Error(`${errorHeader}\n${combinedFrames}`) as any;
        viteError.id = file;
        throw viteError;
    }

    return {
        code: code,
        dependencies: dependencies,
    };
}

function processIncludes(
    file: string,
    source: string,
    includedFiles: Set<string> = new Set(),
): { code: string, dependencies: Set<string> } {

    console.log("[glsl] processing includes", file);

    includedFiles.add(file);
    const directory = path.dirname(file);

    const includeRegex = /^\s*#include\s+["']([^"']+)["']/gm;
    const resolvedCode = source.replace(includeRegex, (_, relativePath: string) => {
        const fullPath = path.resolve(directory, relativePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`[glsl] File not found: "${fullPath}" (included from "${file}")`);
        }

        if (includedFiles.has(fullPath)) {
            return `// Circular include omitted: ${relativePath}`;
        }

        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const result = processIncludes(fullPath, fileContent, includedFiles);
        return result.code;
    });

    return {
        code: resolvedCode,
        dependencies: includedFiles,
    };
}


async function validate(file: string, code: string): Promise<GlslError[]> {

    // call validator
    const stage = /\.(vsh|vert)/.test(file) ? "vert" : "frag";
    const result = spawnSync("glslangValidator", ['--stdin', '-S', stage, '-C', '--error-column'], {
        input: code,
        encoding: 'utf-8',
    });

    // Handle missing binary
    if (result.error) {
        if ((result.error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.warn("[glsl-validator] WARNING: 'glslangValidator' is not installed or not in PATH. Skipping validation.");
            return [];
        }
        throw result.error;
    }

    // Parse glslang output
    const errors: GlslError[] = []
    const output = (result.stdout || '') + (result.stderr || '');
    if (result.status !== 0 || output.includes('ERROR:')) {
        errors.push(...parseGlslLog(output))
    }

    return errors;
}

function parseGlslLog(log: string): GlslError[] {
    const errorRegex = /^ERROR:\s*\d+:(\d+):(\d+):\s*'([^']*)'\s*:\s*(.+)$/gm;
    const errors: GlslError[] = [];
    let match: RegExpExecArray | null;
    while ((match = errorRegex.exec(log)) !== null) {
        errors.push({
            line: Math.max(0, parseInt(match[1], 10) - 1),
            column: parseInt(match[2], 10),
            symbol: match[3].trim(),
            message: match[4].trim(),
            code: "",
        });
    }
    return errors;
}

function generateCodeFrame(code: string, lineIndex: number, column: number): string {
    const lines = code.split('\n');
    const targetLine = lines[lineIndex];
    if (targetLine === undefined) return "";

    const lineNumberStr = `${lineIndex + 1}`;
    const padding = ' '.repeat(lineNumberStr.length);
    const pointer = ' '.repeat(Math.max(0, column - 1)) + '^';

    return `${lineNumberStr} | ${targetLine}\n${padding} | ${pointer}`;
}

export interface GlslError {
    /** 0-based line number */
    line: number;
    /** Column number */
    column: number;
    /** The specific token/symbol causing the error */
    symbol: string;
    /** Error message */
    message: string;
    /** The line of code with the error */
    code: string,
}