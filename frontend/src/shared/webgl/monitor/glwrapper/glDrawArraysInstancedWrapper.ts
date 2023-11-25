export class GLDrawArraysInstancedWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFunc: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.glFunc = this.gl.drawArraysInstanced;
        this.gl.drawArraysInstanced = this.wrapperFunc.bind(this);
    }

    private wrapperFunc(mode: GLenum, first: GLint, count: GLsizei, instanceCount: GLsizei): void {
        this.glFunc.call(this.gl, mode, first, count, instanceCount);
        this.counter++;
    }

    public getCount(): number {
        return this.counter;
    }

    public reset() {
        this.counter = 0
    }
}
