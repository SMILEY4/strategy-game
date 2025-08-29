export class GLDrawArraysWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFunc: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.glFunc = this.gl.drawArrays;
        this.gl.drawArrays = this.wrapperFunc.bind(this);
    }

    private wrapperFunc(mode: GLenum, first: GLint, count: GLsizei): void {
        this.glFunc.call(this.gl, mode, first, count);
        this.counter++;
    }

    public getCount(): number {
        return this.counter;
    }

    public reset() {
        this.counter = 0
    }

}
