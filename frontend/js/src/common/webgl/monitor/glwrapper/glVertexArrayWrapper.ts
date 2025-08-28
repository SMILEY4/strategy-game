export class GLVertexArrayWrapper {

    private readonly gl: WebGL2RenderingContext;
    private readonly glFuncCreate: any;
    private readonly glFuncDelete: any;

    private counter: number = 0;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.glFuncCreate = this.gl.createVertexArray;
        this.gl.createVertexArray = this.wrapperCreateFunc.bind(this);

        this.glFuncDelete = this.gl.deleteVertexArray;
        this.gl.deleteVertexArray = this.wrapperDeleteFunc.bind(this);
    }

    private wrapperCreateFunc(): WebGLVertexArrayObject | null {
        this.counter++;
        return this.glFuncCreate.call(this.gl);
    }

    private wrapperDeleteFunc(vertexArray: WebGLVertexArrayObject | null): void {
        this.counter--;
        this.glFuncDelete.call(this.gl, vertexArray);
    }

    public getCount(): number {
        return this.counter;
    }

}
