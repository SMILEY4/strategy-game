export class GLDrawElementsInstancedWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFunc: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.glFunc = this.gl.drawElementsInstanced;
        this.gl.drawElementsInstanced = this.wrapperFunc.bind(this);
    }

    private wrapperFunc(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, instanceCount: GLsizei): void {
        this.glFunc.call(this.gl, mode, count, type, offset, instanceCount);
        this.counter++;
    }

    public getCount(): number {
        return this.counter;
    }

    public reset() {
        this.counter = 0
    }

}
