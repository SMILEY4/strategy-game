export class GLProgramWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFuncCreate: any;
    private readonly glFuncDelete: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.glFuncCreate = this.gl.createProgram;
        this.gl.createProgram = this.wrapperCreateFunc.bind(this);

        this.glFuncDelete = this.gl.deleteProgram;
        this.gl.deleteProgram = this.wrapperDeleteFunc.bind(this);
    }

    private wrapperCreateFunc(): WebGLProgram | null {
        this.counter++;
        return this.glFuncCreate.call(this.gl);
    }

    private wrapperDeleteFunc(program: WebGLProgram | null): void {
        this.counter--;
        this.glFuncDelete.call(this.gl, program);
    }

    public getCount(): number {
        return this.counter;
    }

}
