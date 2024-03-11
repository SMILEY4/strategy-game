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

    public process(): void {
        this.sources.forEach((src, id) => {
            this.sources.set(id, this.processShader(src))
        })
    }

    private processShader(source: string): string {
        let procSource = source;
        this.sources.forEach((src, id) => {
            procSource = procSource.replaceAll("#include " + id, src)
        })
        return procSource;
    }

}