export class GLBufferWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFuncCreate: any;
    private readonly glFuncDelete: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.glFuncCreate = this.gl.createBuffer;
        this.gl.createBuffer = this.wrapperCreateFunc.bind(this);

        this.glFuncDelete = this.gl.deleteBuffer;
        this.gl.deleteBuffer = this.wrapperDeleteFunc.bind(this);
    }

    private wrapperCreateFunc(): WebGLBuffer | null {
        this.counter++;
        return this.glFuncCreate.call(this.gl);
    }

    private wrapperDeleteFunc(buffer: WebGLBuffer | null): void {
        this.counter--;
        this.glFuncDelete.call(this.gl, buffer);
    }

    public getCount(): number {
        return this.counter;
    }

}
