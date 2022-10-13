interface ShaderSourceModule {
    identifier: string;
    source: string;
}

export class ShaderSourceManager {

    private readonly MODULE_DEF_START = new RegExp("#pragma module\\((.*)\\)");
    private readonly MODULE_DEF_END = new RegExp("#pragma endModule");
    private readonly MODULE_DEF_USE = new RegExp("#pragma useModule\\((.*)\\)");

    private readonly sources = new Map<string, string>();
    private readonly modules = new Map<string, ShaderSourceModule>();


    public add(key: string, source: string): ShaderSourceManager {
        this.sources.set(key, source);
        this.analyzeModuleDefinitions(key, source).forEach(module => {
            this.modules.set(module.identifier, module);
        });
        return this;
    }


    public resolve(key: string): string {
        const source = this.sources.get(key);
        if (source) {
            return this.insertModules(source);
        } else {
            throw new Error("Could not find source for shader with key " + key);
        }
    }


    private resolveModule(identifier: string): string {
        const module = this.modules.get(identifier);
        if (module) {
            return this.insertModules(module.source);
        } else {
            throw new Error("Could not find source for shader-module with identifier " + identifier);
        }
    }


    private insertModules(source: string): string {
        const rawLines = source.split(/\r\n|\n\r|\n|\r/);
        const procLines: string[] = [];

        for (let i = 0; i < rawLines.length; i++) {
            const line = rawLines[i].trim();
            const matchesModuleUser = this.MODULE_DEF_USE.exec(line);
            if (matchesModuleUser) {
                const moduleIdentifier = matchesModuleUser[1];
                const moduleSource = this.resolveModule(moduleIdentifier);
                procLines.push(moduleSource);
            } else {
                procLines.push(line);
            }
        }

        return procLines.join("\n");
    }


    private analyzeModuleDefinitions(key: string, source: string): ShaderSourceModule[] {
        const lines = source.split(/\r\n|\n\r|\n|\r/);

        const modules: ShaderSourceModule[] = [];

        let currentModuleStartIndex: number | null = null;
        let currentModuleName: string | null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const matchesModuleStart = this.MODULE_DEF_START.exec(line);
            const matchesModuleEnd = this.MODULE_DEF_END.exec(line);
            if (matchesModuleStart) {
                if (currentModuleStartIndex === null) {
                    currentModuleStartIndex = i;
                    currentModuleName = matchesModuleStart[1];
                } else {
                    throw new Error("Error in glsl module-definitions: missing module-end in " + key + " @" + i + ": " + line);
                }
            }
            if (matchesModuleEnd) {
                if (currentModuleStartIndex === null) {
                    throw new Error("Error in glsl module-definitions: missing module-start in " + key + " @" + i + ": " + line);
                } else {
                    modules.push({
                        identifier: currentModuleName!!,
                        source: lines.slice(currentModuleStartIndex + 1, i).join("\n")
                    });
                    currentModuleStartIndex = null;
                    currentModuleName = null;
                }
            }
        }

        return modules;
    }

}
