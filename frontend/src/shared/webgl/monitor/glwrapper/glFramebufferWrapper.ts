export class GLFramebufferWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFuncCreate: any;
    private readonly glFuncDelete: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.glFuncCreate = this.gl.createFramebuffer;
        this.gl.createFramebuffer = this.wrapperCreateFunc.bind(this);

        this.glFuncDelete = this.gl.deleteFramebuffer;
        this.gl.deleteFramebuffer = this.wrapperDeleteFunc.bind(this);
    }

    private wrapperCreateFunc(): WebGLFramebuffer | null {
        this.counter++;
        return this.glFuncCreate.call(this.gl);
    }

    private wrapperDeleteFunc(framebuffer: WebGLFramebuffer | null): void {
        this.counter--;
        this.glFuncDelete.call(this.gl, framebuffer);
    }

    public getCount(): number {
        return this.counter;
    }

}
