export class WebGLShaderSourceManager {

    private readonly sources = new Map<string, string>();

    public register(id: string, source: string) {
        this.sources.set(id, source);
    }

    public get(id: string): string {
        const source = this.sources.get(id);
        if (source) {
            return source;
        } else {
            throw new Error("No shader source with id " + id);
        }
    }

}