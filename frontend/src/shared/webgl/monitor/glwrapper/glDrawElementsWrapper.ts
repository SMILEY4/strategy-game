export class GLDrawElementsWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFunc: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.glFunc = this.gl.drawElements;
        this.gl.drawElements = this.wrapperFunc.bind(this);
    }

    private wrapperFunc(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr): void {
        this.glFunc.call(this.gl, mode, count, type, offset);
        this.counter++;
    }

    public getCount(): number {
        return this.counter;
    }

    public reset() {
        this.counter = 0
    }

}
