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

export class TextRenderer {

    private readonly gl: WebGL2RenderingContext;
    private readonly textContext: CanvasRenderingContext2D;
    private readonly textureMap = new Map<string, Texture>();
    private readonly entryMap = new Map<string, TextEntry>();


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


    public getTexture(id: string): Texture | undefined {
        return this.textureMap.get(id);
    }


    public addText(id: string, entry: TextEntry) {
        const texture = this.createTexture(entry);
        this.entryMap.set(id, entry)
        this.textureMap.set(id, texture);
    }

    
    private createTexture(entry: TextEntry): Texture {
        this.textContext.canvas.width = entry.width;
        this.textContext.canvas.height = entry.height;
        this.textContext.clearRect(0, 0, this.textContext.canvas.width, this.textContext.canvas.height);
        this.textContext.font = entry.font;
        this.textContext.textAlign = entry.align;
        this.textContext.textBaseline = entry.baseline;
        this.textContext.fillStyle = entry.color;
        this.textContext.shadowBlur = 4;
        this.textContext.shadowColor = "blue";
        this.textContext.fillText(entry.text, entry.width / 2, entry.height / 2, entry.width);
        return Texture.createFromCanvas(this.gl, this.textContext.canvas);
    }

    public dispose() {
        this.textureMap.forEach((texture: Texture) => {
            texture.dispose();
        });
    }

}
