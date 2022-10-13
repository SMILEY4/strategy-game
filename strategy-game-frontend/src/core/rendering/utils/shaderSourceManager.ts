export class ShaderSourceManager {

    private readonly sources = new Map<string, string>();

    public add(key: string, source: string): ShaderSourceManager {
        this.sources.set(key, source);
        return this;
    }

    public resolve(key: string): string {
        const source = this.sources.get(key);
        if (source) {
            return source;
        } else {
            throw new Error("Could not find source for shader with key " + key);
        }
    }

}