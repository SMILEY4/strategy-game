import {RenderCommand} from "../graph/renderCommand";
import {WebGLResourceManager} from "./webGLResourceManager";
import {GLFramebuffer} from "../../../shared/webgl/glFramebuffer";
import {ProgramUniformEntry} from "./programUniformEntry";
import {VertexDataResource} from "../graph/vertexRenderNode";
import {BaseRenderer} from "../../../shared/webgl/baseRenderer";

export namespace WebGLRenderCommand {

    export interface Context {
        gl: WebGL2RenderingContext,
        renderer: BaseRenderer
    }

    /**
     * base webgl command
     */
    export interface Base extends RenderCommand<WebGLResourceManager, Context> {
    }


    /**
     * Update data of a vertex buffer
     */
    export class UpdateVertexBufferData implements Base {
        private readonly action: () => VertexDataResource;

        constructor(action: () => VertexDataResource) {
            this.action = action;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            const modified = this.action();
            if (modified.buffers.size > 0) {
                for (let [modifiedId, modifiedData] of modified.buffers) {
                    const buffer = resourceManager.getVertexBuffer(modifiedId).buffer;
                    buffer.bind();
                    buffer.setData(modifiedData.data);
                }
            }
            if (modified.outputs.size > 0) {
                for (let [modifiedId, modifiedData] of modified.outputs) {
                    const data = resourceManager.getVertexData(modifiedId);
                    data.vertexCount = modifiedData.vertexCount;
                    data.instanceCount = modifiedData.instanceCount;
                }
            }
        }

    }

    /**
     * Bind a render-target to start rendering to  it
     */
    export class BindFramebuffer implements Base {

        private readonly name: string;

        constructor(name: string) {
            this.name = name;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            resourceManager.getFramebuffer(this.name).framebuffer.bind();
        }
    }

    /**
     * Unbind the active render-target to stop rendering to it
     */
    export class UnbindFramebuffer implements Base {

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            GLFramebuffer.unbind(context.gl);
        }
    }

    /**
     * Bind a texture to the given texture textureUnit
     */
    export class BindTexture implements Base {

        private readonly name: string;
        private readonly textureUnit: number;

        constructor(name: string, slot: number) {
            this.name = name;
            this.textureUnit = slot;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            resourceManager.getTexture(this.name).texture.bind(this.textureUnit);
        }
    }

    /**
     * Bind the texture of a render-target to the given texture textureUnit
     */
    export class BindFramebufferTexture implements Base {

        private readonly name: string;
        private readonly textureUnit: number;

        constructor(name: string, slot: number) {
            this.name = name;
            this.textureUnit = slot;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            resourceManager.getFramebuffer(this.name).framebuffer.bindTexture(this.textureUnit);
        }
    }

    /**
     * Bind a vertex-array to render it
     */
    export class BindVertexArray implements Base {

        private readonly name: string;
        private readonly vertex: string;
        private readonly fragment: string;

        constructor(name: string, vertex: string, fragment: string) {
            this.name = name;
            this.vertex = vertex;
            this.fragment = fragment;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            const programId = resourceManager.getProgramId(this.vertex, this.fragment);
            resourceManager.getVertexData(this.name).vertexArrays.get(programId)?.bind();
        }
    }

    /**
     * Unbind a vertex-array to stop using it
     */
    export class UnbindVertexArray implements Base {

        private readonly name: string;
        private readonly vertex: string;
        private readonly fragment: string;

        constructor(name: string, vertex: string, fragment: string) {
            this.name = name;
            this.vertex = vertex;
            this.fragment = fragment;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            const programId = resourceManager.getProgramId(this.vertex, this.fragment);
            resourceManager.getVertexData(this.name).vertexArrays.get(programId)?.unbind();

        }
    }

    /**
     * Start using the shader
     */
    export class UseShader implements Base {

        private readonly vertex: string;
        private readonly fragment: string;

        constructor(vertex: string, fragment: string) {
            this.vertex = vertex;
            this.fragment = fragment;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            resourceManager.getProgram(this.vertex, this.fragment).program.use();
        }
    }

    /**
     * Set the shader uniform values
     */
    export class SetUniforms implements Base {

        private readonly uniforms: ProgramUniformEntry[];
        private readonly vertex: string;
        private readonly fragment: string;


        constructor(uniforms: ProgramUniformEntry[], vertex: string, fragment: string) {
            this.uniforms = uniforms;
            this.vertex = vertex;
            this.fragment = fragment;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            const program = resourceManager.getProgram(this.vertex, this.fragment).program;
            for (let i = 0; i < this.uniforms.length; i++) {
                const uniform = this.uniforms[i];
                if (uniform.valueConstant !== null) {
                    program.setUniform(uniform.binding, uniform.type, uniform.valueConstant);
                }
                if (uniform.valueProvider !== null) {
                    program.setUniform(uniform.binding, uniform.type, uniform.valueProvider());
                }
            }
        }
    }

    /**
     * Make a draw call
     */
    export class Draw implements Base {

        private readonly vertexDataId: string;


        constructor(vertexDataId: string) {
            this.vertexDataId = vertexDataId;
        }

        public execute(resourceManager: WebGLResourceManager, context: Context): void {
            const data = resourceManager.getVertexData(this.vertexDataId);
            switch (data.type) {
                case "basic": {
                    context.renderer.draw(data.vertexCount);
                    break;
                }
                case "instanced": {
                    context.renderer.drawInstanced(data.vertexCount, data.instanceCount);
                    break;
                }
            }
        }
    }


}