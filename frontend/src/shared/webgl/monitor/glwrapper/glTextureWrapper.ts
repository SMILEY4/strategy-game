export class GLTextureWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFuncCreate: any;
    private readonly glFuncDelete: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.glFuncCreate = this.gl.createTexture;
        this.gl.createTexture = this.wrapperCreateFunc.bind(this);

        this.glFuncDelete = this.gl.deleteTexture;
        this.gl.deleteTexture = this.wrapperDeleteFunc.bind(this);
    }

    private wrapperCreateFunc(): WebGLTexture | null {
        this.counter++;
        return this.glFuncCreate.call(this.gl);
    }

    private wrapperDeleteFunc(texture: WebGLTexture | null): void {
        this.counter--;
        this.glFuncDelete.call(this.gl, texture);
    }

    public getCount(): number {
        return this.counter;
    }

}
