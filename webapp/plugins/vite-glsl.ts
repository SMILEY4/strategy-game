import path from "path";
import type {Plugin} from "vite";
import fs from "fs";

export function glsl(): Plugin {
    return {
        name: "vite-glsl",
        enforce: "pre",
        transform(rawCode, id) {
            if (/\.(vsh|fsh|glsl)(\?raw)?$/.test(id)) {
                try {
                    const {code, dependencies} = process(id.split("?")[0], rawCode);
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

function process(file: string, source: string): { code: string, dependencies: Set<string> } {
    const { code, dependencies } = processIncludes(file, source)
    return {
        code: code,
        dependencies: dependencies
    }
}

function processIncludes(
    file: string,
    source: string,
    includedFiles: Set<string> = new Set()
): { code: string, dependencies: Set<string> } {

    console.log("[glsl] processing", file)

    includedFiles.add(file)
    const directory = path.dirname(file)

    const includeRegex = /^\s*#include\s+["']([^"']+)["']/gm;
    const resolvedCode = source.replace(includeRegex, (_, relativePath: string) => {
        const fullPath = path.resolve(directory, relativePath)

        if(!fs.existsSync(fullPath)) {
            throw new Error(`[glsl] File not found: "${fullPath}" (included from "${file}")`);
        }

        if (includedFiles.has(fullPath)) {
            return `// Circular include omitted: ${relativePath}`;
        }

        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const result = processIncludes(fullPath, fileContent, includedFiles);
        return result.code;
    })

    return {
        code: resolvedCode,
        dependencies: includedFiles,
    };
}