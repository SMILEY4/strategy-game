import Texture from "./texture";

export interface TextEntry {
    text: string,
    width: number,
    height: number,
    color: string,
    font: string,
    align: CanvasTextAlign,
    baseline: CanvasTextBaseline,
    shadowBlur: number,
    shadowColor: string
}

export interface TextEntryRegion {
    u0: number,
    v0: number,
    u1: number,
    v1: number,
}

export class TextRenderer {

    private readonly gl: WebGL2RenderingContext;
    private readonly textContext: CanvasRenderingContext2D;
    private readonly regionMap = new Map<string, TextEntryRegion>();
    private readonly entryMap = new Map<string, TextEntry>();
    private texture: Texture | null = null;


    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.textContext = TextRenderer.makeTextCanvasContext();
    }

    private static makeTextCanvasContext(): CanvasRenderingContext2D {
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx) {
            return ctx;
        } else {
            throw Error("Could not create text canvas context");
        }
    }

    public getTexture(): Texture | null {
        return this.texture;
    }

    public getRegion(id: string): TextEntryRegion | undefined {
        return this.regionMap.get(id);
    }

    public addText(entries: ({ id: string, entry: TextEntry })[]) {
        entries.forEach(e => this.entryMap.set(e.id, e.entry));
        this.update();
    }

    public addTextIfNotExists(entries: ({ id: string, entry: TextEntry })[]) {
        entries
            .filter(e => !this.entryMap.get(e.id))
            .forEach(e => this.entryMap.set(e.id, e.entry));
        this.update();
    }

    public removeText(ids: string[]) {
        ids.forEach(id => this.entryMap.delete(id));
        this.update();
    }

    private update() {
        if (this.texture != null) {
            this.texture.dispose();
        }
        this.prepareCanvas([...this.entryMap.values()]);
        this.repaintCanvas(this.entryMap);
        this.texture = Texture.createFromCanvas(this.gl, this.textContext.canvas);
    }

    private prepareCanvas(entries: TextEntry[]) {
        const canvasWidth = entries.length === 0 ? 1 : Math.max(...entries.map(e => e.width));
        const canvasHeight = entries.length === 0 ? 1 : entries.map(e => e.height).reduce((a, b) => a + b, 0);
        this.textContext.canvas.width = canvasWidth;
        this.textContext.canvas.height = canvasHeight;
        this.textContext.clearRect(0, 0, this.textContext.canvas.width, this.textContext.canvas.height);
    }

    private repaintCanvas(entries: Map<string, TextEntry>) {
        this.regionMap.clear();
        let yOffset: number = 0;
        entries.forEach((entry, id) => {
            this.paintEntry(entry, yOffset);
            this.regionMap.set(id, this.buildRegion(entry, yOffset));
            yOffset += entry.height;
        });
    }

    private paintEntry(entry: TextEntry, yOffset: number) {
        this.textContext.font = entry.font;
        this.textContext.textAlign = entry.align;
        this.textContext.textBaseline = entry.baseline;
        this.textContext.fillStyle = entry.color;
        this.textContext.shadowBlur = entry.shadowBlur;
        this.textContext.shadowColor = entry.shadowColor;
        this.textContext.fillText(entry.text, entry.width / 2, yOffset + entry.height / 2, entry.width);
    }

    private buildRegion(entry: TextEntry, yOffset: number): TextEntryRegion {
        const totalWidth = this.textContext.canvas.width;
        const totalHeight = this.textContext.canvas.height;
        return {
            u0: (0) / totalWidth,
            v0: 1 - ((yOffset + entry.height) / totalHeight),
            u1: (entry.width) / totalWidth,
            v1: 1 - ((yOffset) / totalHeight),
        };
    }

    public dispose() {
        if (this.texture !== null) {
            this.texture.dispose();
        }
    }

}